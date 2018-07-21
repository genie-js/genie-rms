const ZoneMap = require('./ZoneMap.js')

module.exports = class ZoneMapList {
  constructor (map) {
    this.map = map
    this.zoneMaps = []
  }

  createZoneMap (terrainRules) {
    const zoneMap = new ZoneMap(this.map, terrainRules)
    this.zoneMaps.push(zoneMap)

    return zoneMap
  }

  getZoneMap (terrainRules) {
    if (typeof terrainRules === 'number') return this.zoneMaps[terrainRules]

    let zoneMap = this.zoneMaps.find((zoneMap) => zoneMap.checkInfo(terrainRules))
    if (zoneMap) {
      return zoneMap
    }

    return this.createZoneMap(terrainRules)
  }

  deleteZoneMaps () {
    this.zoneMaps = []
  }
}
