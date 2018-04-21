<template>
  <div id="app">
    <hello></hello>
  </div>
</template>

<script>
const Hello = require('./components/Hello.vue')

module.exports = {
  name: 'app',
  components: {
    Hello
  }
}
</script>
