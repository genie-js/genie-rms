const chalk = require('chalk')

module.exports = class Logger {
  constructor (name) {
    this.name = name
  }
  log (...args) {
    console.log(chalk.green('genie-rms'), chalk.blue(this.name), ...args)
  }
  warn (...args) {
    console.warn(chalk.green('genie-rms'), chalk.blue(this.name), ...args)
  }
  error (...args) {
    console.error(chalk.green('genie-rms'), chalk.blue(this.name), ...args)
  }
  time (label) {
    console.time(`[genie-rms] ${label}`)
  }
  timeEnd (label) {
    console.timeEnd(`[genie-rms] ${label}`)
  }
}
