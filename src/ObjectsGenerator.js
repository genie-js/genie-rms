const Module = require('./Module')

function restrictionsAllowPlacingObject (desc, tile) {
  // TODO
  return true
}

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
    
    this.priority = 3.0

    this.random = parent.random
  }

  generate () {
    for (const desc of this.objects) {
      this.generateObjects(desc)
    }
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
      numberOfGroups
    } = desc

    let positions = this.generatePositions()

    let placedGroups = 0
    let tile
    while ((tile = positions.pop()) && placedGroups < numberOfGroups) {
      if (!restrictionsAllowPlacingObject(desc, tile)) {
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
    const list = []
    const size = this.map.sizeX * this.map.sizeY
    for (let i = 0; i < size; i++) {
      const y = this.random.nextRange(this.map.sizeY)
      const x = this.random.nextRange(this.map.sizeX)
      list.push({ x, y })
    }
    return list
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

  avoidPosition (tiles, { x, y }, margin) {
    const minX = Math.max(0, x - margin)
    const minY = Math.max(0, y - margin)
    const maxX = Math.min(this.map.sizeX, x + margin)
    const maxY = Math.min(this.map.sizeY, y + margin)

    return tiles.filter((tile) =>
      tile.x >= minX && tile.x < maxX && tile.y >= minY && tile.y < maxY)
  }
}

module.exports = ObjectsGenerator
