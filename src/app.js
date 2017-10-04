import Vue from 'vue'

import App from './components/App.vue'
import { store } from './store.js'
import './data.js'

import './app.less'


const eventHub = new Vue()

Vue.mixin({
  data: function () {
    return {
      eventHub: eventHub
    }
  }
})

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
