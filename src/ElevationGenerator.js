const Module = require('./Module.js')
const MapStack = require('./MapStack.js')

class ElevationGenerator extends Module {
  constructor (map, parent, elevations, hotspots) {
    super(map, parent, true)
    this.elevations = elevations
    this.hotspots = hotspots

    this.schedule = 1.5
  }

  _resetElevation () {
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get({ x, y })
        tile.elevation = 0
      }
    }
  }

  generate () {
    this.clearStack()
    this._resetElevation()
    this._prepareSearchMap()

    for (const elevation of this.elevations) {
      this.generateElevation(elevation)
    }
  }

  _prepareSearchMap () {
    this.searchMap.fill(0)
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        let sum = 0;
        for (const hotspot of this.hotspots) {
          const distX = Math.abs(x - hotspot.x)
          const distY = Math.abs(y - hotspot.y)
          const value = hotspot.radius * Math.sqrt(distX * distX + distY * distY)
          if (value > 0) {
            sum += value * hotspot.fade
          }
        }

        if (sum > 100) sum = 101
        this.searchMapRows[y][x] = sum
      }
    }
  }

  generateElevation (elevation) {
    const { baseTerrain, baseElevation, spacing, height, numberOfTiles } = elevation
    let { numberOfClumps } = elevation
    if (numberOfClumps > 999) numberOfClumps = 999

    const clumps = []
    for (let i = 0; i < numberOfClumps; i++) {
      clumps.push(new MapStack())
    }

    const mainStack = this.findTiles(baseTerrain, baseElevation)

    for (const clump of clumps) {
      const node = mainStack.pop()
      if (!node) break
      if (this.searchMapRows[node.y][node.x] === 0 &&
          this.matchesTerrain(node.x, node.y, baseTerrain, baseElevation, spacing)) {
        const tile = this.map.get({ x, y })
        tile.elevation = height

        if (node.x > 0) clump.add(node.x - 1, node.y, 0, 0)
        if (node.y > 0) clump.add(node.x, node.y - 1, 0, 0)
        if (node.x < this.map.sizeX - 1) clump.add(node.x + 1, node.y, 0, 0)
        if (node.y < this.map.sizeY - 1) clump.add(node.x, node.y + 1, 0, 0)
      }
    }
  }

  findTiles (baseTerrain, baseElevation) {
    const stack = new MapStack()

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get({ x, y })
        if (tile.terrain === baseTerrain && tile.elevation === baseElevation && this.searchMapRows[y][x] === 0) {
          stack.add(this.nodes[y][x])
        }
      }
    }

    return stack.randomize()
  }
}

module.exports = ElevationGenerator
