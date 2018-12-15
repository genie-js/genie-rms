module.exports = class ZoneMap {
  constructor (map, terrainRules) {
    this.map = map
    this.numZones = 0
    this.terrainRules = terrainRules

    this.zoneMap = new Int8Array(map.sizeX * map.sizeY)
    this.zoneMapRows = []
    for (let y = 0; y < map.sizeY; y++) {
      this.zoneMapRows.push(this.zoneMap.subarray(map.sizeX * y, map.sizeX * (y + 1)))
    }

    this.zoneInfo = new Int8Array(255).fill(-1)
    this._sizeCache = new Int32Array(255)
    this._directZoneConnections = new Uint8Array()
    this._indirectZoneConnections = new Int8Array()

    this.doZoneMap()
    this._computeConnectivity()
  }

  /**
   *
   */
  doZoneMap () {
    this.zoneInfo.fill(-1)
    this.zoneMap.fill(-1)

    let zone = 0
    for (let x = 0; x < this.map.sizeX; x++) {
      for (let y = 0; y < this.map.sizeY; y++) {
        if (this.zoneMapRows[y][x] !== -1) continue

        this.zoneMapRows[y][x] = zone
        const { terrain } = this.map.get(x, y)
        const group = this.terrainRules[terrain] <= 0 ? 0 : 1

        this.doZoneMapArea(x, y, group, zone)

        zone = (zone + 1) % 256
      }
    }

    this.numZones = zone
  }

  _checkZoneXY (zoneQueue, x, y, group, zone) {
    const curZone = this.zoneMapRows[y][x]
    if (curZone === -1) {
      const { terrain } = this.map.get(x, y)
      const curGroup = this.terrainRules[terrain] <= 0 ? 0 : 1
      if (curGroup === group) {
        this.zoneMapRows[y][x] = zone
        zoneQueue.push({ x, y })
      }
    }
  }

  /**
   *
   */
  doZoneMapArea (x, y, group, zone) {
    const zoneQueue = []

    let node
    do {
      if (x > 0) this._checkZoneXY(zoneQueue, x - 1, y, group, zone)
      if (y > 0) this._checkZoneXY(zoneQueue, x, y - 1, group, zone)
      if (x < this.map.sizeX - 1) this._checkZoneXY(zoneQueue, x + 1, y, group, zone)
      if (y < this.map.sizeY - 1) this._checkZoneXY(zoneQueue, x, y + 1, group, zone)
      node = zoneQueue.pop()

      if (node) {
        ({ x, y } = node)
      }
    } while (node)
  }

  /**
   * @return {boolean}
   */
  checkInfo (terrainRules) {
    if (this.terrainRules.length !== terrainRules.length) {
      return false
    }

    return this.terrainRules.every((passability, i) =>
      Math.sign(passability) === Math.sign(terrainRules[i]))
  }

  zonesConnect (a, b) {
    return this._directZoneConnections[a * this.numZones + b] === 1
  }

  _computeConnectivity () {
    this._directZoneConnections = new Uint8Array(this.numZones ** 2)
    this._indirectZoneConnections = new Int8Array(this.numZones ** 2)
    this._indirectZoneConnections.fill(-1)

    for (let y = 0; y < this.map.sizeY; y++) {
      for (let x = 0; x < this.map.sizeY; x++) {
        // etc
      }
    }

    for (let a = 0; a < this.numZones; a++) {
      for (let b = 0; b < this.numZones; b++) {
        if (!this.zonesConnect(a, b)) {
          const connector = this._getIndirectConnection(a, b)
          if (connector !== -1) {
            this._indirectZoneConnections[a * this.numZones + b] = connector
          }
        }
      }
    }
  }

  /**
   * Find a zone that connects two unconnected zones.
   *
   * @return {number} Zone number if found, -1 otherwise.
   */
  _getIndirectConnection (a, b) {
    for (let c = 0; c < this.numZones; c++) {
      if (this.zonesConnect(a, c) && this.zonesConnect(b, c)) {
        return c
      }
    }
    return -1
  }

  /**
   * @return {number}
   */
  getZoneInfo (x, y) {
    return this.zoneMapRows[y][x]
  }

  withinRange (start, goal, range) {
    throw new Error('unimplemented')
  }

  /**
   * @return {number}
   */
  numberTilesInZone (zone) {
    if (this._sizeCache[zone] === -1) {
      let acc = 0
      for (let i = 0; i < this.zoneMap.length; i++) {
        if (this.zoneMap[i] === zone) acc += 1
      }
      this._sizeCache[zone] = acc
    }
    return this._sizeCache[zone]
  }

  findClosestPointInTerrainType (p, type1, type2, range) {
    let closestDist = Infinity
    let closest = null

    const minX = Math.max(p.x - range, 0)
    const maxX = Math.min(p.x + range, this.map.sizeX)
    const minY = Math.max(p.y - range, 0)
    const maxY = Math.min(p.y + range, this.map.sizeY)

    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        const { terrain } = this.map.get(x, y)
        if (terrain === type1 || terrain === type2) {
          const dist = (p.x - x) ** 2 + (p.y - y) ** 2
          if (dist < closestDist) {
            closest = { x, y }
            closestDist = dist
          }
        }
      }
    }

    return closest
  }
}
