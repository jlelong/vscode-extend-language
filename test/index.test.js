import ava from 'ava'
import {join} from 'path'
import {readConfiguration, computeExpansion} from '../index.js'

const dirTests = 'test/fixtures'
const allTests = [
    ['1-language-configuration.json', '1-expected-language-configuration.json']
]

ava('JSON expansion test', async t => {
    for (const test of allTests) {
        const inputFile = join(dirTests, test[0])
        const expectedFile = join(dirTests, test[1])
        const inConfiguration = await readConfiguration(inputFile)
        const expectedConfiguration = await readConfiguration(expectedFile)
        if (!inConfiguration || !expectedConfiguration) {
            t.fail()
        }
        const expansion = await computeExpansion(inConfiguration, dirTests)
        t.deepEqual(expansion, expectedConfiguration)
    }
})
