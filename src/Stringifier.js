const repeat = (str, n) => {
  let repeated = ''
  for (let i = 0; i < n; i++) repeated += '  '
  return repeated
}

class Stringifier {
  constructor () {
    this.string = ''
    this.level = 0
  }

  toString () {
    return this.string
  }

  indent () {
    this.level++
    this.newline()
    return this
  }

  dedent () {
    this.level--
    this.string = this.string.slice(0, this.string.length - 2)
    return this
  }

  write (value) {
    this.string += value
    return this
  }

  newline () {
    console.log('indent', this.level, repeat('  ', this.level).length)
    this.write('\n' + repeat('  ', this.level))
    return this
  }

  comment ({ content }) {
    this.write(`/*${content}*/`).newline()
  }

  const ({ name, value }) {
    this.write(`#const ${name} ${value}`).newline()
  }

  define ({ name }) {
    this.write(`#define ${name}`).newline()
  }

  if ({ condition }) {
    this.write(`if ${condition}`).indent()
  }

  elseif ({ condition }) {
    this.dedent().write(`elseif ${condition}`).indent()
  }

  else () {
    this.dedent().write(`else`).indent()
  }

  endif () {
    this.dedent().write(`endif`).newline()
  }

  startrandom () {
    this.write(`start_random`).indent()
  }

  percentchance ({ percent }) {
    this.dedent().write(`percent_chance ${percent}`).indent()
  }

  endrandom () {
    this.dedent().write(`end_random`).newline()
  }

  section ({ section }) {
    this.write(`<${section}>`).newline()
  }

  instruction ({ name, args }) {
    this.write(`${name} ${args.join(' ')}`).newline()
  }

  block ({ name, args }) {
    if (args.length > 0) {
      this.write(`${name} ${args.join(' ')}`)
    } else {
      this.write(`${name}`)
    }
    this.newline().write('{').indent()
  }

  endblock () {
    this.dedent().write('}').newline()
  }
}

module.exports = Stringifier