const Stringifier = require('./Stringifier')

class Tokenizer {
  constructor (code) {
    this.code = code
    this.i = 0
    this.chunk = ''
    this.tokens = []
  }

  push (token) {
    this.tokens.push(token)
  }

  keyword (value, rx) {
    const match = rx.exec(this.chunk)
    if (match) {
      this.push({ type: value })
      return match[0].length
    }
  }

  whitespace () {
    const match = /^\s+/.exec(this.chunk)
    if (match) {
      return match[0].length
    }
  }

  comment () {
    const match = /^\/\*/.test(this.chunk)
    if (match) {
      const end = this.chunk.indexOf('*/')
      this.push({ type: 'comment', content: this.chunk.slice(2, end) })
      return end + 2
    }
  }

  const () {
    const match = /^#const\s+([A-Za-z_]\w+)\s+(\d+)/.exec(this.chunk)
    if (match) {
      this.push({ type: 'const', name: match[1], value: match[2] })
      return match[0].length
    }
  }

  define () {
    const match = /^#define\s+([A-Za-z_]\w+)/.exec(this.chunk)
    if (match) {
      this.push({ type: 'define', name: match[1] })
      return match[0].length
    }
  }

  startRandom () {
    return this.keyword('startrandom', /^start_random\s+/)
  }

  percentChance () {
    const match = /^percent_chance\s+(\d+)/.exec(this.chunk)
    if (match) {
      this.push({ type: 'percentchance', percent: parseInt(match[1], 10) })
      return match[0].length
    }
  }

  endRandom () {
    return this.keyword('endrandom', /^end_random\s+/)
  }

  if () {
    const match = /^if\s+(\w+)/.exec(this.chunk)
    if (match) {
      this.push({ type: 'if', condition: match[1] })
      return match[0].length
    }
  }

  elseif () {
    const match = /^elseif\s+(\w+)/.exec(this.chunk)
    if (match) {
      this.push({ type: 'elseif', condition: match[1] })
      return match[0].length
    }
  }

  else () {
    return this.keyword('else', /^else\s+/)
  }

  endif () {
    return this.keyword('endif', /^endif\s+/)
  }

  section () {
    const match = /^<([A-Z_]+)>/.exec(this.chunk)
    if (match) {
      this.push({ type: 'section', section: match[1] })
      return match[0].length
    }
  }

  instruction () {
    const match = /^([a-z_]+)((?:[^\S\n]+\w+)*)[^\S\n]*\n/.exec(this.chunk)
    if (match) {
      this.push({ type: 'instruction', name: match[1], args: match[2].split(/\s+/g) })
      return match[0].length
    }
  }

  startBlock () {
    const match = /^([a-z_]+)((?:[^\S\n]+\w+)*)\s*\{/.exec(this.chunk)
    if (match) {
      this.push({ type: 'block', name: match[1], args: match[2].split(/\s+/g) })
      return match[0].length
    }
  }

  endBlock () {
    const match = /^\}/.exec(this.chunk)
    if (match) {
      this.push({ type: 'endblock' })
      return 1
    }
  }

  tokenize () {
    const l = this.code.length
    while (this.i < l) {
      this.chunk = this.code.slice(this.i)
      const skip =
        this.whitespace() ||
        this.comment() ||
        this.const() ||
        this.define() ||
        this.startRandom() || this.percentChance() || this.endRandom() ||
        this.if() || this.elseif() || this.else() || this.endif() ||
        this.section() ||
        this.startBlock() || this.endBlock() ||
        this.instruction()
    
      if (!skip) {
        const nextWord = /^\S+/.exec(this.chunk)[0]
        const stringifier = new Stringifier()
        this.tokens.forEach((token) => {
          console.log(token.type)
          stringifier[token.type](token)
        })
        require('fs').writeFileSync('/tmp/test.rms', stringifier + '')
        throw new Error(`Unexpected token ${nextWord}`)
      }

      this.i += skip
    }
  }
}

module.exports = Tokenizer
