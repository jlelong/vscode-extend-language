const ava = require('ava')
const path = require('path')
const langConf = require('../index')

const dirTests = 'test/fixtures'
const allTests = [
    ['1-language-configuration.json', '1-expected-language-configuration.json']
]

ava('JSON expansion test', async t => {
    for (const test of allTests) {
        const inputFile = path.join(dirTests, test[0])
        const expectedFile = path.join(dirTests, test[1])
        const inConfiguration = await langConf.readConfiguration(inputFile)
        const expectedConfiguration = await langConf.readConfiguration(expectedFile)
        if (!inConfiguration || !expectedConfiguration) {
            t.fail()
        }
        const expansion = await langConf.computeExpansion(inConfiguration, dirTests)
        t.deepEqual(expansion, expectedConfiguration)
    }
})
