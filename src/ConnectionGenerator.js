const Module = require('./Module')

class ConnectionGenerator extends Module {
  constructor (map, parent, connections) {
    super(map, parent, true)
    this.connections = connections

    this.schedule = 2.1
  }

  generate () {
  }
}

module.exports = ConnectionGenerator
