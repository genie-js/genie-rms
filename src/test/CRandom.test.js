const CRandom = require('../CRandom')

test('generator sequence seeded with 0, first ten values', () => {
  const generator = new CRandom(0)
  let values = []
  for (let i = 0; i < 10; i++) {
    values.push(generator.next())
  }
  expect(values).toMatchSnapshot()
})

test('generator range sequence seeded with 0, first ten values', () => {
  const generator = new CRandom(0)
  let values = []
  for (let i = 0; i < 10; i++) {
    values.push(generator.nextRange(10))
  }
  expect(values).toMatchSnapshot()
})
