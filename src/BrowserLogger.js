module.exports = class Logger {
  constructor (name) {
    this.name = name
  }

  green (str) { return str }
  blue (str) { return str }
  cyan (str) { return str }
  grey (str) { return str }
  red (str) { return str }

  log (...args) {
    console.log(`%cgenie-rms %c${this.name}`, 'color: #4c4', 'color: #77e', ...args)
  }
  warn (...args) {
    console.warn(`%cgenie-rms %c${this.name}`, 'color: #4c4', 'color: #77e', ...args)
  }
  error (...args) {
    console.error(`%cgenie-rms %c${this.name}`, 'color: #4c4', 'color: #77e', ...args)
  }
  time (label) {
    console.time(`[genie-rms] ${label}`)
  }
  timeEnd (label) {
    console.timeEnd(`[genie-rms] ${label}`)
  }
}
