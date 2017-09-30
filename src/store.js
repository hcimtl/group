import Vue from 'vue'
import Vuex from 'vuex'
import 'jquery-csv'
import { unique } from './util.js'

Vue.use(Vuex)

export const store =  new Vuex.Store({
  state: {
    lang: 'de',
    topic: {
      all: [],
      selected: []
    },
    canton: {
      all: [],
      selected: ['BE','ZH']
    },
    head: {
      all: [],
      selected: []
    }
  },
  mutations: {
    updateTopic(state, data){
      Vue.set(state.topic, data.type, data.data)
    },
    updateCanton(state, data){
      Vue.set(state.canton, data.type, data.data)
    },
    updateHead(state, data){
      Vue.set(state.head, data.type, data.data)
    }
  }
})


$.ajax({
  method: 'GET',
  url: './data/bafu_umwelt_fgrps_db.csv',
}).done(function(data) {
  const database = $.csv.toObjects(data)

  const cantonArray = []
  const headArray = []
  const topicArray = []

  for(let i = 0; i < database.length; i++){
    const r = database[i]
    cantonArray.push({ name: r.canton, value: r.cantonID })
    headArray.push({ name: r.group_head, value: r.gid })
    topicArray.push({ name: r.group_maintopic_de, value: r.group_maintopic_de })

    const allTopics = r.group_alltopics_de.split(', ');
    for(let j = 0; j < allTopics.length; j++){
      topicArray.push({ name: allTopics[j], value: allTopics[j] })
    }
  }

  store.commit('updateCanton', { type: 'all', data: unique(cantonArray, 'value') })
  store.commit('updateHead', { type: 'all', data: unique(headArray, 'name') })
  store.commit('updateTopic', { type: 'all', data: unique(topicArray, 'value') })

})
