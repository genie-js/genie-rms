const Module = require('./Module.js')

class LandGenerator extends Module {
  constructor (map, parent, data) {
    super(map, parent, true)
    this.data = data

    this.schedule = 1.0
  }

  generate () {
    this.clearStack()
    this.baseLandGenerate()
    this.map.cleanTerrain(0, 0, this.map.sizeX, this.map.sizeY, this.data.baseTerrain)
  }

  checkTerrainAndZone (target, landNum, x, y) {
  }

  chance (x, y, landType) {
    const { wallFade } = this.data.land[landType]
    if (!wallFade) return 0
  }

  baseLandGenerate () {
  }
}

module.exports = LandGenerator
