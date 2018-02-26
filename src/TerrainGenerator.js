const Module = require('./Module')

class TerrainGenerator extends Module {
  constructor (map, parent, terrains) {
    super(map, parent, true)
    this.terrains = terrains
    this.random = parent.random

    this.schedule = 2.0
  }

  generate () {
    const baseTerrain = this.parent.parser.baseTerrain
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        this.map.get({ x, y }).terrain = baseTerrain
      }
    }
    for (const desc of this.terrains) {
      this.generateTerrain(desc)
    }
  }

  generateTerrain (desc) {
    const numberOfClumps = Math.min(desc.numberOfClumps, 999)
    const sizeX = this.map.sizeX - 1
    const sizeY = this.map.sizeY - 1

    if (desc.avoidPlayerStartAreas === 2) {
      // something with map zones.
    }

    const clumps = []
    for (let i = 0; i < numberOfClumps; i++) {
      clumps.push([])
    }

    const tiles = this.generateTiles()
    for (const { x, y } of tiles) {
      const tile = this.map.get({ x, y })
      if (tile.terrain === desc.baseTerrain || desc.baseTerrain === null) {
        if (this.canPlace(x, y, desc)) {
          tile.terrain = desc.type
        }
      }
    }
  }

  canPlace (x, y, desc) {
    const tile = this.map.get({ x, y })
    if (tile.elevation < desc.minHeight || tile.elevation > desc.maxHeight) {
      return false
    }

    
  }

  generateTiles () {
    const list = []
    const size = this.map.sizeX * this.map.sizeY
    for (let i = 0; i < size; i++) {
      const y = this.random.nextRange(this.map.sizeY - 1)
      const x = this.random.nextRange(this.map.sizeX - 1)
      list.push({ x, y })
    }
    return list
  }
}

module.exports = TerrainGenerator
