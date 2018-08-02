<template>
  <div id="app" class="sans-serif absolute h-100 w-100">
    <div class="flex h-100 w-100">
      <div style="flex-grow: 2">
        <code-mirror
          v-model="code"
          :options="options"
        ></code-mirror>
      </div>
      <div class="bg-dark-gray white pa2">
        <h2 class="pa0 ma0">Preview</h2>
        <minimap :code="code" :options="{ randomSeed: seed }"></minimap>
        <p class="flex items-center w-100">
          <span class="mr2">Seed:</span>
          <input type="number" v-model="seed" class="self-stretch">
          <button @click="randomSeed" class="ml2">(randomize)</button>
        </p>
        <p class="bg-dark-red pa3" style="width: 400px">
          This is still a work in progress! Player lands, elevation, and cliffs are not yet implemented.
          Maps with islands or lots of forest will not work correctly.
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.vue-codemirror, .vue-codemirror .CodeMirror { height: 100% }
</style>

<script>
const { codemirror: CodeMirror } = require('vue-codemirror')
const Minimap = require('./components/Minimap.vue')

require('./aoe2-rms.js')

module.exports = {
  name: 'app',
  data () {
    return {
      code: '/* Write your RMS file here */\n<TERRAIN_GENERATION>\nbase_terrain DIRT\n<LAND_GENERATION>\ncreate_lands {\n\n}',
      seed: Math.floor(Math.random() * 32767),
      options: {
        mode: 'aoe2-rms',
        theme: 'monokai',
        styleActiveLine: true,
        lineNumbers: true
      }
    }
  },
  methods: {
    randomSeed () {
      this.seed = Math.floor(Math.random() * 32767)
    }
  },
  components: {
    CodeMirror,
    Minimap
  }
}
</script>
