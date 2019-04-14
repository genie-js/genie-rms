const Logger = require('./Logger.js')
const Module = require('./Module.js')
const StackNode = require('./StackNode.js')

const { floor } = Math

function isWall (id) {
  return id === 117 || // stone
    id === 155 || // fortified
    id === 72 // palisade
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

    this.logger = new Logger('objects')
    this.random = parent.random
  }

  generate () {
    this.searchMap.fill(1)

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
    desc.numberOfGroups = floor(desc.numberOfGroups)

    this.logger.log('generateObject', desc.type, landId)
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

    this.logger.log('placeObjects', type)

    let positions = this.generatePositions(-1, -1, -1)

    const terrainRules = Array(42).fill(1) // TODO take restrictions from game data.
    this.zoneMap = mapZones.getZoneMap(terrainRules)

    let placedGroups = 0
    let tile
    while ((tile = this.popStack(positions)) && placedGroups < numberOfGroups) {
      if (!this._checkRestrictions(tile, maxDistanceToOtherZones, floor(maxDistanceToOtherZones * 10 / 14))) {
        continue
      }
      if (desc.baseTerrain !== -1 && this.map.get(tile.x, tile.y).terrain !== desc.baseTerrain) {
        continue
      }

      this.avoidPosition(positions, tile, desc.minDistanceGroupPlacement)

      if (desc.groupingType !== 0) {
        if (desc.groupingType === 1) {
          this.placeLooseGroup(desc, tile, desc.playerId)
        } else if (desc.groupingType === 2) {
          this.placeTightGroup(desc, tile, desc.playerId)
        }
      } else {
        // TODO use the `position` instead
        this.map.place(tile, {
          type: desc.type,
          player: desc.playerId
        })
      }

      placedGroups += 1
    }
  }

  placeAvoidObjects (desc, distance) {
    this.logger.log('placeAvoidObjects', desc.type)
  }

  _findTownCenter (ownerId) {
    for (let x = 0; x < this.map.sizeX; x++) {
      for (let y = 0; y < this.map.sizeY; y++) {
        const tile = this.map.get(x, y)
        if (tile.object && tile.object.type === 109 && tile.object.player === ownerId) {
          return { x, y }
        }
      }
    }
  }

  placeWalls (desc, minDistanceToPlayers, maxDistanceToPlayers, ownerId) {
    // TODO implement the more complex MapAnalysis based version
    const distance = minDistanceToPlayers + this.random.nextRange(maxDistanceToPlayers - minDistanceToPlayers)

    // oof
    const tc = this._findTownCenter(ownerId)
    this.logger.log('place walls for', ownerId, 'at', tc)
    const x0 = Math.max(0, tc.x - distance)
    const y0 = Math.max(0, tc.y - distance)
    const x1 = Math.min(this.map.sizeX - 1, tc.x + distance)
    const y1 = Math.min(this.map.sizeY - 1, tc.y + distance)
    for (let x = x0; x < x1; x++) {
      this.map.place({ x, y: y0 }, {
        type: desc.type,
        player: ownerId
      })
      this.map.place({ x, y: y1 }, {
        type: desc.type,
        player: ownerId
      })
    }
    for (let y = y0 + 1; y < y1 - 1; y++) {
      this.map.place({ x: x0, y }, {
        type: desc.type,
        player: ownerId
      })
      this.map.place({ x: x1, y }, {
        type: desc.type,
        player: ownerId
      })
    }
  }

  placeLandObjects (desc, x, y, minDistanceToPlayers, maxDistanceToPlayers, i) {
    const { maxDistanceToOtherZones } = desc
    const playerId = desc.playerId !== -1
      ? desc.playerId
      : this.hotspots[i].playerId > 0
        ? this.hotspots[i].playerId
        : 0

    this.logger.log('placeLandObjects', desc.type, playerId)

    // TODO Change to scout if necessary
    if (isWall(desc.type)) {
      this.placeWalls(desc, minDistanceToPlayers, maxDistanceToPlayers, playerId)
      return
    }

    const terrainRules = Array(42).fill(1)
    this.zoneMap = this.map.mapZones.getZoneMap(terrainRules)

    let positions = this.generatePositions({ x, y }, minDistanceToPlayers, maxDistanceToPlayers)
    this.logger.log('available positions for', desc.type, '=', positions.size() - 1)

    let groupsLeft = desc.numberOfGroups
    if (desc.type === 83 && groupsLeft === 1) {
      groupsLeft = 3 // TODO civ specific
    }

    const coreZone = this.zoneMap.getZoneInfo(x, y)
    let next
    while (groupsLeft > 0 && (next = this.popStack(positions))) {
      if (desc.type === 109) this.logger.log('place town center?', next)
      if (this._tooClose(desc, next.x, next.y)) {
        continue
      }
      if (this.zoneMap.getZoneInfo(next.x, next.y) !== coreZone) {
        continue
      }
      if (!this._checkRestrictions(next, maxDistanceToOtherZones, floor(maxDistanceToOtherZones * 10 / 14))) {
        continue
      }
      if (desc.baseTerrain !== -1 && this.map.get(next.x, next.y).terrain !== desc.baseTerrain) {
        continue
      }

      if (desc.groupingType === 0 && positions.next === null) {
        this.map.place(next, {
          type: desc.type,
          player: playerId
        })
      } else {
        this.avoidPosition(positions, next, desc.minDistanceGroupPlacement)
        // this.avoidPosition(positions, next, desc.maxDistanceGroupPlacement)

        if (desc.groupingType === 0) {
          this.map.place(next, {
            type: desc.type,
            player: playerId
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
    this.logger.log('generating', position, minDistance, maxDistance)
    // TODO Correct implementation with min and max distance
    const stack = new StackNode()

    const minX = maxDistance < 0 ? 0 : Math.max(0, position.x - maxDistance)
    const minY = maxDistance < 0 ? 0 : Math.max(0, position.y - maxDistance)
    const maxX = maxDistance < 0 ? this.map.sizeX - 1 : Math.min(this.map.sizeX - 1, position.x + maxDistance)
    const maxY = maxDistance < 0 ? this.map.sizeY - 1 : Math.min(this.map.sizeY - 1, position.y + maxDistance)

    const diffX = maxX - minX
    const diffY = maxY - minY

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (this.searchMapRows[y][x] !== 0) {
          this.addStackNode(stack, this.nodes[y][x])
        }
      }
    }

    let toGo = floor(diffX * diffY / 4)
    this.logger.log('randomizeStack', toGo)
    while (toGo--) {
      const x = minX + this.random.nextRange(diffX - 1)
      const y = minY + this.random.nextRange(diffY - 1)

      if (this.searchMapRows[y][x] !== 0) {
        this.addStackNode(stack, this.nodes[y][x])
      }
    }

    this.logger.log('generated', stack.size())
    return stack
  }

  placeObject (typeId, amount, x, y, distanceMin, distanceMax, playerId) {
    // (0053BFF0)
    // RGE_RMM_Objects_Generator__place_object
  }

  placeLooseGroup (desc, position, playerId) {
    const stack = this.generatePositions(position, 0, desc.groupPlacementRadius)

    let toPlace = Math.max(1, this.random.nextRange(desc.groupVariance * 2) + desc.amount - desc.groupVariance)
    let next
    while ((next = this.popStack(stack)) && toPlace > 0) {
      const { terrain } = this.map.get(next.x, next.y)
      if (desc.baseTerrain !== -1 && terrain !== desc.baseTerrain) {
        continue
      }

      this.map.place(next, {
        type: desc.type,
        player: playerId
      })
      toPlace -= 1
    }
  }

  placeTightGroup (desc, { x, y }, playerId) {
    const stack = new StackNode()
    this.addStackNode(stack, this.nodes[y][x])

    let toPlace = Math.max(1, this.random.nextRange(desc.groupVariance * 2) + desc.amount - desc.groupVariance)
    let next
    while ((next = this.popStack(stack)) && toPlace > 0) {
      this.searchMapRows[next.y][next.x] = 0

      if (next.x > 0) this.pushStack(stack, next.x - 1, next.y, 0, this.random.next())
      if (next.x < this.map.sizeX - 1) this.pushStack(stack, next.x + 1, next.y, 0, this.random.next())
      if (next.y > 0) this.pushStack(stack, next.x, next.y - 1, 0, this.random.next())
      if (next.y < this.map.sizeY - 1) this.pushStack(stack, next.x, next.y + 1, 0, this.random.next())

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

    for (const node of this.nodes) {
      if (node.x >= minX && node.x < maxX && node.y >= minY && node.y <= maxY) {
        this.removeStackNode(node)
      }
    }
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
