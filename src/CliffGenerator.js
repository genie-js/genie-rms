const Module = require('./Module.js')

class CliffGenerator extends Module {
  constructor (map, parent, cliffs) {
    super(map, parent, true)
    this.cliffs = cliffs

    this.schedule = 1.75
  }

  generate () {
  }
}

module.exports = CliffGenerator
