<template>
  <div class="root">
    <canvas width="400" height="400"></canvas>
  </div>
</template>
<script>
module.exports = {
  name: 'minimap',

  props: ['data', 'size'],

  mounted () {
    this.canvas = this.$el.querySelector('canvas')
    this.context = this.canvas.getContext('2d')
  },

  watch: {
    data (bytes) {
      console.error({ bytes })
      if (bytes) {
        const imageData = new ImageData(bytes, this.size, this.size)
        const canvas = document.createElement('canvas')
        canvas.width = this.size
        canvas.height = this.size
        canvas.getContext('2d').putImageData(imageData, 0, 0)

        this.context.drawImage(canvas, 0, 0, this.canvas.width, this.canvas.height)
      }
    }
  },
}
</script>
