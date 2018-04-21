const by = require('sort-by')
const MapStack = require('./MapStack')

class Module {
  constructor (map, parent, resourcesNeeded) {
    this.map = map
    this.parent = parent

    // Always share the random generator.
    if (this.parent && this.parent.random) {
      this.random = this.parent.random
    }

    this.schedule = 0
    this.modules = []

    if (parent) {
      Object.assign(this, parent.shareResources())
    } else if (resourcesNeeded) {
      this.createSharedResources()
    }
  }

  generate () {
    this.modules.sort(by('schedule'))

    for (const child of this.modules) {
      console.time(child.constructor.name)
      child.generate()
      console.timeEnd(child.constructor.name)
    }
  }

  addModule (child) {
    this.modules.push(child)
  }

  removeModule (child) {
    const i = this.modules.indexOf(child)
    if (i !== -1) this.modules.splice(i, 1)
  }

  createSharedResources () {
    this.searchMap = new Uint8Array(this.map.sizeX * this.map.sizeY).fill(0)
    this.searchMapRows = []
    this.nodes = []
    for (let y = 0; y < this.map.sizeY; y++) {
      this.searchMapRows.push(this.searchMap.subarray(this.map.sizeX * y, this.map.sizeX * (y + 1)))
      const nodeRow = []
      for (let x = 0; x < this.map.sizeX; x++) {
        nodeRow.push(new MapStack.Node(x, y))
      }
      this.nodes.push(nodeRow)
    }
  }

  destroySharedResources () {
    this.searchMap = null
    this.searchMapRows = null
    this.nodes = null
  }

  updateChildMapInfo () {
    for (const child of this.children) {
      child.updateMapInfo(this.map)
    }
  }

  updateMapInfo (map) {
    this.map = map

    if (map) {
      // src initialises a list of tile rows here but we probably do not need that.
    } else {
    }

    this.updateChildMapInfo()
  }

  shareResources () {
    return {
      searchMap: this.searchMap,
      searchMapRows: this.searchMapRows,
      nodes: this.nodes,
    }
  }

  findPath () {
  }
}

module.exports = Module
