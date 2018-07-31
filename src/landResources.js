const fs = require('fs')

module.exports = fs.readFileSync(require.resolve('./land_resources.inc'), 'utf8')
