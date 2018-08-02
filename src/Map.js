const Logger = require('./Logger.js')
const ZoneMapList = require('./ZoneMapList.js')
const terrainColors = require('./terrainColors.json')
const unitColors = require('./unitColors.json')
const pngjs = require('pngjs')

const playerColors = {
  1: '#0000ff',
  2: '#ff0000',
  3: '#00ff00',
  4: '#ffff00',
  5: '#00ffff',
  6: '#ff00ff',
  7: '#434343',
  8: '#ff8201'
}

const { floor, sqrt } = Math

class Tile {
  constructor () {
    this.type = 0 // Probably slope?
    this.terrain = 0
    this.elevation = 0
    this.object = null
  }
}

function reverseDirection (d) {
  return (d + 2) % 4
}

class Map {
  constructor () {
    this.sizeX = 120
    this.sizeY = 120

    this.terrain = []
    while (this.terrain.length < this.sizeY) {
      const row = []
      while (row.length < this.sizeX) {
        row.push(new Tile())
      }
      this.terrain.push(row)
    }

    this.logger = new Logger('map')
    this.mapZones = new ZoneMapList(this)
  }

  get ({ x, y }) {
    return this.terrain[y][x]
  }
  get_ (x, y) {
    return this.terrain[y][x]
  }

  place (coords, unit) {
    this.logger.log('placing', unit, 'on', coords)
    const tile = this.get(coords)
    if (tile.object) {
      const { x, y } = coords
      this.logger.warn(this.logger.red(`Tried placing an object on a tile that already has an object (${x},${y})`))
      return
    }
    tile.object = unit
  }

  cleanTerrain (minX, minY, maxX, maxY, terrain) {
    if (minX < 0) minX = 0
    if (minY < 0) minY = 0
    if (maxX >= this.sizeX) maxX = this.sizeX - 1
    if (maxY >= this.sizeY) maxY = this.sizeY - 1

    this.logger.log('cleanTerrain', { minX, minY, maxX, maxY, terrain })
    const world = null

    let didUpdate = true
    while (didUpdate) {
      didUpdate = false

      // Widen cleaning area as long as we still had updates on the last iteration
      if (minX > 0) minX -= 1
      if (minY > 0) minY -= 1
      if (maxX < this.sizeX - 1) maxX += 1
      if (maxY < this.sizeY - 1) maxY += 1

      if (minY > maxY) { continue }
      if (minX > maxX) { continue }

      for (let pass = 0; pass < 2; pass += 1) {
        for (let y = minY; y <= maxY; y += 1) {
          for (let x = minX; x <= maxX; x += 1) {
            if (this.get_(x, y).terrain === terrain) {
              continue
            }

            const topIsSame = y > 0 && this.get_(x, y - 1).terrain === terrain
            const bottomIsSame = y < this.sizeY - 1 && this.get_(x, y + 1).terrain === terrain
            const leftIsSame = x > 0 && this.get_(x - 1, y).terrain === terrain
            const rightIsSame = x < this.sizeX - 1 && this.get_(x + 1, y).terrain === terrain
            let bottomLeftIsSame = false
            let topLeftIsSame = false
            let topRightIsSame = false
            let bottomRightIsSame = false
            if (pass !== 1) {
              bottomRightIsSame = false // ?
              // was GOTO to inside the if() after this else block
            } else if (y > 0) {
              topLeftIsSame = x > 0 && this.get_(x - 1, y - 1).terrain === terrain
              topRightIsSame = x < this.sizeX - 1 && this.get_(x + 1, y - 1).terrain === terrain
            }
            if (y >= this.sizeY - 1) {
              bottomRightIsSame = false
            } else {
              bottomLeftIsSame = x > 0 && this.get_(x - 1, y + 1).terrain === terrain
              bottomRightIsSame = x < this.sizeX - 1 && this.get_(x + 1, y + 1).terrain === terrain
            }
            let shouldUpdate = false
            if (pass) {
              if (topLeftIsSame &&
                  ((topRightIsSame && !topIsSame) ||
                   (rightIsSame && !topRightIsSame) ||
                   (bottomLeftIsSame && !leftIsSame) ||
                   (bottomIsSame && !bottomLeftIsSame) ||
                   (bottomRightIsSame && !bottomIsSame && !rightIsSame))) {
                shouldUpdate = true
              }
              if (topRightIsSame &&
                  !shouldUpdate &&
                  ((topLeftIsSame && !topIsSame) ||
                   (leftIsSame && !topLeftIsSame) ||
                   (bottomRightIsSame && !rightIsSame) ||
                   (bottomIsSame && !bottomRightIsSame) ||
                   (bottomLeftIsSame && !leftIsSame && !bottomIsSame))) {
                shouldUpdate = true
              }
              if (bottomRightIsSame &&
                  !shouldUpdate &&
                  ((topRightIsSame && !rightIsSame) ||
                   (topIsSame && !topRightIsSame) ||
                   (bottomLeftIsSame && !bottomIsSame) ||
                   (leftIsSame && !bottomLeftIsSame) ||
                   (topLeftIsSame && !leftIsSame && !topIsSame))) {
                shouldUpdate = true
              }
              if (!bottomLeftIsSame) {
                if (!shouldUpdate) { continue }
                this.setTerrainAbsolute(world, x, y, terrain, 0, 0)
                didUpdate = true
                continue
              }
              if (shouldUpdate ||
                  (topLeftIsSame && !leftIsSame) ||
                  (topIsSame && !topLeftIsSame) ||
                  (bottomRightIsSame && !bottomIsSame) ||
                  (rightIsSame && !bottomRightIsSame) ||
                  (topRightIsSame && !rightIsSame && !topIsSame)) {
                this.setTerrainAbsolute(world, x, y, terrain, 0, 0)
                didUpdate = true
                continue
              }
            } else {
              if ((topIsSame && bottomIsSame) || (rightIsSame && leftIsSame)) {
                this.setTerrainAbsolute(world, x, y, terrain, 0, 0)
                didUpdate = true
                continue
              }
            }
          }
        }
      }
    }
  }

  cleanElevation () {
    // TODO
  }

  setTerrainAbsolute (world, x, y, terrain) {
    this.get_(x, y).terrain = terrain
  }

  setTerrain (world, x, y, terrain) {
    // TODO
    // (this method should be able to clear objects and fix edges)
    this.setTerrainAbsolute(world, x, y, terrain)
  }

  doTerrainBrush (x, y, size, terrain) {
    const minX = Math.max(0, x - size)
    const minY = Math.max(0, y - size)
    const maxX = Math.min(this.sizeX - 1, x + size)
    const maxY = Math.min(this.sizeY - 1, y + size)

    for (let cx = minX; cx < maxX; cx += 1) {
      for (let cy = minY; cy < maxY; cy += 1) {
        this.setTerrain(null, cx, cy, terrain, 0, 0)
      }
    }
  }

  doTerrainBrushStroke (x0, y0, x1, y1, brushSize, terrain) {
    if (x0 < 0) x0 = 0
    if (y0 < 0) y0 = 0
    if (x1 >= this.sizeX) x1 = this.sizeX - 1
    if (y1 >= this.sizeY) y1 = this.sizeY - 1

    const dx = x1 - x0
    const dy = y1 - y0
    
    let x = x0
    let y = y0
    this.doTerrainBrush(x0, y0, floor(brushSize / 2), terrain)

    for (let d = sqrt(dx ** 2 + dy ** 2); d > 0; d -= 1) {
      x += dx / d
      y += dy / d
      this.doTerrainBrush(floor(x), floor(y), floor(brushSize / 2), terrain)
    }

    if (x !== x1 || y !== y1) {
      this.doTerrainBrush(x1, y1, floor(brushSize / 2), terrain)
    }
  }

  addCliffEdge (x, y, direction, facing, saveDirection) {
    // TODO
  }

  doCliffBrush (x, y, cliffId, deleteCliff) {
    this.safeCliffX = floor(x / 3)
    this.safeCliffY = floor(y / 3)
    if (this.oldCliffX === this.safeCliffX && this.oldCliffY === this.safeCliffY
        || 3 * this.safeCliffX + 2 >= this.sizeX
        || 3 * this.safeCliffY + 2 >= this.sizeY
        || this.safeCliffX < 0
        || this.safeCliffY < 0
    ) {
      return false
    }

    let cliffX = this.safeCliffX
    let cliffY = this.safeCliffY
    if (this.oldCliffX !== -1 && this.oldCliffY !== -1) {
      const dx = x - 3 * this.oldCliffX
      const dy = y - 3 * this.oldCliffY
      let valid = false
      if (dx >= 3 || dx <= -1) {
        safeCliffY = this.oldCliffY
        valid = true
      }
      if (dy >= 3 || dy <= -1) {
        safeCliffX = this.oldCliffX
        valid = true
      }
      if (!valid) return false
    }

    if (safeCliffX === this.oldCliffX && safeCliffY === this.oldCliffY) {
      return true
    }

    if (deleteCliff) {
      return true
    }

    if (this.oldCliffX === -1) {
      this.oldCliffDirection = -1
      this.oldCliffX = safeCliffX
      this.oldCliffY = safeCliffY
      return true
    }

    const direction = this.oldCliffX === safeCliffX
      ? (this.oldCliffY < safeCliffY ? 1 : 3)
      : (this.oldCliffX < safeCliffX ? 0 : 2)

    const unk = this.addCliffEdge(this.oldCliffX, this.oldCliffY, direction, 0, this.oldCliffDirection)
    const otherDirection = reverseDirection(direction)
    this.oldCliffDirection = otherDirection
    this.oldCliffX = safeCliffX
    this.oldCliffY = safeCliffY
    this.addCliffEdge(safeCliffX, safeCliffY, otherDirection, unk, -1)
    return true
  }

  doCliffBrushStroke (x0, y0, x1, y1, cliffId, deleteCliff) {
    if (x0 < 0) x0 = 0
    if (y0 < 0) y0 = 0
    if (x1 >= this.sizeX) x1 = this.sizeX - 1
    if (y1 >= this.sizeY) y1 = this.sizeY - 1

    const dx = x1 - x0
    const dy = y1 - y0

    let x = x0
    let y = y0
    this.doCliffBrush(x0, y0, cliffId, deleteCliff)

    for (let d = sqrt(dx ** 2 + dy ** 2); d > 0; d -= 1) {
      x += dx / d
      y += dy / d
      this.doCliffBrush(floor(x), floor(y), cliffId, deleteCliff)
    }

    if (x !== x1 || y !== y1) {
      this.doCliffBrush(x1, y1, cliffId, deleteCliff)
    }
  }

  getImageData () {
    const imageData = new Uint8ClampedArray(this.sizeX * this.sizeY * 4)
    const centers = []
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        const tile = this.get_(x, y)

        let color = terrainColors[tile.terrain]
        if (tile.object && unitColors[tile.object.type]) {
          color = unitColors[tile.object.type]
        }
        if (tile.object && playerColors[tile.object.player]) {
          color = playerColors[tile.object.player]
          if (tile.object.type === 109) centers.push({ x, y, player: tile.object.player })
        }

        color = color
          .match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i)
          .slice(1)
          .map((c) => parseInt(c, 16))

        const b = (this.sizeX * y + x) * 4
        imageData[b + 0] = color[0]
        imageData[b + 1] = color[1]
        imageData[b + 2] = color[2]
        imageData[b + 3] = 0xFF
      }
    }

    centers.forEach((tile) => {
      const color = playerColors[tile.player]
        .match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i)
        .slice(1)
        .map((c) => parseInt(c, 16))

      const pts = [
        [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
        [-1, -2], [-1, 2],
        [0, -2], [0, 2],
        [1, -2], [1, 2],
        [2, -2], [2, -1], [2, 0], [2, 1], [2, 2],
      ]
      for (const [x, y] of pts) {
        const b = (this.sizeX * (tile.y + y) + (tile.x + x)) * 4
        imageData[b + 0] = color[0]
        imageData[b + 1] = color[1]
        imageData[b + 2] = color[2]
        imageData[b + 3] = 0xFF
      }
    })

    return imageData
  }

  render () {
    const imageData = this.getImageData()

    if (pngjs && typeof pngjs.PNG === 'function') {
      const png = new pngjs.PNG({
        width: this.sizeX,
        height: this.sizeY
      })
      png.data = global.Buffer.from(imageData)

      return png.pack()
    }

    const canvas = document.createElement('canvas')
    canvas.width = this.sizeX
    canvas.height = this.sizeY

    canvas.getContext('2d').putImageData(new ImageData(imageData, this.sizeX, this.sizeY), 0, 0)

    return canvas
  }
}

module.exports = Map
