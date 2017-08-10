/**
 * Microsoft C Runtime rand() implementation
 */
class CRandom {
  constructor (seed) {
    this.seed = seed | 0 // make it an int32
  }

  next () {
    this.seed = (((this.seed * 214013) | 0) + 2531011) | 0
    return (this.seed >> 16) & 0x7fff
  }

  nextRange (max) {
    return Math.floor(this.next() * max / 0x7fff)
  }
}

module.exports = CRandom
