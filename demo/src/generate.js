const Controller = require('../../src/Controller')

let nextId = 0
module.exports = function generate (code, options) {
  const warnings = []
  options = Object.assign({}, options, {
    onWarn: warnings.push.bind(warnings)
  })

  const controller = new Controller(code, options)

  // It's not yet async but will be in the future
  // to support `#include`s
  return Promise.resolve()
    .then(() => controller.generate())
    .then(() => {
      const imageData = controller.map.getImageData()

      return {
        warnings,
        imageData
      }
    })
}
