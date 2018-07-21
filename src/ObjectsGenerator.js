const Module = require('./Module.js')
const MapStack = require('./MapStack.js')

function toObjectPosition (tile) {
  return {
    x: tile.x + 0.5,
    y: tile.y + 0.5
  }
}

class ObjectsGenerator extends Module {
  constructor (map, parent, world, objects, hotspots) {
    super(map, parent, true)
    this.world = world
    this.objects = objects
    this.hotspots = hotspots

    this.placedObjects = []
    this.nextObjectId = 0

    this.schedule = 3.0

    this.random = parent.random
  }

  generate () {
    this.searchMap.fill(0x10)

    for (const desc of this.objects) {
      this.generateObjects(desc)
    }

    this.map.mapZones.deleteZoneMaps()
  }

  generateObjects (desc) {
    let {
      scalingType,
      landId
    } = desc

    if (scalingType === 1) {
      // Scaling to map size
      desc.numberOfGroups = this.map.sizeX * this.map.sizeY / 10000
    } else if (scalingType === 2) {
      // Scaling to player number
      desc.numberOfGroups *= this.world.numPlayers
    }
    if (desc.numberOfGroups < 1) {
      desc.numberOfGroups = 1
    }
    desc.numberOfGroups = Math.floor(desc.numberOfGroups)

    console.log('generateObject', desc.type, landId)
    if (landId < 0) {
      if (landId === -1) {
        this.placeObjects(desc)
      } else if (landId === -2) {
        this.placeAvoidObjects(desc, desc.minDistanceToPlayers)
      }
    } else {
      for (let i = 0; i < this.hotspots.length; i += 1) {
        const land = this.hotspots[i]
        if (land.id === landId) {
          this.placeLandObjects(desc, land.x, land.y, desc.minDistanceToPlayers, desc.maxDistanceToPlayers, i)
        }
      }
    }
  }

  placeObjects (desc) {
    const {
      numberOfGroups,
      maxDistanceToOtherZones,
      type
    } = desc
    const { mapZones } = this.map

    let positions = this.generatePositions(-1, -1, -1)

    const terrainRules = Array(42).fill(1) // TODO take restrictions from game data.
    this.zoneMap = mapZones.getZoneMap(terrainRules)

    let placedGroups = 0
    let tile
    while ((tile = positions.pop()) && placedGroups < numberOfGroups) {
      if (!this._checkRestrictions(tile, maxDistanceToOtherZones, Math.floor(maxDistanceToOtherZones * 10 / 14))) {
        continue
      }
      if (desc.baseTerrain !== -1 && this.map.get(tile).terrain !== desc.baseTerrain) {
        continue
      }

      const position = toObjectPosition(tile)
      positions = this.avoidPosition(positions, tile, desc.minDistanceGroupPlacement)
      positions = this.avoidPosition(positions, tile, desc.maxDistanceGroupPlacement)

      if (desc.groupingType !== 0) {
        if (desc.groupingType === 1) {
          this.placeLooseGroup(desc, tile, desc.playerId)
        } else {
          this.placeTightGroup(desc, tile, desc.playerId)
        }
      } else {
        // TODO use the `position` instead
        this.map.place(tile, {
          type: desc.type,
          playerId: desc.playerId
        })
      }

      placedGroups += 1
    }
  }

  placeAvoidObjects (desc, distance) {
  }

  placeLandObjects (desc, x, y, minDistanceToPlayers, maxDistanceToPlayers, i) {
    const { maxDistanceToOtherZones } = desc
    const playerId = desc.playerId !== -1
      ? desc.playerId
      : this.hotspots[i].playerId > 0
        ? this.hotspots[i].playerId
        : 0

    console.log('placeLandObjects', playerId)

    // TODO Change to scout if necessary

    const terrainRules = Array(42).fill(1)
    this.zoneMap = this.map.mapZones.getZoneMap(terrainRules)

    let positions = this.generatePositions({ x, y }, minDistanceToPlayers, maxDistanceToPlayers)

    let groupsLeft = desc.numberOfGroups
    if (desc.type === 83 && groupsLeft === 1) {
      groupsLeft = 3 // TODO civ specific
    }

    const coreZone = this.zoneMap.getZoneInfo(x, y)
    let next
    while (groupsLeft > 0 && (next = positions.pop())) {
      if (this._tooClose(desc, next.x, next.y)) {
        continue
      }
      if (this.zoneMap.getZoneInfo(next.x, next.y) !== coreZone) {
        continue
      }
      if (!this._checkRestrictions(next, maxDistanceToOtherZones, Math.floor(maxDistanceToOtherZones * 10 / 14))) {
        continue
      }
      if (desc.baseTerrain !== -1 && this.map.get(next).terrain !== desc.baseTerrain) {
        continue
      }

      if (false) {
        this.map.place(next, {
          type: desc.type,
          player: playerId
        })
      } else {
        positions = this.avoidPosition(positions, next, desc.minDistanceGroupPlacement)
        positions = this.avoidPosition(positions, next, desc.maxDistanceGroupPlacement)

        if (desc.groupingType === 0) {
          this.map.place(next, {
            type: desc.type,
            playerId: playerId
          })
        } else if (desc.groupingType === 1) {
          this.placeLooseGroup(desc, next, playerId)
        } else {
          this.placeTightGroup(desc, next, playerId)
        }

        this._unavoidPosition(next, desc.minDistanceGroupPlacement, 0, desc.type)
        groupsLeft--
      }
    }
    // TODO Change back if necessary
  }

  generatePositions (position, minDistance, maxDistance) {
    console.log('generating', position, minDistance, maxDistance)
    // TODO Correct implementation with min and max distance
    const stack = new MapStack()
    const size = this.map.sizeX * this.map.sizeY

    const minX = maxDistance < 0 ? 0 : Math.max(0, position.x - maxDistance)
    const minY = maxDistance < 0 ? 0 : Math.max(0, position.y - maxDistance)
    const maxX = maxDistance < 0 ? this.map.sizeX : Math.min(this.map.sizeX, position.x + maxDistance)
    const maxY = maxDistance < 0 ? this.map.sizeY : Math.min(this.map.sizeY, position.y + maxDistance)

    const diffX = maxX - minX
    const diffY = maxY - minY

    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        if (this.searchMapRows[y][x] !== 0) {
          stack.push(this.nodes[y][x])
        }
      }
    }

    let toGo = diffX * diffY / 4
    while (toGo--) {
      const x = minX + this.random.nextRange(diffX - 1)
      const y = minY + this.random.nextRange(diffY - 1)

      if (this.searchMapRows[y][x] !== 0) {
        stack.push(this.nodes[y][x])
      }
    }

    console.log('generated', stack.length)
    return stack
  }

  placeObject (typeId, amount, x, y, distanceMin, distanceMax, playerId) {
    // (0053BFF0)
    // RGE_RMM_Objects_Generator__place_object
  }

  placeLooseGroup (desc, position, playerId) {
    const stack = this.generatePositions(position, 0, desc.groupPlacementRadius)

    let toPlace = Math.max(1, (Math.random() * desc.groupVariance * 2) + desc.amount - desc.groupVariance)
    let next
    while ((next = stack.pop()) && toPlace > 0) {
      const { terrain } = this.map.get(next)
      if (desc.baseTerrain !== -1 && this.map.get(tile).terrain !== desc.baseTerrain) {
        continue
      }

      this.map.place(next, {
        type: desc.type,
        player: playerId
      })
      toPlace--
    }
  }

  placeTightGroup (desc, { x, y }, playerId) {
    const stack = new MapStack()
    stack.add(this.nodes[y][x])

    let toPlace = Math.max(1, (Math.random() * desc.groupVariance * 2) + desc.amount - desc.groupVariance)
    let next
    while ((next = stack.pop()) && toPlace > 0) {
      this.searchMapRows[next.y][next.x] = 0

      if (next.x > 0) stack.add(next.x - 1, next.y, 0, this.random.next())
      if (next.x < this.map.sizeX - 1) stack.add(next.x + 1, next.y, 0, this.random.next())
      if (next.y > 0) stack.add(next.x, next.y - 1, 0, this.random.next())
      if (next.y < this.map.sizeY - 1) stack.add(next.x, next.y + 1, 0, this.random.next())

      this.map.place(next, {
        type: desc.type,
        player: playerId
      })
      toPlace--
    }
  }

  avoidPosition (tiles, { x, y }, margin) {
    const minX = Math.max(0, x - margin)
    const minY = Math.max(0, y - margin)
    const maxX = Math.min(this.map.sizeX, x + margin)
    const maxY = Math.min(this.map.sizeY, y + margin)

    return tiles.filter((tile) =>
      tile.x >= minX && tile.x < maxX && tile.y >= minY && tile.y < maxY)
  }

  _unavoidPosition ({ x, y }, minDistance, canPlaceHere, type) {
    // In area with radius minDistance around center [x, y],
    // If restrictions for unit `type` on tile [x, y] > 0, set searchMapRows[y][x] = canPlaceHere

    const minX = Math.max(0, x - minDistance)
    const minY = Math.max(0, y - minDistance)
    const maxX = Math.min(this.map.sizeX - 1, x + minDistance)
    const maxY = Math.min(this.map.sizeY - 1, y + minDistance)

    for (let cy = minY; cy < maxY; cy += 1) {
      for (let cx = minX; cx < maxX; cx += 1) {
        this.searchMapRows[cy][cx] = canPlaceHere
      }
    }
  }

  _tooClose (desc, x, y) {
    if (desc.minDistanceToPlayers <= 0 || this.hotspots.length === 0) {
      return false
    }

    return this.hotspots.some((hs) => {
      const distX = Math.abs(hs.x - x)
      const distY = Math.abs(hs.y - y)
      return distX < desc.minDistanceToPlayers && distY < desc.minDistanceToPlayers
    })
  }

  _checkRestrictions ({ x, y }, maxDistance, cornerDistance) {
    if (!this.zoneMap || maxDistance <= 0 || cornerDistance <= 0) {
      return true
    }

    const center = this._getRestriction(x, y)

    return this._getRestriction(x, y - maxDistance) === center &&
      this._getRestriction(x + cornerDistance, y - cornerDistance) === center &&
      this._getRestriction(x + maxDistance, y) === center &&
      this._getRestriction(x + cornerDistance, y + cornerDistance) === center &&
      this._getRestriction(x, y + maxDistance) === center &&
      this._getRestriction(x - cornerDistance, y + cornerDistance) === center &&
      this._getRestriction(x - maxDistance, y) === center &&
      this._getRestriction(x - cornerDistance, y - cornerDistance) === center
  }

  _getRestriction (x, y) {
    if (x < 0) x = 0
    if (y < 0) y = 0
    if (x >= this.map.sizeX) x = this.map.sizeX - 1
    if (y >= this.map.sizeY) y = this.map.sizeY - 1

    return this.zoneMap.getZoneInfo(x, y)
  }
}

module.exports = ObjectsGenerator
