const fs = require('fs')
const ScriptController = require('./src/Controller')

const file = process.argv[2] || './test/Arabia.rms'
const content = fs.readFileSync(file)

const controller = new ScriptController(content)
controller.generate()

controller.map.render().pipe(fs.createWriteStream('./map.png'))
