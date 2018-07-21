const ZoneMapList = require('./ZoneMapList.js')
const terrainColors = require('./terrainColors.json')
const unitColors = require('./unitColors.json')
const pngjs = require('pngjs')

class Tile {
  constructor (terrain, elevation) {
    this.type = 0 // Probably slope?
    this.terrain = terrain
    this.elevation = elevation

    this.object = null
  }

  place (object) {
    if (this.object) {
      // throw new Error('Cannot place multiple objects on one tile')
      console.warn('Cannot place multiple objects on one tile')
    }
    this.object = object
  }
}

class Map {
  constructor () {
    this.sizeX = 120
    this.sizeY = 120

    this.terrain = []
    while (this.terrain.length < this.sizeY) {
      const row = []
      while (row.length < this.sizeX) {
        row.push(new Tile(0, 0))
      }
      this.terrain.push(row)
    }

    this.mapZones = new ZoneMapList(this)
  }

  get ({ x, y }) {
    return this.terrain[y][x]
  }

  place (tile, unit) {
    console.log('placing', unit, 'on', tile)
    this.get(tile).place(unit)
  }

  cleanTerrain (minX, minY, maxX, maxY, terrain) {
    if (minX < 0) minX = 0
    if (minY < 0) minY = 0
    if (maxX >= this.sizeX) maxX = this.sizeX - 1
    if (maxY >= this.sizeY) maxY = this.sizeY - 1

    console.log('cleanTerrain', { minX, minY, maxX, maxY, terrain })

    let didUpdate = true
    while (didUpdate) {
      didUpdate = false

      // Widen cleaning area as long as we still had updates on the last iteration
      if (minX > 0) minX -= 1
      if (minY > 0) minY -= 1
      if (maxX < this.sizeX - 1) maxX += 1
      if (maxY < this.sizeY - 1) maxY += 1

      for (let pass = 0; pass < 2; pass += 1) {
        if (minY > maxY) {
          continue
        }
        for (let y = minY; y <= maxY; y += 1) {
          if (minX > maxX) {
            continue
          }
          for (let x = minX; x <= maxX; x += 1) {
            if (this.get({ x: minX, y: y }).terrain === terrain) {
              continue
            }
            const topIsSame = y > 0 && this.get({ x, y: y - 1 }).terrain === terrain
            const bottomIsSame = y < this.sizeY - 1 && this.get({ x, y: y + 1 }).terrain === terrain
            const leftIsSame = x > 0 && this.get({ x: x - 1, y }).terrain === terrain
            const rightIsSame = x < this.sizeX - 1 && this.get({ x: x + 1, y }).terrain === terrain
            let bottomLeftIsSame = false
            let topLeftIsSame = false
            let topRightIsSame = false
            let bottomRightIsSame = false
            if (pass !== 1) {
              bottomRightIsSame = false // ?
              // was GOTO to inside the if() after this else block
            } else if (y > 0) {
              topLeftIsSame = x > 0 && this.get({ x: x - 1, y: y - 1 }).terrain === terrain
              topRightIsSame = x < this.sizeX - 1 && this.get({ x: x + 1, y: y - 1 }).terrain === terrain
            }
            if (y >= this.sizeY - 1) {
              bottomRightIsSame = false
            } else {
              bottomLeftIsSame = x > 0 && this.get({ x: x - 1, y: y + 1 }).terrain === terrain
              bottomRightIsSame = x < this.sizeX - 1 && this.get({ x: x + 1, y: y + 1 }).terrain === terrain
            }
            let shouldUpdate = false
            if (pass) {
              if (topLeftIsSame &&
                  ((topRightIsSame && !topIsSame) ||
                   (rightIsSame && !topRightIsSame) ||
                   (bottomLeftIsSame && !leftIsSame) ||
                   (bottomIsSame && !bottomLeftIsSame) ||
                   (bottomRightIsSame && !bottomIsSame && !rightIsSame))) { shouldUpdate = true }
              if (topRightIsSame &&
                  !shouldUpdate &&
                  ((topLeftIsSame && !topIsSame) ||
                   (leftIsSame && !topLeftIsSame) ||
                   (bottomRightIsSame && !rightIsSame) ||
                   (bottomIsSame && !bottomRightIsSame) ||
                   (bottomLeftIsSame && !leftIsSame && !bottomIsSame))) { shouldUpdate = true }
              if (bottomRightIsSame &&
                  !shouldUpdate &&
                  ((topRightIsSame && !rightIsSame) ||
                   (topIsSame && !topRightIsSame) ||
                   (bottomLeftIsSame && !bottomIsSame) ||
                   (leftIsSame && !bottomLeftIsSame) ||
                   (topLeftIsSame && !leftIsSame && !topIsSame))) { shouldUpdate = true }
              if (!bottomLeftIsSame) {
                if (!shouldUpdate) { continue }
                this.setTerrainAbsolute(null /* world */, x, y, terrain, 0, 0)
                didUpdate = true
                continue
              }
              if (shouldUpdate ||
                  (topLeftIsSame && !leftIsSame) ||
                  (topIsSame && !topLeftIsSame) ||
                  (bottomRightIsSame && !bottomIsSame) ||
                  (rightIsSame && !bottomRightIsSame) ||
                  (topRightIsSame && !rightIsSame && !topIsSame)) {
                this.setTerrainAbsolute(null /* world */, x, y, terrain, 0, 0)
                didUpdate = true
                continue
              }
            } else {
              if ((topIsSame && bottomIsSame) || (rightIsSame && leftIsSame)) {
                this.setTerrainAbsolute(null /* world */, x, y, terrain, 0, 0)
                didUpdate = true
                continue
              }
            }
          }
        }
      } // while ( signFlag ^ overflowFlag )
    }
  }

  setTerrainAbsolute (world, x, y, terrain) {
    console.log('setTerrainAbsolute', { x, y, terrain })
    this.get({ x, y }).terrain = terrain
  }

  render () {
    const imageData = new Uint8Array(this.sizeX * this.sizeY * 4)
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        const tile = this.get({ x, y })

        let color = terrainColors[tile.terrain]
        if (tile.object && unitColors[tile.object.type]) {
          color = unitColors[tile.object.type]
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

    if (pngjs) {
      const png = new pngjs.PNG({
        width: this.sizeX,
        height: this.sizeY
      })
      png.data = Buffer.from(imageData)

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
