class Token {
  constructor (id, name, type, value, argTypes) {
    this.isConst = value != null
    this.isDefine = id != null
    this.id = this.isDefine ? id : value
    this.name = name
    this.type = type
    this.argTypes = argTypes
  }
}

module.exports = Token
