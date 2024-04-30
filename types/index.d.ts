/**
 * Retrieve some content over https.
 *
 * This function comes from https://github.com/microsoft/vscode-grammar-updater/blob/main/index.js
 * @param {string} url
 * @param {number} redirectCount
 * @param {Object | string | URL} options to be passed to http.get. See http.request for a complete list of accepted options
 * @returns {Promise<string | undefined>} a Promise resolving to the body of the file as a string.
 */
export function download(url: string, options?: any | string | URL, redirectCount?: number): Promise<string | undefined>;
/**
 * Read a file locally or from the web.
 * @param {string} fileOrUrl The url or path of the file to read.
 * @param {string} relativeDir The relative path where to find fileOrUrl. Only used when fileOrUrl is a path.
 * @returns {Promise<string | undefined>} A promise resolving to the content of the file.
 */
export function readFile(fileOrUrl: string, relativeDir?: string): Promise<string | undefined>;
/**
 * Read a configuration as an object
 * @param {string} file The path of the configuration file relative to `relativeDir
 * @param {string} relativeDir The path where to look for file
 * @returns {promise<Object | undefined>} A Promise resolving to a dictionary
 */
export function readConfiguration(file: string, relativeDir: string): promise<any>;
/**
 * Expand a configuration Object by interpreting the keys `extends` and `overrides`
 * @param {Object} configuration An Object representing a configuration
 * @param {string} relativeDir The path where to look for files referenced by `extends`
 * @returns {Promise<Object | undefined>} A promise resolving to an expanded and self contained version of `configuration`
 */
export function computeExpansion(configuration: any, relativeDir: string): Promise<any | undefined>;
/**
 * Get the sha of the last commit in a repo
 * @param {string} repo The name of the github repository
 * @param {string} version a git reference (branch, tag)
 * @returns {Promise<string | undefined>} A promise resolving to the last commit sha
 */
export function getCommitSha(repo: string, version?: string): Promise<string | undefined>;
/**
 * Convert an Object to JSON but do not pretty print elements of arrays
 * @param {Object} dict An object to be dump in JSON
 * @param {string|number} indent Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns {string} a JSON string
 */
export function dumpJSONDoNotMakeArrayContentPretty(dict: any, indent: string | number): string;
/**
 * Generate a self contained configuration file
 * @param {string} inFile The path of the configuration to be expanded
 * @param {string} outFile The path to write the result to
 * @returns void
 */
export function expandConfigurationFile(inFile: string, outFile: string): Promise<void>;
//# sourceMappingURL=index.d.ts.map