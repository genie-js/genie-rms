module.exports = class ZoneMap {
  constructor (map, terrainRules) {
    this.map = map
    this.terrainRules = terrainRules

    this.zoneMap = new Int8Array(map.sizeX * map.sizeY)
    this.zoneMapRows = []
    for (let y = 0; y < map.sizeY; y++) {
      this.zoneMapRows.push(this.zoneMap.subarray(map.sizeX * y, map.sizeX * (y + 1)))
    }

    this._sizeCache = new Int32Array(255).fill(-1)
    this.zoneInfo = new Int8Array(255)

    this.doZoneMap()
  }

  doZoneMap () {
    this.zoneInfo.fill(-1)
    this.zoneMap.fill(-1)

    let zone = 0
    for (let x = 0; x < this.map.sizeX; x++) {
      for (let y = 0; y < this.map.sizeY; y++) {
        if (this.zoneMapRows[y][x] !== -1) continue

        this.zoneMapRows[y][x] = zone
        const { terrain } = this.map.get({ x, y })
        const group = this.terrainRules[terrain] <= 0 ? 0 : 1

        this.doZoneMapArea(x, y, group, zone)

        zone = (zone + 1) % 256
      }
    }

    this.lastZone = zone
  }

  doZoneMapArea (x, y, group, zone) {
    // throw new Error('unimplemented')
  }

  checkInfo (terrainRules) {
    if (this.terrainRules.length !== terrainRules.length) {
      return false
    }

    return this.terrainRules.every((passability, i) =>
      Math.sign(passability) === Math.sign(terrainRules[i]))
  }

  getZoneInfo (x, y) {
    return this.zoneMapRows[y][x]
  }

  withinRange (start, goal, range) {
    throw new Error('unimplemented')
  }

  numberTilesInZone (zone) {
    if (this._sizeCache[zone] === -1) {
      this._sizeCache[zone] = this.zoneMap.filter((value) => value === zone).length
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
        const { terrain } = this.map.get({ x, y })
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
