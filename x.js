const fs = require('fs')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const finished = promisify(require('stream').finished)
const { PNG } = require('pngjs')
const DebugController = require('./src/DebugController')

async function main (
  file = './rms/Arabia.rms',
  randomSeed = Date.now()
) {
  const content = await readFile(file)

  const controller = new DebugController(content, { randomSeed })
  controller.generate()

  for (const [name, imageData] of controller.minimaps) {
    const png = new PNG({
      width: controller.map.sizeX,
      height: controller.map.sizeY
    })
    png.data = Buffer.from(imageData)

    await finished(png.pack().pipe(fs.createWriteStream(`./map-${name}.png`)))
  }
}

main(...process.argv.slice(2)).catch((err) => {
  setImmediate(() => { throw err })
})
