const Tokenizer = require('./Tokenizer')

class RMS {
  constructor (filename) {
    this.code = ''
    this.tokenizer = new Tokenizer(
      require('fs').readFileSync(filename, 'utf8')
    )

    this.tokenizer.tokenize()
  }
}

module.exports = (arg) => new RMS(arg)