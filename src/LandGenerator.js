const Module = require('./Module.js')

class LandGenerator extends Module {
  constructor (map, parent, data) {
    super(map, parent, true)
    this.data = data

    this.schedule = 1.0
  }

  generate () {
  }
}

module.exports = LandGenerator
