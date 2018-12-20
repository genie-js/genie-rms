const s = require('./strictObject')
const Logger = require('./Logger.js')
const Token = require('./Token.js')
const CRandom = require('./CRandom.js')
const defaultTokens = require('./defaultTokens.js')
const hardcodedDrsIncludes = require('./hardcodedDrsIncludes.js')

const TOKEN_TYPE_SYNTAX = 0
const TOKEN_TYPE_DEFINE = 1
const TOKEN_TYPE_CONST = 2

const TOK_DEFINE = 0
const TOK_UNDEFINE = 1 // eslint-disable-line no-unused-vars
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

const RANDOM_STATE_DEAD = -1
const RANDOM_STATE_PRE = 1
const RANDOM_STATE_MATCH = 2
const RANDOM_STATE_POST = 3

const IF_STATE_DEAD = -1
const IF_STATE_FAIL = 1
const IF_STATE_MATCH = 2
const IF_STATE_DONE = 3

const DIPLO_NEUTRAL = 0
const DIPLO_ALLY = 1
const DIPLO_ENEMY = 2

const { floor, abs } = Math

/**
 * An implementation of the Age of Empires 2 Random Map Script parser,
 * staying true to the original.
 */
class Parser {
  constructor (options = {}) {
    this.options = Object.assign({
      numPlayers: null,
      size: 120,
      random: null,
      onWarn: (warning) => {}
    }, options)

    this.players = this.options.players
    if (!this.players) {
      if (this.options.numPlayers == null) {
        this.options.numPlayers = 2
      }

      this.players = []
      while (this.players.length < this.options.numPlayers) {
        this.players.push({
          id: this.players.length,
          x: null,
          y: null,
          diplomacy: Array(this.options.numPlayers).fill(DIPLO_ENEMY)
        })
      }
    }

    this.logger = new Logger('parser')

    this.random = this.options.random || new CRandom(Date.now())

    this.tokenTypes = []
    // TODO add DLC, UserPatch tokens depending on compatibility option
    const activeTokens = [...defaultTokens.base]
    for (const token of activeTokens) {
      this.defineToken(...token)
    }

    this.commentDepth = 0
    this.randomStack = []
    this.ifStack = []
    this.parseState = []

    this.stages = []

    this.terrains = []
    this.lands = []
    this.landMeta = {}
    this.activeLands = []
    this.objects = []
    this.connections = []
    this.elevations = []
    this.cliffs = {}

    this.terrainHotspots = []
    this.objectHotspots = []
    this.elevationHotspots = []
    this.cliffHotspots = []
  }

  log (...args) {
    this.logger.log(
      this.logger.grey(`(${this.line}:${this.column})`),
      ...args
    )
  }

  warn (str) {
    const warning = new Error(str)
    warning.index = this.index
    warning.line = this.line
    warning.column = this.column
    this.options.onWarn(warning)
  }

  error (str) {
    const err = new Error(`(${this.line}:${this.column}) ${str}`)
    err.index = this.index
    err.line = this.line
    err.column = this.column
    return err
  }

  /**
   * Define a builtin token, both constants and control flow (if, #include).
   * @param {string} name The name of the token.
   * @param {number} id The builtin token ID. Used by the parser to determine behaviour.
   * @param {number} type The token type (constant, control flow, command, etc)
   * @param {Array.<number>} argTypes The argument types for this token.
   */
  defineToken (name, id, type, argTypes) {
    this.tokenTypes.push(new Token(id, name, type, null, argTypes))
  }

  /**
   * Define a user token, ie. a constant.
   * @param {string} name The name of the constant.
   * @param {number} type The constant type (existence or number).
   * @param {number} value The integer value of the constant.
   * @param {Array.<number>} argTypes The argument types for this token (none).
   */
  defineUserToken (name, type, value, argTypes) {
    this.tokenTypes.push(new Token(null, name, type, value, argTypes))
  }

  /**
   * Parse some code.
   * @param {string|Buffer} code
   */
  write (code) {
    this.code = code.toString()
    this.index = 0
    this.line = 0
    this.column = 0
    this._runParseLoop()
  }

  /**
   * Finish parsing, applying the final postprocessing steps.
   */
  end () {
    this._placePlayersRandomly()

    for (const land of this.lands) {
      if (land.position.x > -1 && land.position.y > -1) {
        continue
      }

      const availX = land.rightBorder - land.leftBorder - 2 * land.baseSize
      const availY = land.bottomBorder - land.topBorder - 2 * land.baseSize
      this.logger.log('availX', land.rightBorder, land.leftBorder, land.baseSize)
      this.logger.log('availY', land.bottomBorder, land.topBorder, land.baseSize)
      let rndAttemptsRemaining = 990
      while (rndAttemptsRemaining > 0) {
        let x = this.random.nextRange(availX)
        let y = this.random.nextRange(availY)

        if ((x >= availX * 1 / 3 && x <= availX * 2 / 3) ||
            (y >= availY * 1 / 3 && y <= availY * 2 / 3)) {
          x += land.baseSize + land.leftBorder
          y += land.baseSize + land.topBorder

          let canPlace = true
          for (const other of this.lands) {
            if (other !== land && other.position.x > -1 && other.position.y > -1) {
              const dx = abs(x - other.position.x)
              const dy = abs(y - other.position.y)
              let minDistance = land.minPlacementDistance
              if (minDistance < 0) {
                minDistance = Math.max(other.area, land.area) +
                  land.baseSize + other.baseSize
              }

              if (dx < minDistance && dy < minDistance) {
                canPlace = false
                break
              }
            }
          }
          if (canPlace) {
            land.position = { x, y }
            break
          } else {
            rndAttemptsRemaining -= 1
          }
        }
      }
      if (rndAttemptsRemaining <= 0) {
        land.position = {
          x: floor(this.options.size / 2),
          y: floor(this.options.size / 2)
        }
      }
    }

    for (const [i, land] of Object.entries(this.lands)) {
      this.objectHotspots[i].x = land.position.x
      this.objectHotspots[i].y = land.position.y
      this.cliffHotspots.push({
        x: land.position.x,
        y: land.position.y,
        radius: 15
      })
    }

    if (this.lands.length <= 0) {
      for (const player of this.players) {
        this.objectHotspots.push({
          x: player.x,
          y: player.y,
          id: 1,
          playerId: player.id + 1
        })
        this.terrainHotspots.push({
          x: player.x,
          y: player.y,
          radius: 13,
          fade: 20
        })
        this.cliffHotspots.push({
          x: player.x,
          y: player.y,
          radius: 15
        })
        this.elevationHotspots.push({
          x: player.x,
          y: player.y,
          radius: 13,
          fade: 20
        })
      }
    }

    for (const terrain of this.terrains) {
      if (terrain.scalingType === 1) { // scale_by_size
        if (terrain.tiles > 0) {
          terrain.tiles *= (this.options.size ** 2) / 10000
        }
      } else if (terrain.scalingType === 2) { // scale_by_groups
        terrain.numberOfClumps *= (this.options.size ** 2) / 10000
      } else if (terrain.tiles > 0) {
        terrain.tiles *= (this.options.size ** 2) / 10000
      }

      if (terrain.tiles < 0) {
        terrain.tiles = -(terrain.tiles / 100) * (this.options.size ** 2)
      }
      terrain.tiles = floor(terrain.tiles)
      terrain.numberOfClumps = floor(terrain.numberOfClumps)
    }

    for (const elev of this.elevations) {
      if (elev.scalingType === 1) {
        elev.numberOfTiles *= this.options.size ** 2 / 100
      } else if (elev.scalingType === 2) {
        elev.numberOfTiles *= this.options.size ** 2 / 10000
      }
      elev.numberOfTiles = floor(elev.numberOfTiles)
    }

    for (const objectHs of this.objectHotspots) {
      if (objectHs.playerId > 0) {
        this.terrainHotspots.push({
          x: objectHs.x,
          y: objectHs.y,
          radius: 13,
          fade: 20
        })
        this.elevationHotspots.push({
          x: objectHs.x,
          y: objectHs.y,
          radius: 13,
          fade: 20
        })
      }
    }

    // TODO: resolve connections here

    return {
      sections: this.stages,

      terrains: this.terrains,
      lands: this.lands,
      activeLands: this.activeLands,
      objects: this.objects,
      connections: this.connections,
      elevations: this.elevations,
      cliffs: this.cliffs,

      landMeta: this.landMeta,
      terrainHotspots: this.terrainHotspots,
      objectHotspots: this.objectHotspots,
      elevationHotspots: this.elevationHotspots,
      cliffHotspots: this.cliffHotspots
    }
  }

  _getStance (playerA, playerB) {
    return playerA.diplomacy[playerB.id]
  }

  // 005386A0
  _placePlayersRandomly () {
    for (const player of this.players) {
      player.x = this.random.nextRange(this.options.size)
      player.y = this.random.nextRange(this.options.size)
    }

    // No Team Together support yet

    let numPlayerLands = 0 // Separate from number of players for multi TC starts

    let minX = 0
    let minY = 0
    let maxX = this.options.size
    let maxY = this.options.size
    for (const [id, land] of Object.entries(this.lands)) {
      const objectHs = this.objectHotspots[id]
      if (objectHs.playerId <= 0) continue
      numPlayerLands++

      maxX = Math.min(land.rightBorder - land.leftBorder - 2 * land.baseSize, maxX)
      maxY = Math.min(land.bottomBorder - land.topBorder - 2 * land.baseSize, maxY)
      minX = Math.max(land.leftBorder + land.baseSize, minX)
      minY = Math.max(land.topBorder + land.baseSize, minY)
    }

    if (numPlayerLands < 1) {
      numPlayerLands = 1
    }

    const v10 = 6 * maxX / 10
    const v11 = 6 * maxY / 10
    const v12 = 2 * maxX / 10
    const v47 = v11 + v10
    // The amount of space on the shape that a single player land takes.
    const landSizeNumber = 2 * (v11 + v10) / numPlayerLands
    const v54 = 6 * maxX / 10
    const v53 = v10 + v11 + v10

    const playerList = []
    while (playerList.length < 8) {
      const playerId = Math.min(8, this.random.nextRange(8) + 1)
      if (playerList.includes(playerId)) continue

      playerList.push(playerId)
    }

    const visitedLandsList = Array(this.lands.length).fill(false)
    // Player lands are laid out on a squarish circlish
    // shape on the map. This array contains a single
    // number for each land determining where on the
    // shape it is placed.
    const landPlacement = Array(this.lands.length).fill(0)

    let placeNumber = this.random.nextRange(2 * v47)
    for (let i = 0; i < 8; i++) {
      for (let id = 0; id < this.lands.length; id++) {
        if (visitedLandsList[id]) continue
        if (!this.objectHotspots[id] || this.objectHotspots[id].playerId === 0) continue
        if (this.objectHotspots[id].playerId === playerList[i]) {
          landPlacement[id] = placeNumber
          placeNumber += landSizeNumber
          if (placeNumber >= 2 * v47) {
            placeNumber -= 2 * v47
          }
          visitedLandsList[id] = true
        }
      }
    }

    this.lands.forEach((land, id) => {
      const objectHs = this.objectHotspots[id]
      if (objectHs.playerId === 0) return
      if (landPlacement[id] < v54) {
        land.position = {
          x: floor(minX + v12 + landPlacement[id]),
          y: floor(minY + v12 / 2)
        }
      } else if (landPlacement[id] < v47) {
        land.position = {
          x: floor(minX + v54 + v12 / 2),
          y: floor(minY + v12 + landPlacement[id] - v54)
        }
      } else if (landPlacement[id] < v53) {
        land.position = {
          x: floor(minX + v54 + v12 + landSizeNumber - landPlacement[id]),
          y: floor(minY + v11 + v12 / 2)
        }
      } else {
        land.position = {
          x: floor(minX + v12 / 2),
          y: floor(minY + v11 + v12 + v53 - landPlacement[id])
        }
      }
    })
  }

  /**
   * Parse all available tokens.
   */
  _runParseLoop () {
    try {
      while (this.readNextToken()) {
        if (this.currentToken) this.parseToken()
      }
    } catch (err) {
      err.message = `(${this.line}:${this.column}) ${err.message}`
      throw err
    }
  }

  _pushState () {
    this.parseState.push({
      code: this.code,
      index: this.index,
      line: this.line,
      column: this.column
    })
  }

  _popState () {
    Object.assign(this, this.parseState.pop())
  }

  includeCode (code) {
    this._pushState()
    this.write(code)
    this._popState()
    this._runParseLoop()
  }

  include (file) {
    this._pushState()
    if (!this.options.include) {
      throw this.error('#include is not supported')
    }
    this.options.include(file, (err, code) => {
      if (err) throw err
      this.write(code)
      this._popState()
      this._runParseLoop()
    })
  }

  readNextToken () {
    const word = this.readNextWord()
    if (!word) return false
    const token = this.getTokenType(word)
    this.currentToken = null
    if (token) {
      this.currentToken = token
      return this.currentToken
    } else if (this.commentDepth === 0) {
      this.warn(`${word}, unrecognized command ignored.`)
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

  /**
   * Get the current randomState, from the top of the stack.
   */
  get randomState () {
    const last = this.randomStack[this.randomStack.length - 1]
    if (last) return last.state
    throw this.error('Attempted to get `randomState`, but stack is empty')
  }

  /**
   * Set the current randomState, at the top of the stack.
   */
  set randomState (value) {
    const last = this.randomStack[this.randomStack.length - 1]
    if (!last) throw this.error('Attempted to set `randomState`, but stack is empty')
    last.state = value
  }
  /**
   * Get the current randomValue, from the top of the stack.
   */
  get randomValue () {
    const last = this.randomStack[this.randomStack.length - 1]
    if (last) return last.value
    throw this.error('Attempted to get `randomValue`, but stack is empty')
  }

  /**
   * Set the current randomValue, at the top of the stack.
   */
  set randomValue (value) {
    const last = this.randomStack[this.randomStack.length - 1]
    if (!last) throw this.error('Attempted to set `randomValue`, but stack is empty')
    last.value = value
  }

  _parseComment (token) {
    if (token.id === TOK_COMMENT_OPEN) { // /*
      this.commentDepth += 1
      return true
    }
    if (token.id === TOK_COMMENT_CLOSE) { // */
      this.commentDepth -= 1
      return true
    }

    if (this.commentDepth > 0) {
      return true
    }
  }

  _parseArgs (argTypes) {
    const args = []
    for (const argType of argTypes) {
      if (argType === ARGTYPE_NONE) break // Stop parsing arguments.
      if (argType === ARGTYPE_STRING) args.push(this.readString())
      if (argType === ARGTYPE_INT) args.push(this.readInt())
      if (argType === ARGTYPE_TOKEN) {
        const value = this.readToken()
        // This one is only added to the arguments list when it exists in src.
        // Not sure why this is different from ARGTYPE_TOKEN2, because it seems like
        // src attempts to use it anyway during the generation phase.
        args.push(value || new Token(0, 0, 0, 0, []))
      }
      if (argType === ARGTYPE_TOKEN2) args.push(this.readToken())
      if (argType === ARGTYPE_FILE) args.push(this.readString())
    }
    return args
  }

  _parseRandom (token) {
    switch (token.id) {
      case TOK_START_RANDOM: // start_random
        if (this.randomStack.length > 0 && this.randomState !== RANDOM_STATE_MATCH) {
          this.randomStack.push({
            value: 0,
            state: RANDOM_STATE_DEAD
          })
          break
        }
        this.randomStack.push({
          value: this.random.nextRange(100),
          state: RANDOM_STATE_PRE
        })
        break
      case TOK_PERCENT_CHANCE: // percent_chance
        if (this.randomState === RANDOM_STATE_PRE) {
          const [ percent ] = this.currentArgs
          if (this.randomValue > percent) {
            this.randomValue -= percent
          } else {
            this.log(`Entering percent_chance: ${percent}%`)
            // Take this branch!
            this.randomState = RANDOM_STATE_MATCH
          }
        } else if (this.randomState !== RANDOM_STATE_DEAD) {
          this.randomState = RANDOM_STATE_POST
        }
        break
      case TOK_END_RANDOM: // end_random
        if (this.randomState === RANDOM_STATE_PRE) {
          this.warn('Non-exhaustive random branch')
        }
        this.randomStack.pop()
        break
    }
  }

  _parseIf (token) {
    switch (token.id) {
      case TOK_IF: { // if
        // We can only take this branch if we are already matching,
        // but need to keep track of if block depth in order to
        // balance nested ifs correctly.
        if (this.ifState !== IF_STATE_MATCH) {
          this.ifStack.push(IF_STATE_DEAD)
          break
        }

        const [ condition ] = this.currentArgs
        this.ifStack.push(condition ? IF_STATE_MATCH : IF_STATE_FAIL)
        if (condition) this.log('Entering if condition', this.ifState)
        else this.log('Skipping if condition', this.ifState)
        break
      }
      case TOK_ELIF: // elseif
        // FIXME this might be wrong if this `if/elseif/endif` sequence is nested
        // within an `if` statement with a failing condition, since it would be checking
        // the outer if?
        // Need to check src
        if (this.ifStack.length > 0) {
          const [ condition ] = this.currentArgs
          if (this.ifState === IF_STATE_FAIL) {
            this.ifState = condition ? IF_STATE_MATCH : IF_STATE_FAIL
          } else if (this.ifState === IF_STATE_MATCH) {
            this.ifState = IF_STATE_DONE
          }
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

  _parseCommand (token) {
    switch (token.id) {
      case TOK_DEFINE: { // #define
        const [ name ] = this.currentArgs
        this.log('Defining constant', this.logger.cyan(name))
        this.defineUserToken(name, TOKEN_TYPE_DEFINE, 0,
          [ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE])
        break
      }
      case TOK_CONST: { // #const
        const [ name, value ] = this.currentArgs
        this.log('Defining constant', this.logger.cyan(name), value)
        this.defineUserToken(name, TOKEN_TYPE_CONST, value,
          [ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE, ARGTYPE_NONE])
        break
      }
      case TOK_INCLUDE: // #include
        throw this.error('#include is not supported')
      case TOK_INCLUDE_DRS: { // #include_drs
        const [ , id ] = this.currentArgs
        if (id in hardcodedDrsIncludes) {
          this.includeCode(hardcodedDrsIncludes[id])
        } else {
          throw this.error('#include_drs is not supported')
        }
        break
      }
      case TOK_PLAYER_SETUP: // <PLAYER_SETUP>
      case TOK_LAND_GENERATION: // <LAND_GENERATION>
      case TOK_CLIFF_GENERATION: // <CLIFF_GENERATION>
      case TOK_TERRAIN_GENERATION: // <TERRAIN_GENERATION>
      case TOK_OBJECTS_GENERATION: // <OBJECTS_GENERATION>
      case TOK_CONNECTION_GENERATION: // <CONNECTION_GENERATION>
      case TOK_ELEVATION_GENERATION: // <ELEVATION_GENERATION>
        this.parseSectionHeader(token.id)
        break

      case TOK_BLOCK_OPEN: // {
        this.insideBlock = true
        break
      case TOK_BLOCK_CLOSE: // }
        this.insideBlock = false
        break
      default:
        if (token.id <= 9) break
        switch (this.stage) {
          case TOK_PLAYER_SETUP: this.parsePlayerSetup(token, this.currentArgs); break
          case TOK_LAND_GENERATION: this.parseLandGeneration(token, this.currentArgs); break
          case TOK_CLIFF_GENERATION: this.parseCliffGeneration(token, this.currentArgs); break
          case TOK_TERRAIN_GENERATION: this.parseTerrainGeneration(token, this.currentArgs); break
          case TOK_OBJECTS_GENERATION: this.parseObjectsGeneration(token, this.currentArgs); break
          case TOK_CONNECTION_GENERATION: this.parseConnectionGeneration(token, this.currentArgs); break
          case TOK_ELEVATION_GENERATION: this.parseElevationGeneration(token, this.currentArgs); break
        }
    }
  }

  parseToken () {
    const token = this.currentToken

    if (this._parseComment(token)) {
      return
    }

    this.currentArgs = this._parseArgs(token.argTypes)

    if (this.ifState === IF_STATE_MATCH) {
      this._parseRandom(token)
    }

    if (this.randomStack.length === 0 || this.randomState === RANDOM_STATE_MATCH) {
      this._parseIf(token)
    }

    if (this.ifState === IF_STATE_MATCH && (this.randomStack.length === 0 || this.randomState === RANDOM_STATE_MATCH)) {
      this._parseCommand(token)
    }
  }

  parsePlayerSetup (token) {
    const { id, name } = token
    if (id < 12 || id > 16) {
      throw this.error(`Unknown token in <PLAYER_SETUP> section: ${name}`)
    }
  }

  parseLandGeneration (token, args) {
    const { id } = token
    if (!this.insideBlock) {
      if (id === 19) { // base_terrain
        this.landMeta.baseTerrain = args[0].value
        return
      }

      if (id === 20) { // create_player_lands
        this.activeLands = []
        for (let i = 1; i <= this.options.numPlayers; i += 1) {
          const landId = this.createLand(i)
          this.activeLands.push(landId)
        }
        this.isPlayerLand = true
        return
      }
      if (id === 32) { // create_land
        const landId = this.createLand(0)
        this.activeLands.push(landId)
        this.isPlayerLand = false
        return
      }
    }

    for (const landId of this.activeLands) {
      const land = this.lands[landId]
      switch (id) {
        case 71: // land_position
          if (this.isPlayerLand) break
          land.position = {
            x: floor(args[0] / 100 * this.options.size),
            y: floor(args[1] / 100 * this.options.size)
          }
          break
        case 18: // land_percent
          land.tiles = floor((args[0] / (100 * this.activeLands.length)) * this.options.size ** 2)
          break
        case 74: // number_of_tiles
          land.tiles = args[0]
          break
        case 21: // terrain_type
          land.terrain = args[0].value
          break
        case 23: // left_border
          land.leftBorder = floor(args[0] * this.options.size / 100)
          break
        case 24: // right_border
          land.rightBorder = floor(this.options.size - args[0] * this.options.size / 100)
          break
        case 25: // top_border
          land.topBorder = floor(args[0] * this.options.size / 100)
          break
        case 26: // bottom_border
          land.bottomBorder = floor(this.options.size - args[0] * this.options.size / 100)
          break
        case 27: // border_fuzziness
          land.borderFuzziness = args[0]
          break
        case 28: // zone
          // +10 distinguishes this from player zones
          land.zone = args[0] + 10
          break
        case 29: // set_zone_by_team
          // TODO implement this correctly
          land.zone = landId - this.activeLands[0] + 1
          break
        case 30: // set_zone_randomly
          land.zone = this.random.nextRange(this.options.numPlayers - 1) + 2
          break
        case 31: // other_zone_avoidance_distance
          land.area = args[0]
          break
        case 72: // land_id
          land.id = args[0] + 10
          break
        case 22: // base_size
          land.baseSize = args[0]
          break
        case 73: // clumping_factor
          land.clumpiness = args[0]
          break
        case 86: // min_placement_distance
          land.minPlacementDistance = args[0]
          break
        case 33: // assign_to_player
          if (!this.isPlayerLand) {
            if (args[0] < 0 || args[0] > 9) break
            if (args[0] >= this.options.numPlayers) {
              this.logger.log(`Player ${args[0]} does not exist, removing land`)
              this.lands.pop()
              this.objectHotspots.pop()
            }
            const objectHs = this.objectHotspots[landId]
            objectHs.playerId = args[0]
            if (!objectHs.id) objectHs.id = 1
          }
          break
      }
    }
  }

  createLand (zone) {
    this.lands.push(s({
      tiles: this.options.size ** 2,
      position: { x: -1, y: -1 },
      terrain: 0,
      baseSize: 3,
      area: 0,
      zone: zone,
      clumpiness: 8,
      leftBorder: 0,
      topBorder: 0,
      rightBorder: this.options.size,
      bottomBorder: this.options.size,
      borderFuzziness: 20,
      minPlacementDistance: -1
    }))
    this.objectHotspots.push(s({
      x: -1,
      y: -1,
      // hotspot data
      id: zone > 0 ? 1 : 0,
      playerId: zone
    }))

    return this.lands.length - 1
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
      default:
        this.warn('Command is not valid in this frame of reference.')
    }
  }

  parseTerrainGeneration (token, args) {
    const { id } = token
    if (!this.insideBlock) {
      if (id === 43) { // create_terrain
        this.terrains.push(s({
          tiles: this.options.size, // NOT squared, just the horizontal amount of tiles
          type: args[0].value,
          numberOfClumps: 1,
          spacingToOtherTerrainTypes: 0,
          baseTerrain: 0,
          clumpiness: 20,
          avoidPlayerStartAreas: false,
          minHeight: 0,
          maxHeight: 0,
          flatOnly: false,
          scalingType: 0
        }))
        return
      }
    }

    if (!this.terrains.length) {
      this.warn('Must use a create command before braces.')
      return
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
        terrain.clumpiness = args[0]
        break
      case 0x4D:
        terrain.avoidPlayerStartAreas = true
        break
      case 0x4B: // set_scale_by_groups
        terrain.scalingType = 1
        break
      case 0x4C: // set_scale_by_size
        terrain.scalingType = 2
        break
      case 0x58: // height_limits
        terrain.minHeight = args[0]
        terrain.maxHeight = args[1]
        break
      case 0x59: // set_flat_terrain_only
        terrain.flatOnly = true
        break
      default:
        this.warn('Command is not valid in this frame of reference.')
    }
  }

  parseObjectsGeneration (token, args) {
    const { id } = token

    if (!this.insideBlock) {
      if (id === 48 /* create_object */) {
        this.objects.push(s({
          type: args[0] ? args[0].value : 0,
          baseTerrain: -1,
          groupingType: 0,
          scalingType: 0,
          amount: 1,
          groupVariance: 0,
          numberOfGroups: 1,
          groupPlacementRadius: 3,
          playerId: -1,
          landId: -1,
          minDistanceToPlayers: -1,
          maxDistanceToPlayers: -1,
          minDistanceGroupPlacement: 0,
          maxDistanceToOtherZones: 0
        }))
      }
      return
    }

    if (this.objects.length === 0) {
      this.warn('Must use a create command before braces.')
      return
    }

    const object = this.objects[this.objects.length - 1]
    switch (id) {
      case 0x31: // set_scaling_to_map_size
        object.scalingType = 1
        break
      case 0x57: // set_scaling_to_player_number
        object.scalingType = 2
        break
      case 0x32: // number_of_groups
        if (object.groupingType === 0) {
          object.amount = object.numberOfGroups
          object.groupingType = 1
        }
        object.numberOfGroups = args[0]
        break
      case 0x33: // number_of_objects
        if (object.groupingType !== 0) {
          object.amount = args[0]
        } else {
          object.numberOfGroups = args[0]
        }
        break
      case 0x34: // group_variance
        object.groupVariance = args[0]
        break
      case 0x35: // group_placement_radius
        object.groupPlacementRadius = args[0]
        break
      case 0x36: // set_loose_grouping
        if (object.groupingType === 0) {
          object.amount = object.numberOfGroups
          object.numberOfGroups = 1
        }
        object.groupingType = 1
        break
      case 0x37: // set_tight_grouping
        if (object.groupingType === 0) {
          object.amount = object.numberOfGroups
          object.numberOfGroups = 1
        }
        object.groupingType = 2
        break
      case 0x38: // terrain_to_place_on
        object.baseTerrain = args[0].value
        break
      case 0x39: // set_gaia_object_only
        object.playerId = 0
        break
      case 0x3A: // set_place_for_every_player
        object.landId = 1
        break
      case 0x3B: // place_on_specific_land_id
        object.landId = args[0] + 10
        break
      case 0x4E: // min_distance_group_placement
        object.minDistanceGroupPlacement = args[0]
        break
      case 0x5D: // temp_min_distance_group_placement
        break
      case 0x3C: // min_distance_to_players
        if (object.landId === -1) object.landId = -2
        object.minDistanceToPlayers = args[0]
        break
      case 0x3D: // max_distance_to_players
        if (object.landId === -1) object.landId = -2
        object.maxDistanceToPlayers = args[0]
        break
      case 0x5B: // max_distance_to_other_zones
        object.maxDistanceToOtherZones = args[0]
        break
      default:
        this.warn('Command is not valid in this frame of reference.')
    }
  }

  parseConnectionGeneration (token, args) {
    const { id } = token

    if (!this.insideBlock) {
      if (id < 63 || id > 66) {
        this.warn('Command is not valid in this frame of reference.')
        return
      }
      const terrains = []
      for (let i = 0; i < 99; i += 1) {
        terrains.push(s({
          terrainCost: 1,
          terrainSize: 1,
          terrainVariation: 0,
          replaceTerrain: -1
        }))
      }
      this.connections.push(s({
        terrains,
        type: id
      }))
      return
    }

    if (this.connections.length === 0) {
      this.warn('Must use a create command before braces.')
      return
    }

    const connection = this.connections[this.connections.length - 1]

    switch (id) {
      case 0x52: // default_terrain_placement
        for (const terrain of connection.terrains) {
          terrain.replaceTerrain = args[0].value
        }
        break
      case 0x53: // replace_terrain
        connection.terrains[args[0].value].replaceTerrain = args[1]
        break
      case 0x54: // terrain_cost
        connection.terrains[args[0].value].terrainCost = args[1]
        break
      case 0x55: // terrain_size
        connection.terrains[args[0].value].terrainSize = args[1]
        connection.terrains[args[0].value].terrainVariation = args[2]
        break
    }
  }

  parseElevationGeneration (token, args) {
    const { id } = token
    if (!this.insideBlock) {
      if (id === 80) { // create_elevation
        const [ height ] = args
        this.activeElevations = []
        for (let h = 0; h < height; h += 1) {
          const elevation = s({
            numberOfTiles: this.options.size,
            height: Math.min(h, 7),
            numberOfClumps: 1,
            // Base level has spacing:2 by default.
            spacing: h === 0 ? 2 : 1,
            baseTerrain: 0,
            baseElevation: h,
            scalingType: 0
          })
          this.elevations.push(elevation)
          this.activeElevations.push(elevation)
        }
      }
      return
    }

    if (this.elevations.length === 0) {
      this.warn('Must use a create command before braces.')
      return
    }

    for (const elevation of this.activeElevations) {
      switch (id) {
        case 0x53: // spacing
          elevation.spacing = args[0]
          break
        case 0x13: // base_terrain
          elevation.baseTerrain = args[0].value
          break
        case 0x2D: // number_of_clumps
          elevation.numberOfClumps = args[0]
          break
        case 0x4A: // number_of_tiles
          elevation.numberOfTiles = args[0]
          break
        case 0x4B: // set_scale_by_groups
          elevation.scalingType = 1
          break
        case 0x4C: // set_scale_by_size
          elevation.scalingType = 2
          break
        case 0x4D: // set_avoid_player_start_areas
          // This is the default behaviour.
          break
      }
    }
  }

  readNextWord () {
    const match = this.code.slice(this.index).match(/^(\S+)(\s+)/)
    if (!match) return null
    const word = match[1]
    this.startIndex = this.index
    this.endIndex = this.startIndex + word.length
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
    this.stages.push({
      [TOK_PLAYER_SETUP]: 'players',
      [TOK_LAND_GENERATION]: 'land',
      [TOK_CLIFF_GENERATION]: 'cliffs',
      [TOK_TERRAIN_GENERATION]: 'terrain',
      [TOK_OBJECTS_GENERATION]: 'objects',
      [TOK_CONNECTION_GENERATION]: 'connections',
      [TOK_ELEVATION_GENERATION]: 'elevation'
    }[type])
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
