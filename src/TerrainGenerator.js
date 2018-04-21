const Module = require('./Module')
const MapStack = require('./MapStack')

class TerrainGenerator extends Module {
  constructor (map, parent, terrains, hotspots = []) {
    super(map, parent, true)
    this.terrains = terrains
    this.hotspots = hotspots
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

    this.map.clearTerrain(0, 0, this.map.sizeX, this.map.sizeY, true);
    this.checkBorders()
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
        if (this.canPlaceTerrainOn(x, y, desc) !== 0) {
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
        if (tile.terrain === desc.baseTerrain && preference !== 0) {
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

    if (this.hotspots.length === 0) {
      return
    }

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        // TODO Take hotspot code from src sub_00535B20
        this.searchMapRows[y][x] = 0

        let value = 0
        for (const hotspot of this.hotspots) {
          const distX = Math.abs(x - hotspot.x)
          const distY = Math.abs(y - hotspot.y)
          const dist = Math.floor(hotspot.radius - Math.sqrt(distX ** 2 + distY ** 2))
          if (dist > 0) value += dist * hotspot.fade
        }

        this.searchMapRows[y][x] = Math.min(101, value)
      }
    }
  }

  checkBorders () {
    const { map } = this

    for (let y = 0; y < map.sizeY; y++) {
      for (let x = 0; x < map.sizeX; x++) {
        const tile = map.get({ x, y })
        if (isIce(tile.terrain) && isBorderedByWater(x, y)) {
          tile.terrain = 37 // Ice Beach
        } else if (tile.terrain !== 2) { // Beach
          if (isSnow(tile.terrain) && isBorderedByWater(x, y)) {
            tile.terrain = 37 // Ice Beach
          } else if (!isWaterTile(x, y) && isBorderedByWater(x, y)) {
            tile.terrain = 2 // Beach
          }
        }
      }
    }

    function isBorderedByWater (x, y) {
      if (y > 0 && isWaterTile(x, y - 1) ||
          y < map.sizeY - 1 && isWaterTile(x, y + 1)) {
        return true
      }
      if (x > 0 && (
        isWaterTile(x - 1, y) ||
        y > 0 && isWaterTile(x - 1, y - 1) ||
        y < map.sizeY - 1 && isWaterTile(x - 1, y + 1)
      )) {
        return true
      }
      if (x < map.sizeX - 1 && (
        isWaterTile(x + 1, y) ||
        y > 0 && isWaterTile(x + 1, y - 1) ||
        y < map.sizeY - 1 && isWaterTile(x + 1, y + 1)
      )) {
        return true
      }
      return false
    }

    function isWaterTile (x, y) {
      const { terrain } = map.get({ x, y })
      return isWater(terrain)
    }
  }

  canPlaceTerrainOn (x, y, desc) {
    const tile = this.map.get({ x, y })
    if (tile.elevation < desc.minHeight || tile.elevation > desc.maxHeight) {
      return 0
    }

    if (desc.spacingToOtherTerrainTypes > 0) {
      const minX = Math.max(0, x - desc.spacingToOtherTerrainTypes)
      const minY = Math.max(0, y - desc.spacingToOtherTerrainTypes)
      const maxX = Math.min(this.map.sizeX - 1, x + desc.spacingToOtherTerrainTypes)
      const maxY = Math.min(this.map.sizeY - 1, y + desc.spacingToOtherTerrainTypes)

      for (let cy = minY; cy < maxY; cy += 1) {
        for (let cx = minX; cx < maxX; cx += 1) {
          const tile = this.map.get({ x: cx, y: cy })
          if (tile.terrain !== desc.baseTerrain && tile.terrain !== desc.type) {
            return 0
          }
          if (desc.flatOnly && tile.type !== 0) {
            return 0
          }
        }
      }
    }

    const minX = Math.max(0, x - 2)
    const minY = Math.max(0, y - 2)
    const maxX = Math.min(0, x + 2)
    const maxY = Math.min(0, y + 2)
    let score = 1
    for (let cy = minY; cy < maxY; cy += 1) {
      for (let cx = minX; cx < maxX; cx += 1) {
        const tile = this.map.get({ x: cx, y: cy })
        if (tile.terrain === desc.type) {
          score += 1
        }
      }
    }

    return score
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

function isWater (terrain) {
  return terrain === 1 || terrain === 4 || terrain === 22 || terrain === 23
}

function isIce (terrain) {
  return terrain === 26 || terrain === 35 || terrain === 37
}

function isSnow (terrain) {
  return terrain === 32 || terrain === 33 || terrain === 34
}
