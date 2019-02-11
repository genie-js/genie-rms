const Module = require('./Module.js')
const StackNode = require('./StackNode.js')
const Logger = require('./Logger.js')

class ElevationGenerator extends Module {
  constructor (map, parent, elevations, hotspots) {
    super(map, parent, true)
    this.elevations = elevations
    this.hotspots = hotspots

    this.schedule = 1.5
    this.logger = new Logger('elevation')
  }

  _resetElevation () {
    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get(x, y)
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
        let modifier = 0
        for (const hotspot of this.hotspots) {
          const distX = Math.abs(x - hotspot.x)
          const distY = Math.abs(y - hotspot.y)
          const value = hotspot.radius - Math.sqrt(distX * distX + distY * distY)
          if (value > 0) {
            modifier += Math.floor(value * hotspot.fade)
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

  _matchesTerrain (x, y, terrain, elevation, spacing) {
    // TODO spacing
    const tile = this.map.get(x, y)
    return (terrain === -1 || tile.terrain === terrain) &&
      tile.elevation >= elevation
  }

  generateElevation (elevation) {
    const { baseTerrain, baseElevation, spacing, height } = elevation
    let { numberOfTiles, numberOfClumps } = elevation
    if (numberOfClumps > 999) numberOfClumps = 999

    const clumps = []
    for (let i = 0; i < numberOfClumps; i++) {
      clumps.push(new StackNode())
    }

    let placedTiles = 0
    const mainStack = this.findTiles(baseTerrain, baseElevation)
    this.logger.log('generating', clumps.length, 'clumps from', mainStack.size(), 'initial tiles')

    for (const clump of clumps) {
      const node = this.popStack(mainStack)
      if (!node) break
      if (this._getModifier(node.x, node.y) === 0 &&
          this._matchesTerrain(node.x, node.y, baseTerrain, baseElevation, spacing)) {
        const tile = this.map.get(node.x, node.y)
        tile.elevation = height
        placedTiles += 1

        if (node.x > 0) this.pushStack(clump, node.x - 1, node.y, 0, 0)
        if (node.y > 0) this.pushStack(clump, node.x, node.y - 1, 0, 0)
        if (node.x < this.map.sizeX - 1) this.pushStack(clump, node.x + 1, node.y, 0, 0)
        if (node.y < this.map.sizeY - 1) this.pushStack(clump, node.x, node.y + 1, 0, 0)
      }
    }

    let done = false
    while (!done && placedTiles < numberOfTiles) {
      done = true
      for (let i = 0; i < clumps.length; i += 1) {
        const node = this.popStack(clumps[i])
        if (!node) {
          continue
        }

        done = false

        if (this._getModifier(node.x, node.y) > this.random.nextRange(100)) {
          this.searchMapRows[node.x][node.y] = 101
          continue
        }

        if (!this._matchesTerrain(node.x, node.y, baseTerrain, baseElevation, spacing)) {
          continue
        }

        const tile = this.map.get(node.x, node.y)
        if (tile.elevation === baseElevation) {
          const chance = 250 - 15 * 1
          tile.elevation = height
          placedTiles += 1

          if (node.x > 0 && this.map.get(node.x - 1, node.y).elevation === baseElevation) {
            this.pushStack(clumps[i], node.x - 1, node.y, 0, this.random.nextRange(100) + chance)
          }
          if (node.x < this.map.sizeX - 1 && this.map.get(node.x + 1, node.y).elevation === baseElevation) {
            this.pushStack(clumps[i], node.x + 1, node.y, 0, this.random.nextRange(100) + chance)
          }
          if (node.y > 0 && this.map.get(node.x, node.y - 1).elevation === baseElevation) {
            this.pushStack(clumps[i], node.x, node.y - 1, 0, this.random.nextRange(100) + chance)
          }
          if (node.y < this.map.sizeY - 1 && this.map.get(node.x, node.y + 1).elevation === baseElevation) {
            this.pushStack(clumps[i], node.x, node.y + 1, 0, this.random.nextRange(100) + chance)
          }
        }
      }
    }

    for (const clump of clumps) {
      this.deinitStack(clump)
    }

    this.logger.log('placed', placedTiles)
  }

  findTiles (baseTerrain, baseElevation) {
    const stack = new StackNode()

    this.logger.log('find tiles', baseTerrain, baseElevation)

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeX; x++) {
        const tile = this.map.get(x, y)
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
