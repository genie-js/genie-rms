const fs = require('fs')

const Parser = require('../Parser')
const CRandom = require('../CRandom')
const randomMapDef = require('../randomMapDef.js')

function parseMap (filename, seed = 0) {
  const content = fs.readFileSync(require.resolve('../../rms/' + filename), 'utf8')
  const parser = new Parser({ random: new CRandom(seed) })
  parser.write(randomMapDef)
  parser.write(content)
  return parser.end()
}

test('parse Arabia', () => {
  const parseResult = parseMap('Arabia.rms')
  expect(parseResult).toMatchSnapshot()
})

test('parse Relic Nothing', () => {
  const parseResult = parseMap('Relic Nothing.rms')
  expect(parseResult).toMatchSnapshot()
})

test('parse FenCrazyV6n1', () => {
  const parseResult = parseMap('FenCrazyV6n1.rms')
  expect(parseResult).toMatchSnapshot()
})

test('parse Water Fortress V1', () => {
  const parseResult = parseMap('Water Fortress V1.rms')
  expect(parseResult).toMatchSnapshot()
})
