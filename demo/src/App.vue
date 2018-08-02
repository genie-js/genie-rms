<template>
  <div id="app" class="sans-serif absolute h-100 w-100">
    <div class="flex h-100 w-100">
      <div style="flex-grow: 2">
        <code-mirror
          v-model="code"
          :options="options"
          @ready="cmReady"
        ></code-mirror>
      </div>
      <div class="bg-dark-gray white pa2">
        <h2 class="pa0 ma0">Preview</h2>
        <minimap :data="imageData" size="120"></minimap>
        <p class="flex items-center w-100">
          <span class="mr2">Seed:</span>
          <input type="number" min="0" max="32767" v-model="seed" class="self-stretch">
          <button @click="randomSeed" class="ml2">(randomize)</button>
        </p>
        <h2 class="pa0 ma0">Warnings</h2>
        <ul class="light-red">
          <li v-for="warning of warnings">{{warning.message}}</li>
        </ul>
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
const debounce = require('debounce')
const { Pos } = require('codemirror')
const { codemirror: CodeMirrorComponent } = require('vue-codemirror')
const Minimap = require('./components/Minimap.vue')
const generate = require('./generate.js')
const fs = require('fs')

require('codemirror/addon/lint/lint')
// Add codemirror language.
require('./aoe2-rms.js')

const arabiaRms = fs.readFileSync(require.resolve('./Arabia.rms'), 'utf8')

module.exports = {
  name: 'app',
  data () {
    return {
      code: arabiaRms,
      seed: 32767,
      warnings: [],
      imageData: null,
      cm: null,
      options: {
        mode: 'aoe2-rms',
        theme: 'monokai',
        styleActiveLine: true,
        lineNumbers: true,
        lint: this.lint.bind(this),
        lintOnChange: false
      }
    }
  },

  beforeMount () {
    this.regenerate()
  },

  watch: {
    code: 'regenerate',
    seed: 'regenerate',
    warnings: 'showLintWarnings'
  },

  methods: {
    cmReady (cm) {
      this.cm = cm
    },
    randomSeed () {
      this.seed = Math.floor(Math.random() * 32767)
    },
    regenerate: debounce(function () {
      generate(this.code, {
        randomSeed: this.seed
      }).then(({ warnings, imageData }) => {
        this.warnings = warnings
        this.imageData = imageData
      })
    }, 300),
    lint () {
      const guessEndColumn = (warn) => {
        const line = this.code.split('\n')[warn.line - 1]
        const ws = line.slice(warn.column).search(/\s/)
        return ws === -1 ? line.length : warn.column + ws
      }
      return this.warnings.map((warn) => ({
        message: warn.message,
        severity: 'error',
        from: Pos(warn.line - 1, warn.column),
        to: Pos(warn.line - 1, guessEndColumn(warn)),
      }))
    },
    showLintWarnings () {
      if (this.cm) this.cm.performLint()
    }
  },

  components: {
    CodeMirror: CodeMirrorComponent,
    Minimap
  }
}
</script>
