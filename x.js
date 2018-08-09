const fs = require('fs')
const { PNG } = require('pngjs')
const ScriptController = require('./src/Controller')

const file = process.argv[2] || './test/Arabia.rms'
const content = fs.readFileSync(file)

const controller = new ScriptController(content)
controller.generate()

const imageData = controller.map.render()

const png = new PNG({
  width: controller.map.sizeX,
  height: controller.map.sizeY
})
png.data = Buffer.from(imageData)

png.pack().pipe(fs.createWriteStream('./map.png'))
