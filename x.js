const fs = require('fs')
const ScriptController = require('./src/Controller')

const controller = new ScriptController(fs.readFileSync('./test/Water Fortress V1.rms'))
controller.generate()

controller.map.render().pipe(fs.createWriteStream('./map.png'))
