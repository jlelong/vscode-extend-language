import ava from 'ava'
import path from 'path'
import * as vel from '../index.js'

const dirTests = 'test/fixtures'
const allTests = [
    ['1-language-configuration.json', '1-expected-language-configuration.json'],
    ['2-language-configuration.json', '2-expected-language-configuration.json']
]

ava('JSON Object expansion test', async t => {
    for (const test of allTests) {
        const inputFile = path.join(dirTests, test[0])
        const expectedFile = path.join(dirTests, test[1])
        const inConfiguration = await vel.readConfiguration(inputFile)
        const expectedConfiguration = await vel.readConfiguration(expectedFile)
        if (!inConfiguration || !expectedConfiguration) {
            t.fail()
        }
        const expansion = await vel.computeExpansion(inConfiguration, dirTests)
        t.deepEqual(expansion, expectedConfiguration)
    }
})

ava('Print configuration test', async t => {
    for (const test of allTests) {
        const expectedFile = path.join(dirTests, test[1])
        const expectedConfigurationAsString = await vel.readFile(expectedFile)
        const expectedConfiguration = await vel.readConfiguration(expectedFile)
        if (!expectedConfiguration) {
            t.fail()
        }
        const out = vel.dumpJSONDoNotMakeArrayContentPretty(expectedConfiguration, '\t')
        t.is(out, expectedConfigurationAsString)
    }
})

ava('Test remote download', async t => {
    const url = 'https://raw.githubusercontent.com/jlelong/vscode-latex-basics/main/languages/latex-cpp-embedded-language-configuration.json'
    var content = await vel.download(url)
    if (!content) {
        t.fail()
    }
    t.pass()
})
