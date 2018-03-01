const ZoneMapList = require('./ZoneMapList')
const pngjs = require('pngjs')

class Tile {
  constructor (terrain, elevation) {
    this.terrain = terrain
    this.elevation = elevation

    this.object = null
  }

  place (object) {
    if (this.object) {
      throw new Error('Cannot place multiple objects on one tile')
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

  render () {
    const imageData = new Uint8Array(this.sizeX * this.sizeY * 4)
    for (let y = 0; y < this.sizeY; y++) {
      for (let x = 0; x < this.sizeX; x++) {
        const tile = this.get({ x, y })

        let color = require('./terrainColors')[tile.terrain]
        if (tile.object && require('./unitColors')[tile.object.type]) {
          color = require('./unitColors')[tile.object.type]
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
