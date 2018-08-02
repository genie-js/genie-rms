<template>
  <div class="root">
    <canvas width="400" height="400"></canvas>
  </div>
</template>
<script>
const debounce = require('debounce')
const Controller = require('../../../src/Controller')

module.exports = {
  name: 'minimap',

  props: {
    options: {
      default: { seed: null }
    },
    code: String
  },

  mounted () {
    this.canvas = this.$el.querySelector('canvas')
    this.update()
  },
  watch: {
    options () { this.update() },
    code () { this.update() }
  },

  methods: {
    update: debounce(function () {
      const controller = new Controller(this.code, this.options)
      controller.generate()
      this.draw(controller.map.render())
    }, 300),
    draw (canvas) {
      const target = this.canvas.getContext('2d')
      target.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height)
    }
  }
}
</script>
