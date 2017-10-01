import Vue from 'vue'

import App from './components/App.vue'
import { store } from './store.js'
import './data.js'

import './app.less'

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
