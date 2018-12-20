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

  function writePng (imageData, name) {
    const png = new PNG({
      width: controller.map.sizeX,
      height: controller.map.sizeY
    })
    png.data = Buffer.from(imageData)

    return finished(png.pack().pipe(fs.createWriteStream(name)))
  }

  for (const [name, imageData] of controller.minimaps) {
    await writePng(imageData, `./map-${name}.png`)
  }

  await writePng(controller.map.render(), './map.png')
}

main(...process.argv.slice(2)).catch((err) => {
  setImmediate(() => { throw err })
})
