const ZoneMap = require('./ZoneMap.js')

module.exports = class ZoneMapList {
  /**
   * @param {Map}
   */
  constructor (map) {
    this.map = map
    this.zoneMaps = []
  }

  /**
   * @param {Array.<number>} terrainRules
   * @return {ZoneMap}
   */
  createZoneMap (terrainRules) {
    const zoneMap = new ZoneMap(this.map, terrainRules)
    this.zoneMaps.push(zoneMap)

    return zoneMap
  }

  /**
   * @param {number|Array.<number>} terrainRules
   * @return {ZoneMap}
   */
  getZoneMap (terrainRules) {
    if (typeof terrainRules === 'number') return this.zoneMaps[terrainRules]

    let zoneMap = this.zoneMaps.find((zoneMap) => zoneMap.checkInfo(terrainRules))
    if (zoneMap) {
      return zoneMap
    }

    return this.createZoneMap(terrainRules)
  }

  /**
   */
  deleteZoneMaps () {
    this.zoneMaps = []
  }
}
