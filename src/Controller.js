const fs = require('fs')
const path = require('path')
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
const randomMapDef = fs.readFileSync(path.join(__dirname, 'random_map.def'), 'utf8')

class ScriptController extends Module {
  constructor (source) {
    super(null, null, false)
    this.source = source
    this.random = new CRandom(Date.now())

    this.map = new Map()
    this.world = new World()
  }

  generate () {
    this.parser = new Parser({
      random: this.random
    })

    this.createSharedResources()

    console.time('parse')
    this.parser.write(randomMapDef)
    this.parser.write(this.source)
    const parseResult = this.parser.end()
    console.timeEnd('parse')

    console.log(parseResult)

    if (parseResult.elevation) {
      this.addModule(new ElevationGenerator(this.map, this, parseResult.elevation))
    }
    if (parseResult.connections.length > 0) {
      this.addModule(new ConnectionGenerator(this.map, this, parseResult.connections))
    }
    if (parseResult.terrains.length > 0) {
      this.addModule(new TerrainGenerator(this.map, this, parseResult.terrains))
    }
    if (parseResult.objects.length > 0) {
      // this.addModule(new ObjectsGenerator(this.map, this, this.world, parseResult.objects, parseResult.objectHotspots))
    }
    if (parseResult.cliffs) {
      this.addModule(new CliffGenerator(this.map, this, parseResult.cliffs))
    }
    if (parseResult.lands.length > 0) {
      this.addModule(new LandGenerator(this.map, this, parseResult.lands))
    }

    super.generate()
  }
}

module.exports = ScriptController
