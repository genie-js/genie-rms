const Module = require('./Module')

class ElevationGenerator extends Module {
  constructor (map, parent, hills) {
    super(map, parent, true)
    this.hills = hills

    this.priority = 1.5
  }

  generate () {
  }
}

module.exports = ElevationGenerator
