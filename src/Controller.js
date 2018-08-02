const Logger = require('./Logger.js')
const Module = require('./Module.js')
const CRandom = require('./CRandom.js')
const Map = require('./Map.js')
const World = require('./World.js')
const Parser = require('./Parser.js')
const LandGenerator = require('./LandGenerator.js')
const TerrainGenerator = require('./TerrainGenerator.js')
const ElevationGenerator = require('./ElevationGenerator.js')
const ConnectionGenerator = require('./ConnectionGenerator.js')
const ObjectsGenerator = require('./ObjectsGenerator.js')
const CliffGenerator = require('./CliffGenerator.js')
const randomMapDef = require('./randomMapDef.js')

class ScriptController extends Module {
  constructor (source, options = {}) {
    super(null, null, false)
    this.source = source
    this.options = options

    this.random = new CRandom(this.options.randomSeed || Date.now())

    this.logger = new Logger('controller')
    this.map = new Map()
    this.world = new World()

    if (typeof this.options.onWarn === 'function') {
      this.onWarn = this.options.onWarn
    }
  }

  onWarn (err) {
    this.logger.warn(
      this.logger.grey(`(${err.line}:${err.column})`),
      this.logger.red(err.message)
    )
  }

  generate () {
    this.logger.log('generating map with seed', this.random.seed)

    this.parser = new Parser({
      random: this.random,
      onWarn: this.onWarn.bind(this)
    })

    this.createSharedResources()

    this.logger.time('parse')
    this.parser.write(randomMapDef)
    this.parser.write(this.source)
    const parseResult = this.parser.end()
    this.logger.timeEnd('parse')

    this.logger.log(parseResult)

    if (parseResult.elevation) {
      this.addModule(new ElevationGenerator(this.map, this, parseResult.elevation, parseResult.elevationHotspots))
    }
    if (parseResult.connections.length > 0) {
      this.addModule(new ConnectionGenerator(this.map, this, parseResult.connections))
    }
    if (parseResult.terrains.length > 0) {
      this.addModule(new TerrainGenerator(this.map, this, parseResult.terrains, parseResult.terrainHotspots))
    }
    if (parseResult.objects.length > 0) {
      this.addModule(new ObjectsGenerator(this.map, this, this.world, parseResult.objects, parseResult.objectHotspots))
    }
    if (parseResult.cliffs) {
      this.addModule(new CliffGenerator(this.map, this, parseResult.cliffs, parseResult.cliffHotspots))
    }
    if (parseResult.lands.length > 0) {
      this.addModule(new LandGenerator(this.map, this, parseResult.lands))
    }

    super.generate()
  }
}

module.exports = ScriptController
