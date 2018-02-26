const Module = require('./Module')
const MapStack = require('./MapStack')

function toObjectPosition (tile) {
  return {
    x: tile.x + 0.5,
    y: tile.y + 0.5
  }
}

class ObjectsGenerator extends Module {
  constructor (map, parent, world, objects) {
    super(map, parent, true)
    this.world = world
    this.objects = objects

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
      numberOfGroups,
      landId
    } = desc

    if (scalingType === 1) {
      // Scaling to map size
      numberOfGroups *= this.map.sizeX * this.map.sizeY / 10000
    } else if (scalingType === 2) {
      // Scaling to player number
      numberOfGroups *= this.world.numPlayers
    }
    if (numberOfGroups < 1) {
      numberOfGroups = 1
    }

    console.log('generateObject', desc.type)
    if (landId < 0) {
      if (landId === -1) {
        this.placeObjectsAnywhere(desc)
      } else if (landId === -2) {
        this.placeObjectsAvoidingPlayers(desc, desc.minDistanceToPlayers)
      }
    } else {
      const tiles = this.generatePositions()
    }
  }

  placeObjectsAnywhere (desc) {
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
      if (!this._checkRestrictions(tile, maxDistanceToOtherZones, maxDistanceToOtherZones * 10 / 14)) {
        continue
      }
      if (desc.baseTerrain !== -1 && this.map.get(tile).terrain !== desc.baseTerrain) {
        continue
      }

      const position = toObjectPosition(tile)
      positions = this.avoidPosition(positions, tile, desc.minDistanceGroupPlacement)
      positions = this.avoidPosition(positions, tile, desc.maxDistanceGroupPlacement)

      if (desc.grouping !== 0) {
        if (desc.grouping === 1) {
          this.placeLooseGroup(desc, tile)
        } else {
          this.placeTightGroup(desc, tile)
        }
      } else {
        this.map.place(tile, desc.type) // TODO use the `position` instead
      }

      placedGroups += 1
    }
  }

  generatePositions (position, minDistance, maxDistance) {
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
        if (!this.searchMapRows[y]) console.log({ x, y })
        if (this.searchMapRows[y][x]) {
          stack.push(this.nodes[y][x])
        }
      }
    }

    let toGo = diffX * diffY / 4
    while (toGo--) {
      const x = minX + this.random.nextRange(diffX)
      const y = minY + this.random.nextRange(diffY)

      if (!this.searchMapRows[y]) console.log({ x, y })
      if (this.searchMapRows[y][x]) {
        stack.push(this.nodes[y][x])
      }
    }

    stack.sort()
    console.log('generated', stack.length)
    return stack
  }

  placeObject (typeId, amount, x, y, distanceMin, distanceMax, playerId) {
    // (0053BFF0)
    // RGE_RMM_Objects_Generator__place_object
  }

  sub_53C260 (desc) {
    if (desc.scalingType === 1) {
      const mapSize = this.map.sizeX * this.map.sizeY
      desc.numberOfGroups *= mapSize / 10000
      if (desc.numberOfGroups < 1) {
        desc.numberOfGroups = 1
      }
    } else if (desc.scalingType === 2) {
      const numPlayers = 8
      desc.numberOfGroups *= numPlayers - 1
      if (desc.numberOfGroups < 1) {
        desc.numberOfGroups = 1
      }
    }

    if (desc.landId < 0) {
      if (desc.landId === -1) {
        this.sub_53C9D0(this, desc)
      } else if (desc.landId === -2) {
        this.sub_53C720(this, desc, desc.minDistanceToPlayers)
      }
    } else {
      // Explicitly placed objects.
      for (let i = 0; i < this.placedObjects.length; i++) {
        const object = this.placedObjects[i]
        // This reuses the land ID in src.
        if (object.id === desc.landId) {
          const position = { x: object.x, y: object.y }
          this.placePlayerObject(this, desc, position, desc.minDistanceToPlayers, desc.maxDistanceToPlayers, i)
        }
      }
    }
  }

  placeLooseGroup (desc, position) {
    const stack = this.generatePositions(position, 0, desc.groupPlacementRadius)

    let toPlace = Math.max(1, (Math.random() * desc.groupVariance * 2) + desc.amount - desc.groupVariance)
    let next
    while ((next = stack.pop()) && toPlace > 0) {
      const { terrain } = this.map.get(next)
      if (desc.baseTerrain !== -1 && this.map.get(tile).terrain !== desc.baseTerrain) {
        continue
      }

      this.map.place(next, desc.type)
      toPlace--
    }
  }

  placeTightGroup (desc, { x, y }) {
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

      this.map.place(next, desc.type)
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
    return this.zoneMap.getZoneInfo(x, y)
  }
}

module.exports = ObjectsGenerator
