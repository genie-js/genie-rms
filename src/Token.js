class Token {
  constructor (id, name, type, value, argTypes) {
    this.id = id
    this.name = name
    this.type = type
    this.value = value
    this.argTypes = argTypes
  }
}

module.exports = Token
