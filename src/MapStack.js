const by = require('sort-by')

module.exports = class MapStack extends Array {
  add (x, y, cost, totalCost) {
    const node = x instanceof MapStack.Node ? x : createNode()

    if (this.length === 0) {
      this.push(node)
      return
    }

    const existing = this.findIndex((other) => other.x === node.x && other.y === node.y)
    if (existing !== -1) {
      this.splice(existing, 1)
    }

    // Sorted insert.
    const index = this.findIndex((other) => other.totalCost >= node.totalCost)
    this.splice(index, 0, node)

    function createNode () {
      const node = new MapStack.Node(x, y)
      node.cost = cost
      node.totalCost = totalCost
      return node
    }
  }

  sort () {
    super.sort(by('totalCost'))
  }

  remove (node) {
    const index = this.findIndex((other) => other.x === node.x && other.y === node.y)
    if (index !== -1) this.splice(index, 1)
  }

  randomize () {
    // TODO port src implementation
    let len = this.length
    while (len) {
      const rand = Math.floor(Math.random() * len--)
      // Swap.
      ;[this[len], this[rand]] = [this[rand], this[len]]
    }
    return this
  }
}

module.exports.Node = class MapStackNode {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.cost = 0
    this.totalCost = 0
  }
}
