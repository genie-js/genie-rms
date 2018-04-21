const fs = require('fs')
const path = require('path')
const Module = require('./Module')
const CRandom = require('./CRandom')
const Map = require('./Map')
const World = require('./World')
const Parser = require('./Parser')
const LandGenerator = require('./LandGenerator')
const TerrainGenerator = require('./TerrainGenerator')
const ElevationGenerator = require('./ElevationGenerator')
const ConnectionGenerator = require('./ConnectionGenerator')
const ObjectsGenerator = require('./ObjectsGenerator')
const CliffGenerator = require('./CliffGenerator')
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
    this.parser.end()
    console.timeEnd('parse')

    /*
    if (this.parser.elevation) {
      this.addModule(new ElevationGenerator(this.map, this, this.parser.elevation))
    }
    if (this.parser.connections.length > 0) {
      this.addModule(new ConnectionGenerator(this.map, this, this.parser.connections))
    }
    */
    if (this.parser.terrains.length > 0) {
      this.addModule(new TerrainGenerator(this.map, this, this.parser.terrains))
    }
    if (this.parser.objects.length > 0) {
      this.addModule(new ObjectsGenerator(this.map, this, this.world, this.parser.objects, this.parser.objectHotspots))
    }
    /*
    if (this.parser.cliffs) {
      this.addModule(new CliffGenerator(this.map, this, this.parser.cliffs))
    }
    if (this.parser.lands.length > 0) {
      this.addModule(new LandGenerator(this.map, this, this.parser.lands))
    }
    */

    super.generate()
  }
}

module.exports = ScriptController
