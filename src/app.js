import Vue from 'vue'

import App from './components/App.vue'
import { store } from './store.js'
import { eventHub } from './eventHub.js'

import './index.html'

import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css';

import './theme/semantic.less'

import './data/groups.csv'
import './data/topics.csv'
import './data/persons.csv'
import './data/cantons.csv'
import './data/institutions.csv'

import './data/language.de.json'
import './data/language.fr.json'
import './data/language.it.json'
import './data/language.en.json'

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
