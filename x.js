const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const finished = promisify(require('stream').finished)
const { PNG } = require('pngjs')
const { Controller } = require('./src')

class StepsController extends Controller {
  addModule (module) {
    super.addModule(module)

    this.modules.push({
      constructor: class MapImageModule {},
      generate: () => {
        this.minimaps.push(this.map.render())
      },
      schedule: module.schedule + 0.001
    })
  }

  generate () {
    this.minimaps = []

    super.generate()
  }
}

async function main (file = './rms/Arabia.rms') {
  const content = await readFile(file)

  const controller = new StepsController(content)
  controller.generate()

  let i = 0
  for (const imageData of controller.minimaps) {
    const png = new PNG({
      width: controller.map.sizeX,
      height: controller.map.sizeY
    })
    png.data = Buffer.from(imageData)

    await finished(png.pack().pipe(fs.createWriteStream(`./map-${i}.png`)))
    i += 1
  }
}

main(...process.argv.slice(2)).catch((err) => {
  setImmediate(() => { throw err })
})
