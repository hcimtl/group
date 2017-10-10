import Vue from 'vue'

import App from './components/App.vue'
import { store } from './store.js'
import './data.js'

import './index.html'

import 'semantic-ui-less/definitions/modules/transition.js'
import 'semantic-ui-less/definitions/modules/dropdown.js'

//import 'leaflet/dist/leaflet.js'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'

import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './theme/semantic.less'

import './data/bafu_umwelt_fgrps_db.csv'
import './data/language.de.json'
import './data/language.fr.json'
import './data/language.it.json'
import './data/language.en.json'


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
