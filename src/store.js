import Vue from 'vue'
import Vuex from 'vuex'

import { asc } from './util.js'


Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    lang: 'de',
    topic: { list: [], data: {} },
    institution: { list: [], data: {} },
    canton: { list: [], data: {} },
    head: { list: [], data: {} },
    group: { list: [], data: {} },
  },
  mutations: {

    setData(state, data){
      for(let d in data.data){
        const r = data.data[d]
        Vue.set(state[data.list].data, r.id, r)
        state[data.list].list.push(r.id)
      }
    },

    updateData(state, data){
      if(!data.replace) data.data = $.extend(true, {}, state[data.list].data[data.id], data.data)
      Vue.set(state[data.list].data, data.id, data.data)
    }
  },
  getters: {
    topics({topic}){
      return topic.list.map(id => topic.data[id]).sort(asc)
    },
    institutions({institution}){
      return institution.list.map(id => institution.data[id]).sort(asc)
    },
    cantons({canton}){
      return canton.list.map(id => canton.data[id]).sort(asc)
    },
    heads({head}){
      return head.list.map(id => head.data[id]).sort(asc)
    },
    groups({group}){
      return group.list.map(id => group.data[id])
    },
    selected(state, getters){
      return (getter) => {

        return getters[getter].filter((v) => v.selected )
      }
    }
  }
})
