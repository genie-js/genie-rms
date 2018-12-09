const make = require('msvcrt-rand/make')

/**
 * Microsoft C Runtime rand() implementation
 */
class CRandom {
  constructor (seed) {
    this.msvcrtRand = make(seed)
  }

  next () {
    return this.msvcrtRand()
  }

  nextRange (max) {
    return Math.floor(this.next() * max / 0x7fff)
  }
}

module.exports = CRandom
