const Vue = require('vue')
const App = require('./App.vue')

new Vue({ // eslint-disable-line no-new
  el: '#app',
  render: (h) => h(App)
})
