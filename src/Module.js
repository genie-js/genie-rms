const by = require('sort-by')

class Module {
  constructor (map, parent) {
    this.map = map
    this.parent = parent

    this.priority = 0
    this.children = []
  }

  addChild (child) {
    this.children.push(child)
  }

  removeChild (child) {
    const i = this.children.indexOf(child)
    if (i !== -1) this.children.splice(i, 1)
  }

  runChildGenerators () {
    this.children.sort(by('priority'))

    for (const child of this.children) {
      child.generate()
    }
  }
}

module.exports = Module
