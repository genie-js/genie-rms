const Token = require('./Token')
const CRandom = require('./CRandom')
const defaultTokens = require('./defaultTokens')

const TOKEN_TYPE_SYNTAX = 0
const TOKEN_TYPE_DEFINE = 1
const TOKEN_TYPE_CONST = 2

const TOK_DEFINE = 0
const TOK_UNDEFINE = 1
const TOK_CONST = 2
const TOK_IF = 3
const TOK_ELIF = 4
const TOK_ELSE = 5
const TOK_ENDIF = 6
const TOK_START_RANDOM = 7
const TOK_PERCENT_CHANCE = 8
const TOK_END_RANDOM = 9
const TOK_INCLUDE = 10
const TOK_PLAYER_SETUP = 11
const TOK_LAND_GENERATION = 17
const TOK_CLIFF_GENERATION = 34
const TOK_TERRAIN_GENERATION = 42
const TOK_OBJECTS_GENERATION = 47
const TOK_CONNECTION_GENERATION = 62
const TOK_BLOCK_OPEN = 67
const TOK_BLOCK_CLOSE = 68
const TOK_COMMENT_OPEN = 69
const TOK_COMMENT_CLOSE = 70
const TOK_ELEVATION_GENERATION = 79
const TOK_INCLUDE_DRS = 92

const ARGTYPE_NONE = 0
const ARGTYPE_STRING = 1
const ARGTYPE_INT = 2
const ARGTYPE_TOKEN = 3
const ARGTYPE_TOKEN2 = 4
const ARGTYPE_FILE = 5

const RANDOM_STATE_PRE = 1
const RANDOM_STATE_MATCH = 2
const RANDOM_STATE_POST = 3

const IF_STATE_FAIL = 1
const IF_STATE_MATCH = 2
const IF_STATE_DONE = 3

/**
 * An implementation of the Age of Empires 2 Random Map Script parser,
 * staying true to the original.
 */
class Parser {
  constructor (options = {}) {
    this.options = Object.assign({
      size: 120,
      random: null
    }, options)

    this.random = this.options.random || new CRandom(Date.now())

    this.tokenTypes = []
    defaultTokens.forEach((token) => {
      this.defineToken(...token)
    })

    this.commentDepth = 0
    // TODO also use a randomStack, like ifStack?
    // src does not seem to use it, not sure if randoms can be nested.
    this.randomDepth = 0
    this.randomState = 0
    this.ifStack = []

    this.terrains = []
    this.lands = []
    this.activeLands = []
    this.objects = []
    this.cliffs = {}
  }

  defineToken (name, id, type, argTypes) {
    this.tokenTypes.push(new Token(id, name, type, null, argTypes))
  }
  defineUserToken (name, type, value, argTypes) {
    this.tokenTypes.push(new Token(null, name, type, value, argTypes))
  }

  write (code) {
    this.code = code.toString()
    this.index = 0
    this.line = 0
    this.column = 0
    while (this.readNextToken()) {
      if (this.currentToken) this.parseToken()
    }
  }

  readNextToken () {
    const word = this.readNextWord()
    if (!word) return false
    const token = this.getTokenType(word)
    this.currentToken = null
    if (token) {
      this.currentToken = token
      return this.currentToken
    }
    return true
  }

  getTokenType (word) {
    return this.tokenTypes.find((token) => {
      return token.name === word
    })
  }

  /**
   * Get the current ifState, from the top of the stack.
   *
   * If we're not inside an `if` statement act like we MATCHed one.
   */
  get ifState () {
    return this.ifStack[this.ifStack.length - 1] || IF_STATE_MATCH
  }

  /**
   * Set the current ifState, at the top of the stack.
   */
  set ifState (value) {
    this.ifStack[this.ifStack.length - 1] = value
  }

  parseToken () {
    const token = this.currentToken
    const {
      id,
      argTypes
    } = token

    if (id === TOK_COMMENT_OPEN) { // /*
      this.commentDepth += 1
      return
    } else if (id === TOK_COMMENT_CLOSE) { // */
      this.commentDepth -= 1
      return
    }

    if (this.commentDepth > 0) {
      return
    }

    const args = []
    for (const argType of argTypes) {
      if (argType === ARGTYPE_NONE) break // Stop parsing arguments.
      if (argType === ARGTYPE_STRING) args.push(this.readString())
      if (argType === ARGTYPE_INT) args.push(this.readInt())
      if (argType === ARGTYPE_TOKEN) {
        const value = this.readToken()
        // This one is only added to the arguments list when it exists in src.
        // Not sure why this is different from ARGTYE_TOKEN2, because it seems like
        // src attempts to use it anyway during the generation phase.
        if (typeof value === 'object') args.push(value)
      }
      if (argType === ARGTYPE_TOKEN2) args.push(this.readToken())
      if (argType === ARGTYPE_FILE) throw new Error('Unsupported')
    }
    this.currentArgs = args

    if (this.ifState === IF_STATE_MATCH) {
      switch (id) {
        case TOK_START_RANDOM: // start_random
          this.randomDepth += 1
          this.randomValue = this.random.nextRange(100)
          this.randomState = RANDOM_STATE_PRE
          break
        case TOK_PERCENT_CHANCE: // percent_chance
          if (this.randomState === RANDOM_STATE_PRE) {
            const [ percent ] = args
            if (this.randomValue > percent) {
              this.randomValue -= percent
            } else {
              // Take this branch!
              this.randomState = RANDOM_STATE_MATCH
            }
          } else {
            this.randomState = RANDOM_STATE_POST
          }
          break
        case TOK_END_RANDOM: // end_random
          if (this.randomState === RANDOM_STATE_PRE) {
            console.warn('skipped random branch', this.line)
          }
          this.randomDepth -= 1
          break
      }
    }

    if (this.randomDepth === 0 || this.randomState === RANDOM_STATE_MATCH) {
      switch (id) {
        case TOK_IF: // if
          if (this.ifState === IF_STATE_MATCH) {
            const [ condition ] = args
            this.ifStack.push(condition ? IF_STATE_MATCH : IF_STATE_FAIL)
          }
          break
        case TOK_ELIF: // elseif
          // FIXME this might be wrong if this `if/elseif/endif` sequence is nested
          // within an `if` statement with a failing condition, since it would be checking
          // the outer if?
          // Need to check src
          if (this.ifStack.length > 0 && this.ifState === IF_STATE_FAIL) {
            const [ condition ] = args
            this.ifState = condition ? IF_STATE_MATCH : IF_STATE_FAIL
          }
          break
        case TOK_ELSE: // else
          if (this.ifStack.length > 0) {
            if (this.ifState === IF_STATE_FAIL) {
              this.ifState = IF_STATE_MATCH
            } else {
              this.ifState = IF_STATE_DONE
            }
          }
          break
        case TOK_ENDIF: // endif
          if (this.ifStack.length > 0) {
            this.ifStack.pop()
          }
          break
      }
    }

    if (this.ifState === IF_STATE_MATCH && (this.randomDepth === 0 || this.randomState === RANDOM_STATE_MATCH)) {
      switch (id) {
        case TOK_DEFINE: { // #define
          const [ name ] = args
          this.defineUserToken(name, TOKEN_TYPE_DEFINE, 0,
            [ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE])
          break
        }
        case TOK_CONST: { // #const
          const [ name, value ] = args
          this.defineUserToken(name, TOKEN_TYPE_CONST, value,
            [ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE])
          break
        }
        case TOK_INCLUDE: // #include
          throw new Error('#include is not supported')
        case TOK_INCLUDE_DRS: // #include_drs
          throw new Error('#include_drs is not supported')
        case TOK_PLAYER_SETUP: // <PLAYER_SETUP>
        case TOK_LAND_GENERATION: // <LAND_GENERATION>
        case TOK_CLIFF_GENERATION: // <CLIFF_GENERATION>
        case TOK_TERRAIN_GENERATION: // <TERRAIN_GENERATION>
        case TOK_OBJECTS_GENERATION: // <OBJECTS_GENERATION>
        case TOK_CONNECTION_GENERATION: // <CONNECTION_GENERATION>
        case TOK_ELEVATION_GENERATION: // <ELEVATION_GENERATION>
          this.parseSectionHeader(id)
          break

        case TOK_BLOCK_OPEN: // {
          this.insideBlock = true
          break
        case TOK_BLOCK_CLOSE: // }
          this.insideBlock = false
          break
        default:
          if (id <= 9) break
          switch (this.stage) {
            case TOK_PLAYER_SETUP: this.parsePlayerSetup(token, args); break
            case TOK_LAND_GENERATION: this.parseLandGeneration(token, args); break
            case TOK_CLIFF_GENERATION: this.parseCliffGeneration(token, args); break
            case TOK_TERRAIN_GENERATION: this.parseTerrainGeneration(token, args); break
            case TOK_OBJECTS_GENERATION: this.parseObjectsGeneration(token, args); break
            case TOK_CONNECTION_GENERATION: this.parseConnectionGeneration(token, args); break
            case TOK_ELEVATION_GENERATION: this.parseElevationGeneration(token, args); break
          }
      }
    }
  }

  parsePlayerSetup (token) {
    const { id } = token
    if (id < 12 || id > 16) {
      throw new Error('Unknown token in <PLAYER_SETUP> section')
    }
  }

  parseLandGeneration (token, args) {
    const { id } = token
    if (!this.insideBlock) {
      if (id === 19) { // base_terrain
        this.baseTerrain = args[0].value
        return
      }
      if (id === 20) { // create_player_lands
        const landId = this.lands.push({
          isPlayerLand: true
        })
        this.activeLands.push(landId - 1)
        // TODO
      }
      if (id === 32) { // create_land
        const landId = this.lands.push({
          isPlayerLand: false
        })
        this.activeLands.push(landId - 1)
        // TODO
      }
    }
    this.activeLands.forEach((landId) => {
      const land = this.lands[landId]
      switch (id) {
        case 71: // land_position
          land.position = {
            x: args[0] / 100 * this.options.size,
            y: args[1] / 100 * this.options.size
          }
          break
        case 18: // land_percent
          land.tiles = args[0] / 100 * this.options.size * this.options.size // TODO multiply * that weird thing in the src
          break
        case 74: // number_of_tiles
          land.tiles = args[0]
          break
        case 21: // terrain_type
          land.terrain = args[0].type
          break
        case 23: // left_border
          land.leftBorder = args[0] * this.options.size
          break
        case 24: // right_border
          land.rightBorder = args[0] * this.options.size
          break
        case 25: // top_border
          land.topBorder = args[0] * this.options.size
          break
        case 26: // bottom_border
          land.bottomBorder = args[0] * this.options.size
          break
        case 27: // border_fuzziness
          land.borderFuzziness = args[0]
          break
        case 28: // zone
          land.zone = args[0] + 10 // what's this for?
          break
        case 29: // set_zone_by_team
          // TODO
          break
        case 30: // set_zone_randomly
          // TODO
          break
        case 31: // other_zone_avoidance_distance
          land.avoidance = args[0]
          break
        case 72: // land_id
          land.id = args[0] + 10
          break
        case 22: // base_size
          land.baseSize = args[0]
          break
      }
    })
  }

  parseCliffGeneration (token, args) {
    const { id } = token
    const cliffs = this.cliffs
    switch (id) {
      case 35: // min_number_of_cliffs
        cliffs.minNumber = args[0]
        break
      case 36: // max_number_of_cliffs
        cliffs.maxNumber = args[0]
        break
      case 37: // min_length_of_cliff
        cliffs.minLength = args[0]
        break
      case 38: // max_length_of_cliff
        cliffs.maxLength = args[0]
        break
      case 39: // cliff_curliness
        cliffs.curliness = args[0]
        break
      case 40: // min_distance_cliffs
        cliffs.minDistanceBetweenCliffs = args[0]
        break
      case 41: // min_terrain_distance
        cliffs.minDistanceToTerrain = args[0]
        break
    }
  }
  parseTerrainGeneration (token, args) {
    const { id } = token
    if (!this.insideBlock) {
      if (id === 43) { // create_terrain
        this.terrains.push({
          type: args[0].value,
          tiles: 0,
          numberOfClumps: 1,
          spacingToOtherTerrainTypes: 0,
          baseTerrain: null,
          clumpingFactor: 20,
          avoidPlayerStartAreas: false,
          minHeight: 0,
          maxHeight: 0,
          flatOnly: false
        })
        return
      }
    }
    const terrain = this.terrains[this.terrains.length - 1]
    switch (id) {
      case 19: // base_terrain
        terrain.baseTerrain = args[0].value
        break
      case 18: // land_percent
        terrain.tiles = -args[0]
        break
      case 0x4A: // number_of_tiles
        terrain.tiles = args[0]
        break
      case 0x2D: // number_of_clumps
        terrain.numberOfClumps = args[0]
        break
      case 0x2E: // spacing_to_other_terrain_types
        terrain.spacingToOtherTerrainTypes = args[0]
        break
      case 0x49: // clumping_factor
        terrain.clumpingFactor = args[0]
        break
      case 0x4D:
        terrain.avoidPlayerStartAreas = true
        break
      case 0x4B: // set_scale_by_groups
        break
      case 0x4C: // set_scale_by_size
        break
      case 0x58: // height_limits
        terrain.minHeight = args[0]
        terrain.maxHeight = args[1]
        break
      case 0x59: // set_flat_terrain_only
        terrain.flatOnly = true
        break
    }
  }
  parseObjectsGeneration (token, args) {
    const { id } = token

    if (!this.insideBlock) {
      if (id === 48 /* create_object */) {
        this.objects.push({
          type: args[0] ? args[0].value : 0,
          baseTerrain: -1,
          numberOfGroups: 1,
          groupVariance: 0,
          amount: 1,
          groupPlacementRadius: 3,
          playerId: -1,
          landId: -1,
          minDistanceToPlayers: -1,
          maxDistanceToPlayers: -1,
          maxDistanceToOtherZones: 0
        })
      }
      return
    }
    const object = this.objects[this.objects.length - 1]
    switch (id) {
      case 0x31: // set_scaling_to_map_size
        break
      case 0x57: // set_scaling_to_player_number
        break
      case 0x32: // number_of_groups
        object.numberOfGroups = args[0]
        break
      case 0x33: // number_of_objects
        object.amount = args[0]
        break
      case 0x34: // group_variance
        object.groupVariance = args[0]
        break
      case 0x35: // group_placement_radius
        object.groupPlacementRadius = args[0]
        break
      case 0x36: // set_loose_grouping
        break
      case 0x37: // set_tight_grouping
        break
      case 0x38: // terrain_to_place_on
        object.baseTerrain = args[0].value
        break
      case 0x39: // set_gaia_object_only
        object.playerId = 0
        break
      case 0x3A: // set_place_for_every_player
        break
      case 0x3B: // place_on_specific_land_id
        object.landId = args[0]
        break
      case 0x4E: // min_distance_group_placement
        object.minDistanceGroupPlacement = args[0]
        break
      case 0x5D: // temp_min_distance_group_placement
        break
      case 0x3C: // min_distance_to_players
        object.minDistanceToPlayers = args[0]
        break
      case 0x3D: // max_distance_to_players
        object.maxDistanceToPlayers = args[0]
        break
      case 0x5B: // max_distance_to_other_zones
        object.maxDistanceToOtherZones = args[0]
        break
    }
  }
  parseConnectionGeneration (token, args) {
  
  }
  parseElevationGeneration (token, args) {

  }

  readNextWord () {
    const match = this.code.slice(this.index).match(/^(\S+)(\s+)/)
    if (!match) return null
    const word = match[1]
    this.start = this.index
    this.end = this.start + word.length
    this.index += match[0].length
    const lines = countLines(match[0])
    if (lines > 0) {
      this.line += lines
      this.column = match[0].split(/\n/g)[lines].length
    } else {
      this.column += match[0].length
    }
    return word
  }

  parseSectionHeader (type) {
    this.stage = type
    // src also marks the section as existing here.
    // that's only needed for generation, because it only adds the generator classes
    // for each section if one exists.
    // eg. without an <ELEVATION_GENERATION> section, the elevation generator is not run at all,
    // but with an empty <ELEVATION_GENERATION> section, it's run with the default settings (=flat land).
  }

  readString () {
    const word = this.readNextWord()
    if (word) {
      const token = this.getTokenType(word)
      if (!token || token.value) {
        return word
      }
    }
    return null
  }

  readInt () {
    const word = this.readNextWord()
    if (word) {
      const token = this.getTokenType(word)
      if (!token || token.type !== TOKEN_TYPE_SYNTAX) {
        return parseInt(word, 10)
      }
    }
    return null
  }

  readToken () {
    const word = this.readNextWord()
    if (word) {
      const token = this.getTokenType(word)
      return token
    }
    return null
  }
}

function countLines (str) {
  return (str.match(/\n/g) || []).length
}

module.exports = Parser
