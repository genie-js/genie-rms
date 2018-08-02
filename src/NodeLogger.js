const log = require('debug')('genie-rms')
const warn = require('debug')('genie-rms')
const error = require('debug')('genie-rms')
const chalk = require('chalk')

log.log = console.log
warn.log = console.warn
error.log = console.error

module.exports = class Logger {
  constructor (name) {
    this.name = name
  }

  green (str) { return chalk.green(str) }
  blue (str) { return chalk.blue(str) }
  cyan (str) { return chalk.cyan(str) }
  grey (str) { return chalk.grey(str) }
  red (str) { return chalk.red(str) }

  log (...args) {
    log(chalk.blue(this.name), ...args)
  }
  warn (...args) {
    warn(chalk.blue(this.name), ...args)
  }
  error (...args) {
    error(chalk.blue(this.name), ...args)
  }
  time (label) {
    console.time(`[genie-rms] ${label}`)
  }
  timeEnd (label) {
    console.timeEnd(`[genie-rms] ${label}`)
  }
}
