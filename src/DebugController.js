const Module = require('./Module')
const Controller = require('./Controller')

class DebugModule extends Module {
  constructor (map, controller, target) {
    super(map, controller, false)
    this.target = target
    this.schedule = target.schedule + 0.001
  }

  generate () {
    const { parent, target } = this
    parent.searchMaps.set(target.constructor.name, new Uint8Array(this.searchMap))
    parent.minimaps.set(target.constructor.name, this.map.render())
  }
}

module.exports = class DebugController extends Controller {
  addModule (module) {
    super.addModule(module)

    this.modules.push(new DebugModule(this.map, this, module))
  }

  generate () {
    this.minimaps = new Map()
    this.searchMaps = new Map()

    super.generate()
  }
}
