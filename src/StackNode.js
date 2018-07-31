class StackNode {
  constructor () {
    this.x = -1
    this.y = -1
    this.next = null
    this.prev = null
    this.cost = 0
    this.totalCost = 0
  }

  unlink () {
    this.prev = null
    this.next = null
  }

  deinit () {
    if (this.next) {
      this.next.prev = null
      this.next = null
    }
  }

  clear () {
    this.cost = 0
    this.totalCost = 0
  }

  size () {
    return this.next ? this.next.size() + 1 : 1
  }
}

module.exports = StackNode
