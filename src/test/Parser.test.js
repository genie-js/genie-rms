const fs = require('fs')

const Parser = require('../Parser')
const CRandom = require('../CRandom')
const randomMapDef = require('../randomMapDef.js')

function parseMap (filename, seed = 0) {
  const content = fs.readFileSync(require.resolve('../../rms/' + filename), 'utf8')
  const parser = new Parser({
    random: new CRandom(seed),
    numPlayers: 2
  })
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

test('SHOULD NOT ignore comments inside dead `if` branches in 1.0c mode', () => {
  const parseResult = parseMap('TestComments.rms', {
    compatibility: 'aoc'
  })
  expect(parseResult.objects).toHaveLength(5)
  // Town Center
  expect(parseResult.objects[0].type).toEqual(109)
  // Paladin
  expect(parseResult.objects[1].type).toEqual(569)
  // Archer
  expect(parseResult.objects[2].type).toEqual(4)
  // Trade Cart
  expect(parseResult.objects[3].type).toEqual(128)
  // Throwing Axeman
  expect(parseResult.objects[4].type).toEqual(281)
})

test.skip('SHOULD ignore comments inside dead `if` branches in 1.5 mode', () => {
  const parseResult = parseMap('TestComments.rms', {
    compatibility: 'up1.5'
  })
  expect(parseResult.objects).toHaveLength(2)
  // Town Center
  expect(parseResult.objects[0].type).toEqual(109)
  // Paladin
  expect(parseResult.objects[1].type).toEqual(569)
  // Joan Of Arc
  expect(parseResult.objects[2].type).toEqual(629)
})
