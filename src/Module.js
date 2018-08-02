const bySchedule = require('./sortBy.js')('schedule')
const StackNode = require('./StackNode.js')

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
    this.modules.sort(bySchedule)

    for (const child of this.modules) {
      console.log(child.constructor.name, 'start')
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
        const node = new StackNode()
        node.x = x
        node.y = y
        nodeRow.push(node)
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

  getStackNode (x, y) {
    return this.nodes[y][x]
  }

  initStack (stack) {
    // NOOP
  }

  deinitStack (stack) {
    stack.deinit()
  }

  pushStack (stack, x, y, cost, totalCost) {
    const node = this.getStackNode(x, y)
    this.removeStackNode(node)

    let insertAfter = stack
    while (insertAfter.next && insertAfter.next.totalCost < totalCost) {
      insertAfter = insertAfter.next
    }

    this.addStackNode(insertAfter, node)
    node.cost = cost
    node.totalCost = totalCost
  }

  popStack (stack) {
    if (!stack.next) return null
    const node = stack.next
    this.removeStackNode(node)
    return node
  }

  addStackNode (stack, node) {
    if (node.next || node.prev) {
      this.removeStackNode(node)
    }
    node.prev = stack
    node.next = stack.next
    if (node.next) node.next.prev = node
    stack.next = node
  }

  removeStackNode (node) {
    if (node.prev) node.prev.next = node.next
    if (node.next) node.next.prev = node.prev
    node.prev = null
    node.next = null
  }

  clearStack () {
    for (let y = 0; y < this.map.sizeY; y += 1) {
      for (let x = 0; x < this.map.sizeX; x += 1) {
        this.nodes[y][x].cost = 0
        this.nodes[y][x].totalCost = 0
      }
    }
  }

  randomizeStack (stack) {
    const array = []
    let node = stack.next
    while (node) {
      array.push(node)
      node = node.next
    }

    let len = array.length
    while (len) {
      const rand = this.random.nextRange(len)
      len -= 1
      const t = array[len]
      array[len] = array[rand]
      array[rand] = t
    }

    if (array.length === 0) {
      return
    }

    array.forEach((node, i) => {
      node.prev = array[i - 1]
      node.next = array[i + 1]
    })
    array[0].prev = stack
    stack.next = array[0]
  }

  filterStack (stack, fn) {
    let node = stack
    let head = null
    while (node) {
      const next = node.next
      if (!fn(node)) this.removeStackNode(node)
      else if (!head) head = node

      node = next
    }
    return head
  }

  findPath () {
  }
}

module.exports = Module
