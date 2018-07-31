const Module = require('./Module.js')
const StackNode = require('./StackNode.js')

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
    if (this.elevations.length > 0) {
      this._resetElevation()
    }
    this._generateModifiers()

    for (const elevation of this.elevations) {
      this.generateElevation(elevation)
      this.map.cleanElevation(0, 0, this.map.sizeX - 1, this.map.sizeY - 1, 8)
    }
  }

  _generateModifiers () {
    this.searchMap.fill(0)
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        let modifier = 0;
        for (const hotspot of this.hotspots) {
          const distX = Math.abs(x - hotspot.x)
          const distY = Math.abs(y - hotspot.y)
          const value = hotspot.radius * Math.sqrt(distX * distX + distY * distY)
          if (value > 0) {
            modifier += value * hotspot.fade
          }
        }

        if (modifier > 100) modifier = 101
        this.searchMapRows[y][x] = modifier
      }
    }
  }

  _getModifier (x, y) {
    return this.searchMapRows[y][x]
  }

  generateElevation (elevation) {
    const { baseTerrain, baseElevation, spacing, height, numberOfTiles } = elevation
    let { numberOfClumps } = elevation
    if (numberOfClumps > 999) numberOfClumps = 999

    const clumps = []
    for (let i = 0; i < numberOfClumps; i++) {
      clumps.push(new StackNode())
    }

    const mainStack = this.findTiles(baseTerrain, baseElevation)

    for (const clump of clumps) {
      const node = mainStack.pop()
      if (!node) break
      if (this._getModifier(node.x, node.y) === 0 &&
          this._matchesTerrain(node.x, node.y, baseTerrain, baseElevation, spacing)) {
        const tile = this.map.get({ x, y })
        tile.elevation = height

        if (node.x > 0) this.pushStack(clump, node.x - 1, node.y, 0, 0)
        if (node.y > 0) this.pushStack(clump, node.x, node.y - 1, 0, 0)
        if (node.x < this.map.sizeX - 1) this.pushStack(clump, node.x + 1, node.y, 0, 0)
        if (node.y < this.map.sizeY - 1) this.pushStack(clump, node.x, node.y + 1, 0, 0)
      }
    }
  }

  findTiles (baseTerrain, baseElevation) {
    const stack = new StackNode()

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get({ x, y })
        if (tile.terrain === baseTerrain && tile.elevation === baseElevation && this._getModifier(x, y) === 0) {
          this.addStackNode(stack, this.nodes[y][x])
        }
      }
    }

    this.randomizeStack(stack)
    return stack
  }
}

module.exports = ElevationGenerator
