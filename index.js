'use strict'

const exp = require('constants')
const fs = require('fs')
const got = require('got')
const path = require('path')

/**
 * Download a file.
 * @param {string} url The url to get.
 * @returns {Promise<string>} a Promise resolving to the body of the file as a string.
 */
async function downloadFile(url) {
    try {
        const response = await got(url)
        return response.body.toString('utf-8')
    } catch (e) {
        console.log('Cannot retrieve: ', url)
        console.log('Error code:', e.response.statusCode)
        console.log('Error message:', e.response.statusMessage);
    }
    return undefined
}

/**
 * Read a file locally or from the web.
 * @param {string} fileOrUrl The url or path of the file to read.
 * @param {string} relativeDir The relative path where to find fileOrUrl. Only used when fileOrUrl is a path.
 * @returns {Promise<string>} A promise resolving to the content of the file.
 */
async function readFile(fileOrUrl, relativeDir = '') {
    if (fileOrUrl.startsWith('https')) {
        const content = await downloadFile(fileOrUrl)
        return content
    } else {
       try {
           const content = fs.readFileSync(path.resolve(relativeDir, fileOrUrl))
           return content
       } catch (error) {
        console.log('Cannot read ' + fileOrUrl)
            console.log(error)
       }
    }
    return undefined
}

/**
 * Read a configuration as an object
 * @param {string} file The path of the configuration file relative to `relativeDir
 * @param {string} relativeDir The path where to look for file
 * @returns {promise<Object>} A Promise resolving to a dictionary
 */
async function readConfiguration(file, relativeDir) {
    const content = await readFile(file, relativeDir)
    if (!content) {
        return undefined
    }
    try {
        const jsonContent = JSON.parse(content)
        return jsonContent
    } catch (error) {
        console.log('Cannot parse content of ' + file)
        console.log(error)
    }
    return undefined
}

function checkStructure(content) {
    let test = true
    if (!('brackets' in content && Array.isArray(content['brackets']))) {
        test = false
        console.log('Cannot find \'brackets\' or its is not an array')
    }
    if (!('autoClosingPairs' in content && Array.isArray(content['autoClosingPairs']))) {
        test = false
        console.log('Cannot find \'autoClosingPairs\' or its is not an array.')

    }
    if (!('surroundingPairs' in content && Array.isArray(content['surroundingPairs']))) {
        test = false
        console.log('Cannot find \'surroundingPairs\' or its is not an array.')

    }
    if (!('wordPattern' in content)) {
        test = false
        console.log('Cannot find \'wordPattern\'.')
    }
    return true
}

/**
 * Expand a configuration Object by interpreting the keys `extends` and `overrides`
 * @param {Object} configuration An Object representing a configuration
 * @param {string} relativeDir The path where to look for files referenced by `extends`
 * @returns {Object} An expanded and self contained version of `configuration`
 */
async function computeExpansion(configuration, relativeDir) {
    if (! ('extends' in configuration)) {
        return configuration
    }
    const baseConfig = await readConfiguration(configuration['extends'], relativeDir)
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
 * Convert an Object to JSON but do not pretty print elements of arrays
 * @param {Object} dict An object to be dump in JSON
 * @param {string|number} indent Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns {string} a JSON string
 */
function dumpJSONDoNotMakeArrayContentPretty(dict, indent) {
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
 * Generate a self contained configuration
 * @param {string} inFile The path of the configuration to be expanded
 * @param {string} outFile The path to write the result to
 * @returns void
 */
async function expandConfiguration(inFile, outFile) {
    const configuration = await readConfiguration(inFile, __dirname)
    if (!configuration) {
        return
    }
    const relativeDir = path.dirname(inFile)
    const expansion = await computeExpansion(configuration, path.resolve(__dirname, relativeDir))
    fs.writeFileSync(outFile, dumpJSONDoNotMakeArrayContentPretty(expansion, '\t'))
}

module.exports.expandConfiguration = expandConfiguration
