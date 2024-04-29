import fs from 'fs'
import path from 'path'
import https from 'https'
import stripJsonComments from 'strip-json-comments'

/**
 * Retrieve some content over https.
 *
 * This function comes from https://github.com/microsoft/vscode-grammar-updater/blob/main/index.js
 * @param {string} url
 * @param {number} redirectCount
 * @param {Object | string | URL} options to be passed to http.get. See http.request for a complete list of accepted options
 * @returns {Promise<string | undefined>} a Promise resolving to the body of the file as a string.
 */
export function download(url, options = {}, redirectCount = 0) {
	return new Promise((c, e) => {
		var content = ''
		https.get(url, options, (response) => {
			response.setEncoding('utf8')
			response.on('data', (data) => {
				content += data
			}).on('end', () => {
				if (response.statusCode === 403 && response.headers['x-ratelimit-remaining'] === '0') {
					e('GitHub API rate exceeded. Set GITHUB_TOKEN environment variable to increase rate limit.')
					return
				}
				let count = redirectCount || 0
				if (count < 5 && response.statusCode >= 300 && response.statusCode <= 303 || response.statusCode === 307) {
					let location = response.headers['location']
					if (location) {
						console.log('Redirected ' + url + ' to ' + location)
						download(location, options, count + 1).then(c, e)
						return
					}
				}
				c(content)
			})
		}).on('error', (err) => {
			e(err.message)
		})
	})
}


/**
 * Read a file locally or from the web.
 * @param {string} fileOrUrl The url or path of the file to read.
 * @param {string} relativeDir The relative path where to find fileOrUrl. Only used when fileOrUrl is a path.
 * @returns {Promise<string | undefined>} A promise resolving to the content of the file.
 */
export async function readFile(fileOrUrl, relativeDir = '') {
    if (fileOrUrl.startsWith('https://')) {
        const content = await download(fileOrUrl)
        return content
    } else {
       try {
           const content = fs.readFileSync(path.resolve(relativeDir, fileOrUrl))
           return content.toString('utf-8')
       } catch (error) {
            console.log('Cannot read ' + fileOrUrl)
            console.log(error.message)
       }
    }
    return undefined
}

/**
 * Read a configuration as an object
 * @param {string} file The path of the configuration file relative to `relativeDir
 * @param {string} relativeDir The path where to look for file
 * @returns {promise<Object | undefined>} A Promise resolving to a dictionary
 */
export async function readConfiguration(file, relativeDir) {
    const content = await readFile(file, relativeDir)
    if (!content) {
        return undefined
    }
    try {
        const jsonContent = JSON.parse(stripJsonComments(content))
        return jsonContent
    } catch (error) {
        console.log('Cannot parse content of ' + file)
        console.log(error.message)
    }
    return undefined
}

/**
 * Expand a configuration Object by interpreting the keys `extends` and `overrides`
 * @param {Object} configuration An Object representing a configuration
 * @param {string} relativeDir The path where to look for files referenced by `extends`
 * @returns {Promise<Object | undefined>} A promise resolving to an expanded and self contained version of `configuration`
 */
export async function computeExpansion(configuration, relativeDir) {
    if (! ('extends' in configuration)) {
        return configuration
    }
    const baseConfig = await readConfiguration(configuration['extends'], relativeDir)
    if (! baseConfig) {
        console.log('Cannot open base configuration')
        return undefined
    }
    const expandedConfig = Object.assign({}, baseConfig)

    for (const key in configuration) {
        if (['extends', 'overrides'].includes(key)) {
            continue
        }
        if (key in baseConfig) {
            if (Array.isArray(baseConfig[key]) && Array.isArray(configuration[key])) {
                expandedConfig[key] = baseConfig[key].concat(configuration[key])
            } else {
                console.log('Cannot expand entry: ' + key)
            }
        } else {
            expandedConfig[key] = configuration[key]
        }
    }

    if ('overrides' in configuration) {
        const overrides = configuration['overrides']
        for (const key in overrides) {
            expandedConfig[key] = overrides[key]
        }
    }
    return expandedConfig
}

/**
 * Get the sha of the last commit in a repo
 * @param {string} repo The name of the github repository
 * @param {string} version a git reference (branch, tag)
 * @returns {Promise<string | undefined>} A promise resolving to the last commit sha
 */
export async function getCommitSha(repo, version='main') {
    const lastCommitInfo = 'https://api.github.com/repos/' + repo + '/git/ref/heads/' + version
    const res = await download(lastCommitInfo, {headers: {'User-Agent': 'vscode-latex-basics'}})
    if (res === undefined) {
        console.log('Cannot retrieve last commit sha', lastCommitInfo)
        return
    }
    try {
        const lastCommit = JSON.parse(res.toString('utf-8'))
        const sha = lastCommit.object.sha
        return sha
    } catch(e) {
        console.log('Cannot read last commit information')
        return undefined
    }
}


/**
 * Convert an Object to JSON but do not pretty print elements of arrays
 * @param {Object} dict An object to be dump in JSON
 * @param {string|number} indent Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns {string} a JSON string
 */
export function dumpJSONDoNotMakeArrayContentPretty(dict, indent) {
    let out = '{'
    if (Number.isInteger(indent)) {
        indent = ' '.repeat(indent)
    }

    for (const key in dict) {
        const entry = dict[key]
        if (Array.isArray(entry)) {
            out += '\n' + indent + '"' + key + '": ['

            for (const entry_i of entry) {
                const string_i = JSON.stringify(entry_i).replace(/(?<!\\)","/g, '", "')
                out += '\n' + indent.repeat(2) + string_i + ','
            }
            if (entry.length > 0) {
                // Remove last extra ','
                out = out.slice(0, -1)
            }
            out += '\n' + indent + ']'
        } else {
            out += '\n' + indent + '"' + key + '": '
            const entryString = JSON.stringify(entry, null, indent)
            out += entryString.split('\n').join('\n' + indent)
        }
        out += ','
    }
    if (Object.keys(dict).length > 0) {
        // Remove last ','
        out = out.slice(0, -1)
    }
    out += '\n}\n'
    return out
}

/**
 * Generate a self contained configuration file
 * @param {string} inFile The path of the configuration to be expanded
 * @param {string} outFile The path to write the result to
 * @returns void
 */
export async function expandConfigurationFile(inFile, outFile) {
    const configuration = await readConfiguration(inFile)
    if (!configuration) {
        return
    }
    const relativeDir = path.dirname(inFile)
    const expansion = await computeExpansion(configuration, relativeDir)
    if (!expansion) {
        console.log('Cannot expand input configuration: ' + inFile)
        return
    }
    fs.writeFileSync(outFile, dumpJSONDoNotMakeArrayContentPretty(expansion, '\t'))
}

