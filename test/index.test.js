const ava = require('ava')
const path = require('path')
const rewire = require('rewire')

const dirTests = 'test/fixtures'
const allTests = [
    ['1-language-configuration.json', '1-expected-language-configuration.json']
]

ava('JSON Object expansion test', async t => {
    const vel = rewire('../index')
    const readConfiguration = vel.__get__('readConfiguration')
    const computeExpansion = vel.__get__('computeExpansion')
    for (const test of allTests) {
        const inputFile = path.join(dirTests, test[0])
        const expectedFile = path.join(dirTests, test[1])
        const inConfiguration = await readConfiguration(inputFile)
        const expectedConfiguration = await readConfiguration(expectedFile)
        if (!inConfiguration || !expectedConfiguration) {
            t.fail()
        }
        const expansion = await computeExpansion(inConfiguration, dirTests)
        t.deepEqual(expansion, expectedConfiguration)
    }
})

ava('Print configuration test', async t => {
    const vel = rewire('../index')
    const readConfiguration = vel.__get__('readConfiguration')
    const dumpJSONDoNotMakeArrayContentPretty = vel.__get__('dumpJSONDoNotMakeArrayContentPretty')
    for (const test of allTests) {
        const expectedFile = path.join(dirTests, test[1])
        const expectedConfigurationAsString = await vel.readFile(expectedFile)
        const expectedConfiguration = await readConfiguration(expectedFile)
        if (!expectedConfiguration) {
            t.fail()
        }
        const out = dumpJSONDoNotMakeArrayContentPretty(expectedConfiguration, '\t')
        t.is(out, expectedConfigurationAsString)
    }


})
