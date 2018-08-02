const Logger = require('./Logger.js')
const Module = require('./Module.js')
const StackNode = require('./StackNode.js')

class CliffGenerator extends Module {
  constructor (map, parent, cliffs, hotspots) {
    super(map, parent, true)
    this.info = cliffs
    this.hotspots = hotspots
    this.validCliffSites = null

    this.logger = new Logger('cliffs')
    this.schedule = 1.75
  }

  generate () {
    const { minNumber, maxNumber } = this.info

    this.logger.log('setupCliffMaps')
    this.setupCliffMaps()

    const numberOfCliffs = minNumber + this.random.nextRange(maxNumber - minNumber)
    this.logger.log('generateCliffs', numberOfCliffs)
    for (let i = 0; i < numberOfCliffs; i += 1) {
      this.generateCliff()
    }
  }

  generateCliff () {
    const { minLength, maxLength, minDistanceBetweenCliffs, curliness } = this.info
    const size = minLength + this.random.nextRange(maxLength - minLength)
    if (this.validCliffSites.length === 0 || size < 3) return

    const cliffStack = new StackNode()
    let x = 0
    let y = 0
    while (true) {
      const node = this.popStack(this.validCliffSites)
      if (!node) return
      if (this.searchMapRows[node.y][node.x] !== 0) {
        x = node.x
        y = node.y
        break
      }
    }

    const validHeight = this.searchMapRows[y][x]
    this.pushStack(cliffStack, x, y, 0, 0)
    this.searchMapRows[y][x] = 0

    let direction = this.random.nextRange(4)
    for (let i = 0; i < size; i += 1) {
      const r = this.random.nextRange(100)
      if (r < curliness / 2) {
        direction -= 1
        if (direction < 0) direction += 4
      } else if (r < curliness) {
        direction += 1
        if (direction > 3) direction -= 4
      }

      let next = this.getValidSite(direction, x, y, validHeight)
        || this.getValidSite(direction + 1, x, y, validHeight)
        || this.getValidSite(direction - 1, x, y, validHeight)
      if (!next && i === 0) {
        next = this.getValidSite(direction - 2, x, y, validHeight)
      }
      if (!next) break
      this.pushStack(cliffStack, x, y, 0, 0)
      this.searchMapRows[y][x] = 0
    }

    let prevX = -1
    let prevY = -1
    let node
    while ((node = this.popStack(cliffStack))) {
      if (prevX === -1) {
        prevX = node.x
        prevY = node.y
      }

      this.map.doTerrainBrushStroke(3 * prevX + 1, 3 * prevY + 1, 3 * x + 1, 3 * y + 1, 1, 16)
      this.map.doCliffBrushStroke(3 * prevX + 1, 3 * prevY + 1, 3 * x + 1, 3 * y + 1, 0, 0)

      prevX = node.x
      prevY = node.y
      this.invalidateArea(node.x, node.y, minDistanceBetweenCliffs)
    }
  }

  setupCliffMaps () {
    const { minDistanceToTerrain } = this.info
    const width = Math.floor(this.map.sizeX / 3)
    const height = Math.floor(this.map.sizeY / 3)

    this.clearStack()

    const validCliffSites = new StackNode()
    this.searchMap.fill(1)

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        let curTerrainHeight = -1
        let isValidCliff = true
        let isWaterArea = false

        for (let cy = 0; cy < 3; cy += 1) {
          for (let cx = 0; cx < 3; cx += 1) {
            const { terrain, elevation } = this.map.get({
              x: x + cx,
              y: y + cy
            })
            if (terrain === 0 || terrain === 6) {
              if (curTerrainHeight === -1) {
                curTerrainHeight = elevation
              } else {
                if (curTerrainHeight !== elevation) {
                  isValidCliff = false
                }
              }
            } else {
              isValidCliff = false
              if (terrain === 1 || terrain === 4 || terrain === 22) {
                isWaterArea = true
              }
            }
          }
        }

        if (isValidCliff) {
          if (this.searchMapRows[y][x]) {
            this.searchMapRows[y][x] = curTerrainHeight + 1
            this.pushStack(validCliffSites, x, y, 0, 0)
          }
        } else {
           if (isWaterArea) {
             this.invalidateArea(x, y, minDistanceToTerrain)
           }
          this.searchMapRows[y][x] = 0
        }
      }
    }

    for (const { x, y, radius } of this.hotspots) {
      this.invalidateArea(x, y, radius)
    }

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (this.searchMapRows[y][x] !== 0
            && (y <= 0 || this.searchMapRows[y - 1][x] === 0)
            && (x <= 0 || this.searchMapRows[y][x - 1] === 0)
            && (y >= height - 1 || this.searchMapRows[y + 1][x] === 0)
            && (x >= width - 1 || this.searchMapRows[y][x + 1]) === 0) {
          this.searchMapRows[y][x] = 0
          this.removeStackNode(this.nodes[y][x])
        }
      }
    }

    this.randomizeStack(validCliffSites)

    this.validCliffSites = validCliffSites
  }

  /**
   * Get a valid cliff location in a particular direction,
   * with the right terrain height.
   *
   * @param {number} direction
   * @param {number} x
   * @param {number} y
   * @param {number} height
   * @return {{x: number, y: number}|null} The new coordinates if the location is valid, else null.
   */
  getValidSite (direction, x, y, height) {
    switch (direction) {
      case 0:
        if (y <= 0) return null
        y -= 1
        break
      case 1:
        if (x >= Math.floor(this.map.sizeX / 3 - 1)) return null
        x += 1
        break
      case 2:
        if (y >= Math.floor(this.map.sizeY / 3 - 1)) return null
        y += 1
        break
      case 3:
        if (x <= 0) return null
        x -= 1
        break
      default:
    }

    if (this.searchMapRows[y][x] === height) {
      return { x, y }
    }
    return null
  }

  invalidateArea(x, y, r) {
    const minX = Math.max(0, x - r)
    const minY = Math.max(0, y - r)
    const maxX = Math.min(Math.floor(this.map.sizeX / 3 - 1), x + r)
    // It _SEEMS_ like src does this wrong? I'd expect that to cause crashes but idk!
    const maxY = y + r

    if (minX > maxX || minY > maxY) return

    for (let cy = minY; cy < maxY; cy += 1) {
      for (let cx = minX; cx < maxX; cx += 1) {
        if (this.searchMapRows[cy][cx] !== 0) {
          this.searchMapRows[cy][cx] = 0
          this.removeStackNode(this.nodes[cy][cx])
        }
      }
    }
  }
}

module.exports = CliffGenerator
