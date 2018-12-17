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
    const { baseTerrain } = this.meta
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        this.map.get(x, y).terrain = baseTerrain
      }
    }
  }

  generate () {
    this.clearStack()

    this.searchMap.fill(-2)

    this._applyBaseTerrain()
    this.baseLandGenerate()

    // this.map.cleanTerrain(0, 0, this.map.sizeX, this.map.sizeY, this.meta.baseTerrain)
  }

  checkTerrainAndZone (land, x, y) {
    if (this.searchMapRows[y][x] !== -2) {
      this.logger.log('skipping', land.zone, 'because of search map', x, y)
      return 0
    }

    let count = 0
    let offset = Math.max(2, land.area * 2 / 3)
    let centerMinX = x - 2
    let centerMinY = y - 2
    let centerMaxX = x + 2
    let centerMaxY = y + 2
    let landMinX = x - offset
    let landMinY = y - offset
    let landMaxX = x + offset
    let landMaxY = y + offset

    for (let curY = centerMinY; curY <= centerMaxY; curY += 1) {
      if (curY < 0) {
        if (curY >= centerMinY) count += 3
        continue
      }
      if (curY >= this.map.sizeY) {
        if (curY <= centerMaxY) count += 3
        continue
      }

      for (let curX = landMinX; curX <= landMaxX; curX += 1) {
        if (curX < 0) {
          if (curX >= centerMinX) count += 1
          continue
        }
        if (curX >= this.map.sizeX) {
          if (curX <= centerMaxX) count += 1
          continue
        }

        if (this.searchMapRows[curY][curX] === land.zone) {
          if (curY >= centerMinY && curY <= centerMaxY &&
              curX >= centerMinX && curX <= centerMaxX) {
            count += 1
          } else if (this.searchMapRows[curY][curX] < -2 &&
            curX >= x - land.area && curX <= x + land.area &&
            curY >= y - land.area && curY <= y + land.area) {
            this.logger.log('skipping', land.zone, 'because of search map 2', curX, curY)
            return 0
          }
        }
      }

      if (curY < landMinY || curY > landMaxY) {
        landMinX -= 1
        landMaxX += 1
      }
    }

    return count
  }

  chance (x, y, landType) {
    const {
      borderFuzziness,
      leftBorder,
      rightBorder,
      topBorder,
      bottomBorder
    } = this.lands[landType]
    if (!borderFuzziness) return 0

    const horizDist = Math.max(0, Math.min(leftBorder - x, x - rightBorder))
    const horizBorderDist = Math.max(leftBorder + horizDist, this.map.sizeX - rightBorder + (x - rightBorder))
    const vertDist = Math.max(0, Math.max(
      horizBorderDist <= 0 ? topBorder - y : horizBorderDist + topBorder - y,
      horizBorderDist <= 0 ? y - bottomBorder : y + horizBorderDist - bottomBorder
    ))

    const chance = borderFuzziness * (horizDist + vertDist)

    return chance >= 100 ? 101 : chance
  }

  baseLandGenerate () {
    const sizeX = this.map.sizeX - 1
    const sizeY = this.map.sizeY - 1

    const stacks = []
    const landSizes = []

    for (let i = 0; i < this.lands.length; i++) {
      const land = this.lands[i]
      stacks[i] = new StackNode()
      landSizes[i] = 0

      this.logger.log('place base land', i, 'of size', land.tiles, 'and type', land.zone, land.terrain, 'at', land.position)
      const minX = Math.max(0, land.position.x - land.baseSize)
      const minY = Math.max(0, land.position.y - land.baseSize)
      const maxX = Math.min(sizeX, land.position.x + land.baseSize)
      const maxY = Math.min(sizeY, land.position.y + land.baseSize)

      // this.map.setTerrain(0, 0, minX, minY, maxX, maxY, land.terrain, 1, 0)
      // TODO use setTerrain instead of this loop
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          this.map.get(x, y).terrain = land.terrain
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
          this.pushStack(stacks[i], minX - 1, y, i, 0)
        }
      }
      if (minY > 0) {
        for (let x = minX; x <= maxX; x++) {
          this.pushStack(stacks[i], x, minY - 1, i, 0)
        }
      }
      if (maxX < sizeX) {
        for (let y = minY; y <= maxY; y++) {
          this.pushStack(stacks[i], maxX + 1, y, i, 0)
        }
      }
      if (maxY < sizeY) {
        for (let x = minX; x <= maxX; x++) {
          this.pushStack(stacks[i], x, maxY + 1, i, 0)
        }
      }
    }

    this.logger.log('distributing clumps', this.lands.map(l => l.tiles))
    this.logger.log('available tiles', stacks.map(s => s.size()))
    let done = false
    while (!done) {
      done = true
      for (let i = 0; i < this.lands.length; i++) {
        const land = this.lands[i]
        this.logger.log('trying', i)
        if (landSizes[i] >= land.tiles) {
          this.logger.log('skipping', i, 'because of size')
          continue
        }
        const tile = this.popStack(stacks[i])
        if (!tile) {
          this.logger.log('skipping', i, 'because stack is empty')
          continue
        }
        const { x, y } = tile
        done = false

        if (this.chance(x, y, i) > this.random.nextRange(100)) {
          this.logger.log('skipping', i, 'because of random')
          this.searchMapRows[y][x] = -1
          continue
        }

        const cost = this.checkTerrainAndZone(land, x, y)
        if (cost === 0) {
          this.logger.log('skipping', i, 'because cost == 0', land.terrain, x, y, this.searchMapRows[y][x])
          continue
        }
        if (this.searchMapRows[y][x] === -2 && cost > 0) {
          this.logger.log('placing', i)

          this.map.get(x, y).terrain = land.terrain
          this.searchMapRows[y][x] = land.zone

          if (x > 0 && this.searchMapRows[y][x - 1] === -2) {
            this.pushStack(stacks[i], x - 1, y,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }
          if (x < sizeX && this.searchMapRows[y][x + 1] === -2) {
            this.pushStack(stacks[i], x + 1, y,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }
          if (y > 0 && this.searchMapRows[y - 1][x] === -2) {
            this.pushStack(stacks[i], x, y - 1,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }
          if (y < sizeY && this.searchMapRows[y + 1][x] === -2) {
            this.pushStack(stacks[i], x, y + 1,
              0, this.random.nextRange(100) - land.clumpiness * cost + 250)
          }

          landSizes[i] += 1
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
          this.map.get(x, y).terrain = land.terrain
        } else if (y > 0 && this.searchMapRows[y - 1][x] === land.zone &&
           y < sizeX && this.searchMapRows[y + 1][x] === land.zone) {
          this.map.get(x, y).terrain = land.terrain
        }
      }
    }
  }
}

module.exports = LandGenerator
