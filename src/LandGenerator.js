const Logger = require('./Logger.js')
const Module = require('./Module.js')
const StackNode = require('./StackNode.js')

class LandGenerator extends Module {
  constructor (map, parent, lands, meta) {
    super(map, parent, true)
    this.lands = lands
    this.meta = meta

    this.logger = new Logger('lands')
    this.schedule = 1.0
  }

  /**
   * Apply the base terrain to all tiles on the map.
   */
  _applyBaseTerrain () {
    const baseTerrain = this.meta.baseTerrain
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        this.map.get({ x, y }).terrain = baseTerrain
      }
    }
  }

  generate () {
    this.clearStack()

    this.searchMap.fill(this.lands.length)

    this._applyBaseTerrain()
    this.baseLandGenerate()

    // this.map.cleanTerrain(0, 0, this.map.sizeX, this.map.sizeY, this.info.baseTerrain)
  }

  checkTerrainAndZone (target, landNum, x, y) {
    if (this.searchMapRows[y][x] !== this.lands.length) {
      return 0
    }

    const land = this.lands[landNum]
    let count = 0
    let centerMinX = x - 2
    let centerMinY = y - 2
    let centerMaxX = x + 2
    let centerMaxY = y + 2

    for (let curY = y - land.area; curY <= y + land.area; curY += 1) {
      if (curY < 0) {
        if (curY > centerMinY) count += 5
        continue
      }
      if (curY >= this.map.sizeY) {
        if (curY < centerMaxY) count += 5
        continue
      }

      for (let curX = x - land.area; curX <= x + land.area; curX += 1) {
        if (curX < 0) {
          if (curX > centerMinX) count += 5
          continue
        }
        if (curX >= this.map.sizeX) {
          if (curX < centerMaxX) count += 5
          continue
        }

        if (this.searchMapRows[y][x] === land.zone) {
          if (curY >= centerMinY && curY <= centerMaxY &&
              curX >= centerMinX && curX <= centerMaxX) {
            count += 1
          } else if (this.searchMapRows[y][x] < this.lands.length) {
            return 0
          }
        }
      }
    }

    return count
  }

  chance (x, y, landType) {
    const { borderFuzziness } = this.lands[landType]
    if (!borderFuzziness) return 0
    return 51
  }

  baseLandGenerate () {
    const sizeX = this.map.sizeX - 1
    const sizeY = this.map.sizeY - 1

    const stacks = []
    const landSizes = []
    for (let i = 0; i < this.lands.length; i++) {
      stacks.push(new StackNode())
      landSizes.push(0)
    }

    for (const [landId, land] of Object.entries(this.lands)) {
      this.logger.log('place base land', landId, land.zone, land.terrain)
      const minX = Math.max(0, land.position.x - land.baseSize)
      const minY = Math.max(0, land.position.y - land.baseSize)
      const maxX = Math.min(sizeX, land.position.x + land.baseSize)
      const maxY = Math.min(sizeY, land.position.y + land.baseSize)

      // this.map.setTerrain(0, 0, minX, minY, maxX, maxY, land.terrain, 1, 0)
      // TODO use setTerrain instead of this loop
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          this.map.get({ x, y }).terrain = land.terrain
        }
      }

      landSizes[land.zone] = (maxY - minY + 1) * (maxX - minX + 1)

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

    this.logger.log('distributing clumps', this.lands.map(l => l.tiles))
    let done = false
    while (!done) {
      done = true
      for (const [landId, land] of Object.entries(this.lands)) {
        if (landSizes[landId] >= land.tiles) continue
        const tile = this.popStack(stacks[landId])
        if (!tile) continue
        const { x, y } = tile
        done = false

        if (this.chance(x, y, landId) > this.random.nextRange(100)) {
          this.searchMapRows[y][x] = -1
          continue
        }

        const cost = this.checkTerrainAndZone(land.terrain, landId, x, y)
        const landCount = this.lands.length
        if (this.searchMapRows[y][x] === landCount && cost > 0) {
          this.map.get({ x, y }).terrain = land.terrain
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

          landSizes[landId] += 1
        }
      }
      this.logger.log('land sizes:', landSizes)
    }

    this.logger.log('cleaning terrain')
    for (let landId = 0; landId < this.lands.length; landId++) {
      const land = this.lands[landId]
      let node
      while ((node = this.popStack(stacks[landId]))) {
        const { x, y } = node
        if (x > 0 && this.searchMapRows[y][x - 1] === land.zone &&
           x < sizeX && this.searchMapRows[y][x + 1] === land.zone) {
          this.map.get({ x, y }).terrain = land.terrain
        } else if (y > 0 && this.searchMapRows[y - 1][x] === land.zone &&
           y < sizeX && this.searchMapRows[y + 1][x] === land.zone) {
          this.map.get({ x, y }).terrain = land.terrain
        }
      }
    }
  }
}

module.exports = LandGenerator
