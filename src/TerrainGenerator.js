const Logger = require('./Logger.js')
const Module = require('./Module.js')
const StackNode = require('./StackNode.js')

class TerrainGenerator extends Module {
  constructor (map, parent, terrains, hotspots = []) {
    super(map, parent, true)
    this.terrains = terrains
    this.hotspots = hotspots
    this.random = parent.random

    this.logger = new Logger('terrain')
    this.schedule = 2.0
  }

  /**
   * Apply the base terrain to all tiles on the map.
   */
  _applyBaseTerrain () {
    const baseTerrain = this.parent.parser.baseTerrain
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        this.map.get({ x, y }).terrain = baseTerrain
      }
    }
  }

  generate () {
    this._applyBaseTerrain()

    this._generateModifiers()

    const terrainRules = []
    for (let i = 0; i < 99; i++) {
      terrainRules.push(i)
    }
    this.zoneMap = this.map.mapZones.createZoneMap(terrainRules)

    for (const desc of this.terrains) {
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

    this.map.cleanTerrain(0, 0, this.map.sizeX, this.map.sizeY, 1);
    this.checkBorders()
  }

  generateTerrain (desc) {
    const numberOfClumps = Math.min(desc.numberOfClumps, 999)
    const sizeX = this.map.sizeX - 1
    const sizeY = this.map.sizeY - 1

    const terrainFairnessZones = []
    const terrainFairnessZonesVisited = []
    if (desc.avoidPlayerStartAreas === 2) {
      this.hotspots.forEach((hs, i) => {
        terrainFairnessZones[i].push(this.mapZone.getZoneInfo(hs.x, hs.y))
        terrainFairnessZonesVisited[i].push(false)
      })
    }

    this.logger.log('place', numberOfClumps, 'clumps of', desc.type)

    const clumps = []
    for (let i = 0; i < numberOfClumps; i++) {
      clumps.push(new StackNode())
    }

    const stack = this.linkStackRandomly()
    const baseArea = Math.min(2, 2 * Math.sqrt(desc.tiles / desc.numberOfClumps))
    let clumpsPlaced = 0
    let clumpIndex = 0
    let tilesPlaced = 0
    let next

    while (clumpIndex < numberOfClumps && (next = this.popStack(stack))) {
      const tile = this.map.get(next)
      const { x, y } = next
      if (tile.terrain !== desc.baseTerrain) continue
      if (this.canPlaceTerrainOn(x, y, desc) === 0) continue
      if (desc.avoidPlayerStartAreas && this.searchMapRows[y][x] !== 0) continue

      this.removeArea(x, y, baseArea)
      tile.terrain = desc.type
      const clump = clumps[clumpIndex]
      if (next.x > 0) this.pushStack(clump, next.x - 1, next.y, 0, 0)
      if (next.x < this.map.sizeX - 1) this.pushStack(clump, next.x + 1, next.y, 0, 0)
      if (next.y > 0) this.pushStack(clump, next.x, next.y - 1, 0, 0)
      if (next.y < this.map.sizeY - 1) this.pushStack(clump, next.x, next.y + 1, 0, 0)
      tilesPlaced += 1
      clumpIndex += 1

      const zone = this.zoneMap.getZoneInfo(x, y)
      if (desc.avoidPlayerStartAreas === 2) {
        for (let i = 0; i < this.hotspots.length; i++) {
          if (terrainFairnessZones[i] === zone && !terrainFairnessZonesVisited[i]) {
            terrainFairnessZonesVisited[i] = true
          }
        }
      }
    }

    let done = false
    while (!done) {
      done = true
      for (const clump of clumps) {
        if (tilesPlaced < desc.tiles && (next = this.popStack(clump))) {
          done = false
          const { x, y } = next
          if (desc.avoidPlayerStartAreas !== 0
              && this.searchMapRows[y][x] > this.random.nextRange(100)) {
            continue
          }

          const preference = this.canPlaceTerrainOn(x, y, desc)
          const tile = this.map.get(next)
          if (tile.terrain === desc.baseTerrain && preference !== 0) {
            let cost = figChance(preference, x, y, desc.clumpingFactor)
            if (desc.avoidPlayerStartAreas) {
              cost += this.searchMapRows[y][x]
            }

            tile.terrain = desc.type

            if (x > 0 && this.map.get({ x: x - 1, y }).terrain === desc.baseTerrain) {
              this.pushStack(clump, x - 1, y, 0, cost + this.random.nextRange(100))
            }
            if (x < this.map.sizeX - 1 && this.map.get({ x: x + 1, y }).terrain === desc.baseTerrain) {
              this.pushStack(clump, x + 1, y, 0, cost + this.random.nextRange(100))
            }
            if (y > 0 && this.map.get({ x, y: y - 1 }).terrain === desc.baseTerrain) {
              this.pushStack(clump, x, y - 1, 0, cost + this.random.nextRange(100))
            }
            if (y < this.map.sizeY - 1 && this.map.get({ x, y: y + 1 }).terrain === desc.baseTerrain) {
              this.pushStack(clump, x, y + 1, 0, cost + this.random.nextRange(100))
            }

            tilesPlaced += 1
          }
        }
      }
    }
  }

  _generateModifiers () {
    this.searchMap.fill(0)

    if (this.hotspots.length === 0) {
      return
    }

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        // TODO probably safe to remove
        this.searchMapRows[y][x] = 0

        let modifier = 0
        for (const hotspot of this.hotspots) {
          const distX = Math.abs(x - hotspot.x)
          const distY = Math.abs(y - hotspot.y)
          const dist = Math.floor(hotspot.radius - Math.sqrt(distX ** 2 + distY ** 2))
          if (dist > 0) modifier += dist * hotspot.fade
        }

        this.searchMapRows[y][x] = Math.min(101, modifier)
      }
    }
  }

  checkBorders () {
    const { map } = this

    for (let y = 0; y < map.sizeY; y++) {
      for (let x = 0; x < map.sizeX; x++) {
        const tile = map.get({ x, y })
        if (isIce(tile.terrain) && this._isBorderedByWater(x, y)) {
          tile.terrain = 37 // Ice Beach
        } else if (tile.terrain !== 2) { // Beach
          if (isSnow(tile.terrain) && this._isBorderedByWater(x, y)) {
            tile.terrain = 37 // Ice Beach
          } else if (!this._isWaterTile(x, y) && this._isBorderedByWater(x, y)) {
            tile.terrain = 2 // Beach
          }
        }
      }
    }
  }

  _isBorderedByWater (x, y) {
    if (y > 0 && this._isWaterTile(x, y - 1) ||
        y < this.map.sizeY - 1 && this._isWaterTile(x, y + 1)) {
      return true
    }
    if (x > 0 && (
      this._isWaterTile(x - 1, y) ||
      y > 0 && this._isWaterTile(x - 1, y - 1) ||
      y < this.map.sizeY - 1 && this._isWaterTile(x - 1, y + 1)
    )) {
      return true
    }
    if (x < this.map.sizeX - 1 && (
      this._isWaterTile(x + 1, y) ||
      y > 0 && this._isWaterTile(x + 1, y - 1) ||
      y < this.map.sizeY - 1 && this._isWaterTile(x + 1, y + 1)
    )) {
      return true
    }
    return false
  }

  _isWaterTile (x, y) {
    const tile = this.map.get({ x, y })
    return isWater(tile.terrain)
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
    const stack = new StackNode()
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        this.addStackNode(stack, this.nodes[y][x])
      }
    }

    const size = this.map.sizeX * this.map.sizeY
    for (let i = 0; i < size; i++) {
      const y = this.random.nextRange(this.map.sizeY - 1)
      const x = this.random.nextRange(this.map.sizeX - 1)
      this.addStackNode(stack, this.nodes[y][x])
    }
    return stack
  }

  removeArea (x, y, margin) {
    const minX = Math.max(0, x - margin)
    const minY = Math.max(0, y - margin)
    const maxX = Math.min(this.map.sizeX, x + margin)
    const maxY = Math.min(this.map.sizeY, y + margin)

    for (const node of this.nodes) {
      if (node.x >= minX && node.x < maxX && node.y >= minY && node.y <= maxY) {
        this.removeStackNode(node)
      }
    }
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
