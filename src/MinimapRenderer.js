const terrainColors = require('genie-shared-data/terrainColors.json')
const unitColors = require('genie-shared-data/unitColors.json')
const playerColors = require('genie-shared-data/playerColors.json')

class MinimapRenderer {
  constructor (map) {
    this.map = map
  }

  render () {
    const imageData = new Uint8ClampedArray(this.map.sizeX * this.map.sizeY * 4)
    const centers = []
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get(x, y)

        let color = terrainColors[tile.terrain]
        if (tile.object) {
          const { type, player } = tile.object
          if (unitColors[type]) {
            color = unitColors[type]
          }
          if (playerColors[player]) {
            color = playerColors[player]
            if (type === 109) centers.push({ x, y, player })
          }
        }

        color = color
          .match(/^#([0-9A-F]{2})([0-9A-F]{2})([0-9A-F]{2})$/i)
          .slice(1)
          .map((c) => parseInt(c, 16))

        const b = (this.map.sizeX * y + x) * 4
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
        [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]
      ]
      for (const [x, y] of pts) {
        const b = (this.map.sizeX * (tile.y + y) + (tile.x + x)) * 4
        imageData[b + 0] = color[0]
        imageData[b + 1] = color[1]
        imageData[b + 2] = color[2]
        imageData[b + 3] = 0xFF
      }
    })

    return imageData
  }
}

module.exports = MinimapRenderer
