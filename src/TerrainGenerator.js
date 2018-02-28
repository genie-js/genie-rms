const Module = require('./Module')
const MapStack = require('./MapStack')

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

    this.generateModifiers()

    const terrainRules = []
    for (let i = 0; i < 99; i++) {
      terrainRules.push(i)
    }
    this.zoneMap = this.map.mapZones.createZoneMap(terrainRules)

    for (const desc of this.terrains) {
      console.log('generate terrain', desc)
      this.generateTerrain(desc)
    }

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get({ x, y })
        if (tile.terrain === 16) {
          tile.terrain = 0
        }
      }
    }
  }

  generateTerrain (desc) {
    const numberOfClumps = Math.min(desc.numberOfClumps, 999)
    const sizeX = this.map.sizeX - 1
    const sizeY = this.map.sizeY - 1

    if (desc.avoidPlayerStartAreas === 2) {
      // something with map zones.
      // hotspots again it looks like!
    }

    const clumps = []
    for (let i = 0; i < numberOfClumps; i++) {
      clumps.push(new MapStack())
    }

    const stack = this.linkStackRandomly()
    let clumpsPlaced = 0
    let clumpIndex = 0
    let tilesPlaced = 0
    let next

    while (clumpIndex < desc.numberOfClumps && (next = stack.pop())) {
      const tile = this.map.get(next)
      const { x, y } = next
      if (tile.terrain === desc.baseTerrain) {
        if (this.canPlaceTerrainOn(x, y, desc)) {
          if (!desc.avoidPlayerStartAreas || !this.searchMapRows[y][x]) {
            tile.terrain = desc.type
            const clump = clumps[clumpIndex]
            if (next.x > 0) clump.add(next.x - 1, next.y, 0, 0)
            if (next.x < this.map.sizeX - 1) clump.add(next.x + 1, next.y, 0, 0)
            if (next.y > 0) clump.add(next.x, next.y - 1, 0, 0)
            if (next.y < this.map.sizeY - 1) clump.add(next.x, next.y + 1, 0, 0)
            tilesPlaced += 1
            clumpIndex += 1
          }
        }
      }
    }

    for (const clump of clumps) {
      while (tilesPlaced < desc.tiles && (next = clump.pop())) {
        const { x, y } = next
        if (this.searchMapRows[y][x] > this.random.nextRange(100)) {
          continue
        }

        // TODO numeric preference
        const preference = this.canPlaceTerrainOn(x, y, desc)
        const tile = this.map.get(next)
        if (tile.terrain === desc.baseTerrain && preference) {
          let cost = figChance(preference, x, y, desc.clumpingFactor)
          if (desc.avoidPlayerStartAreas) {
            cost += this.searchMapRows[y][x]
          }

          tile.terrain = desc.type
          tilesPlaced += 1

          if (x > 0 && this.map.get({ x: x - 1, y }).terrain === desc.baseTerrain) {
            clump.add(x - 1, y, 0, cost + this.random.nextRange(100))
          }
          if (x < this.map.sizeX - 1 && this.map.get({ x: x + 1, y }).terrain === desc.baseTerrain) {
            clump.add(x + 1, y, 0, cost + this.random.nextRange(100))
          }
          if (y > 0 && this.map.get({ x, y: y - 1 }).terrain === desc.baseTerrain) {
            clump.add(x, y - 1, 0, cost + this.random.nextRange(100))
          }
          if (y < this.map.sizeY - 1 && this.map.get({ x, y: y + 1 }).terrain === desc.baseTerrain) {
            clump.add(x, y + 1, 0, cost + this.random.nextRange(100))
          }
        }
      }
    }
  }

  generateModifiers () {
    this.searchMap.fill(0)

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        // TODO Take hotspot code from src sub_00535B20
        this.searchMapRows[y][x] = 0
      }
    }
  }

  canPlaceTerrainOn (x, y, desc) {
    const tile = this.map.get({ x, y })
    if (tile.elevation < desc.minHeight || tile.elevation > desc.maxHeight) {
      return false
    }

    return true
  }

  linkStackRandomly () {
    const stack = new MapStack()
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        stack.push(this.nodes[y][x])
      }
    }

    const size = this.map.sizeX * this.map.sizeY
    for (let i = 0; i < size; i++) {
      const y = this.random.nextRange(this.map.sizeY - 1)
      const x = this.random.nextRange(this.map.sizeX - 1)
      stack.push(this.nodes[y][x])
    }
    return stack
  }
}

module.exports = TerrainGenerator

function figChance (preference, x, y, clumping) {
  return 250 - clumping * preference
}
