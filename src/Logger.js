if (typeof document !== 'undefined') {
  module.exports = require('./BrowserLogger.js')
} else {
  module.exports = require('./NodeLogger.js')
}
