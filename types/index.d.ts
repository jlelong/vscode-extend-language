/**
 * Read a configuration as an object
 * @param {string} file The path of the configuration file relative to `relativeDir
 * @param {string} relativeDir The path where to look for file
 * @returns {promise<Object>} A Promise resolving to a dictionary
 */
export function readConfiguration(file: string, relativeDir: string): promise<any>;
/**
 * Expand a configuration Object by interpreting the keys `extends` and `overrides`
 * @param {Object} configuration An Object representing a configuration
 * @param {string} relativeDir The path where to look for files referenced by `extends`
 * @returns {Object} An expanded and self contained version of `configuration`
 */
export function computeExpansion(configuration: any, relativeDir: string): any;
/**
 * Convert an Object to JSON but do not pretty print elements of arrays
 * @param {Object} dict An object to be dump in JSON
 * @param {string|number} indent Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns {string} a JSON string
 */
export function dumpJSONDoNotMakeArrayContentPretty(dict: any, indent: string | number): string;
/**
 * Generate a self contained configuration
 * @param {string} inFile The path of the configuration to be expanded
 * @param {string} outFile The path to write the result to
 * @returns void
 */
export function expandConfiguration(inFile: string, outFile: string): Promise<void>;
//# sourceMappingURL=index.d.ts.map