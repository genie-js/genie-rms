const Module = require('./Module.js')
const StackNode = require('./StackNode.js')

class LandGenerator extends Module {
  constructor (map, parent, lands) {
    super(map, parent, true)
    console.log('LandGenerator', lands)
    this.lands = lands

    this.schedule = 1.0
  }

  generate () {
    this.clearStack()
    this.baseLandGenerate()
    // this.map.cleanTerrain(0, 0, this.map.sizeX, this.map.sizeY, this.info.baseTerrain)
  }

  checkTerrainAndZone (target, landNum, x, y) {
  }

  chance (x, y, landType) {
    const { wallFade } = this.lands[landType]
    if (!wallFade) return 0
  }

  baseLandGenerate () {
    const sizeX = this.map.sizeX - 1
    const sizeY = this.map.sizeY - 1

    const stacks = []
    const landSize = []
    for (const _ of this.lands) {
      stacks.push(new StackNode())
      landSize.push(0)
    }

    for (let landId = 0; landId < this.lands.length; landId++) {
      const land = this.lands[landId]
      const minX = Math.max(0, land.x - land.baseSize)
      const minY = Math.max(0, land.y - land.baseSize)
      const maxX = Math.min(sizeX, land.x + land.baseSize)
      const maxY = Math.min(sizeY, land.y + land.baseSize)

      // this.map.setTerrain(0, 0, minX, minY, maxX, maxY, land.terrainType, 1, 0)

      landSize[land.zone] = (maxY - minY + 1) * (maxX - minX + 1)

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          this.searchMapRows[y][x] = land.zone
        }
      }

      if (minX > 0) {
        for (let y = minY; y <= maxY; y++) {
          this.pushStack(stacks[landId], minX - 1, y, landId, 0)
        }
      }
      if (minY > 0) {
        for (let x = minX; x <= maxX; x++) {
          this.pushStack(stacks[landId], x, minY - 1, landId, 0)
        }
      }
      if (maxX < sizeX) {
        for (let y = minY; y <= maxY; y++) {
          this.pushStack(stacks[landId], minX + 1, y, landId, 0)
        }
      }
      if (maxY < sizeY) {
        for (let x = minX; x <= maxX; x++) {
          this.pushStack(stacks[landId], x, minY + 1, landId, 0)
        }
      }
    }

    let done = false
    while (!done) {
      done = true
      for (let landId = 0; landId < this.lands.length; landId++) {
        const land = this.lands[landId]
        if (landSize[landId] >= land.landSize) continue
        const tile = this.popStack(stacks[landId])
        if (!tile) continue
        const { x, y } = tile
        done = false

        if (this.chance(x, y, landId) > this.random.nextRange(100)) {
          this.searchMapRows[y][x] = -1
          continue
        }

        const cost = this.checkTerrainAndZone(land.terrainType, landId, x, y)
        const landCount = this.lands.length
        if (this.searchMapRows[y][x] === landCount && cost > 0) {
          this.mapRowOffset[y][x].terrain = land.terrainType
          this.searchMapRows[y][x] = land.zone

          if (x > 0 && this.searchMapRows[y][x - 1] === landCount) {
            this.pushStack(stacks[landId], x - 1, y,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }
          if (x < sizeX && this.searchMapRows[y][x + 1] === landCount) {
            this.pushStack(stacks[landId], x + 1, y,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }
          if (y > 0 && this.searchMapRows[y - 1][x] === landCount) {
            this.pushStack(stacks[landId], x, y - 1,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }
          if (y < sizeY && this.searchMapRows[y + 1][x] === landCount) {
            this.pushStack(stacks[landId], x, y + 1,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }

          landSize[landId] += 1
        }
      }
    }

    for (let landId = 0; landId < this.lands.length; landId++) {
      const land = this.lands[landId]
      let node
      while ((node = this.popStack(stacks[landId]))) {
        const { x, y } = node
        if (x > 0 && this.searchMapRows[y][x - 1] === land.zone
           && x < sizeX && this.searchMapRows[y][x + 1] === land.zone) {
          this.mapRowOffset[y][x].terrain = terrain
        } else if (y > 0 && this.searchMapRows[y - 1][x] === land.zone
           && y < sizeX && this.searchMapRows[y + 1][x] === land.zone) {
          this.mapRowOffset[y][x].terrain = terrain
        }
      }
    }
  }
}

module.exports = LandGenerator
