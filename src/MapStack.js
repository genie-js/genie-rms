const Yallist = require('yallist')
const byTotalCost = require('sort-by')('totalCost')

function createNode (x, y, cost, totalCost) {
  const node = new MapStack.Node(x, y)
  node.cost = cost
  node.totalCost = totalCost
  return node
}

function insertBefore (list, before, nnode) {
  const { prev } = before
  before.prev = node
  node.prev = prev
  node.list = list
  node.next = before
  list.length++
}

class MapStack {
  constructor () {
    this.list = Yallist.create()
  }

  get length () {
    return this.list.length
  }

  unshift (node) {
    return this.list.unshift(node)
  }
  push (node) {
    return this.list.push(node)
  }
  pop (node) {
    return this.list.pop()
  }

  add (x, y, cost, totalCost) {
    const node = x instanceof MapStack.Node ? x : createNode(x, y, cost, totalCost)

    if (this.length === 0) {
      this.push(node)
      return
    }

    if (node.list) node.list.removeNode(node)

    // Sorted insert.
    let other = this.list.head
    while (other !== undefined && other.totalCost < node.totalCost) {
      other = other.next
    }

    if (other) {
      if (other === this.list.head) {
        this.unshift(node)
      } else {
        insertBefore(this.list, other, node)
      }
    } else {
      this.push(node)
    }
  }

  sort () {
    const arr = this.list.toArray()
    this.list = Yallist.create(arr.sort(byTotalCost))
  }

  remove (node) {
    this.list.removeNode(node)
  }

  randomize () {
    // TODO port src implementation
    let len = this.length
    while (len) {
      const rand = Math.floor(Math.random() * len--)
      // Swap.
      const t = this[len]
      this[len] = this[rand]
      this[rand] = t
    }
    return this
  }
}

MapStack.Node = class MapStackNode {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.cost = 0
    this.totalCost = 0
  }
}

module.exports = MapStack
