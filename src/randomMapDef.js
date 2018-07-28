const fs = require('fs')

module.exports = fs.readFileSync(require.resolve('./random_map.def'), 'utf8')
