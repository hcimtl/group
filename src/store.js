import Vue from 'vue'
import Vuex from 'vuex'

import { intersect } from './util.js'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    language: {
      selected: 'de',
      terms: {}
    },
    topic: { list: [], data: {}, selected: [] },
    institution: { list: [], data: {}, selected: [] },
    canton: { list: [], data: {}, selected: [] },
    head: { list: [], data: {}, selected: [] },
    group: { list: [], data: {}, selected: [] },
    bounds: {
      ne: [47.933243004813725, 10.575639903386495],
      sw: [45.639066961601685, 5.883893951813307]
    }
  },
  mutations: {
    setLanguage(state, data) {
      Vue.set(state.language, 'selected', data.data)
    },
    setLanguageTerms(state, data){
      Vue.set(state.language, 'terms', data.data)
    },
    setBounds(state, data){
      Vue.set(state, 'bounds', data)
    },
    setData(state, data){
      for(let d in data.data){
        const r = data.data[d]
        Vue.set(state[data.list].data, r.id, r)
        state[data.list].list.push(r.id)
      }
    },

    setSelected(state, data){
      Vue.set(state[data.list], 'selected', data.data)
    }
  },
  getters: {
    term({language}){
      return (key, params) => {
        const term = language.terms[key]
        return term ? term : '';
      }
    },
    topics(state){
      return state.topic.list.map(id => {
        const topic = state.topic.data[id]
        topic.name = topic[state.language.selected]
        return topic
      })
    },
    institutions({institution}){
      return institution.list.map(id => institution.data[id])
    },
    cantons({canton}){
      return canton.list.map(id => canton.data[id])
    },
    heads({head}){
      return head.list.map(id => head.data[id])
    },
    allGroups(state, getters) {
      const groups = state.group.list.map(id => state.group.data[id])
      const lang = state.language.terms

      const groupsLength = groups.length
      for(let i = 0; i < groupsLength; i++){
        groups[i] = getters.groupById(groups[i].id)
      }
      return groups;
    },
    groups(state, getters){

      let groups = getters.allGroups
      const slcC = state.canton.selected
      const slcI = state.institution.selected
      const slcH = state.head.selected
      const slcT = state.topic.selected

      groups = groups.filter((v) => {
        return  (
          (slcC.length === 0 || slcC.indexOf(v.cantonId) != -1) &&
          (slcI.length === 0 || slcI.indexOf(v.institutionId) != -1) &&
          (slcH.length === 0 || intersect(slcH, v.headIds).length > 0) &&
          (slcT.length === 0 || intersect(slcT, v.topicIds).length >= slcT.length)
        )
      })

      return groups
    },
    groupById(state, getters){
      return (id) => {
        if(!id) return {}
        if(!state.group.data[id]) return {}
        const group = state.group.data[id]

        group.canton = state.canton.data[group.cantonId].name
        group.institution = state.institution.data[group.institutionId].name

        const topicLength = group.topicIds.length
        group.topics = []
        for(let i = 0; i < topicLength; i++){
          const topic = state.topic.data[group.topicIds[i]]
          if(topic.id == group.mainTopicId){
            group.mainTopic = topic.name
          } else {
            group.topics.push(topic.name)
          }
        }

        const headLength = group.headIds.length
        group.heads = []
        for(let i = 0; i < headLength; i++){
          group.heads.push(state.head.data[group.headIds[i]].name)
        }

        return group
      }
    },

    groupsAvailable(state, getters){
      let groups = getters.groups
      const slcB = state.bounds

      groups = groups.filter((v) => {
        return  (
          (v.coords.lat <= slcB.ne[0] && v.coords.lat >= slcB.sw[0]) &&
          (v.coords.lng <= slcB.ne[1] && v.coords.lng >= slcB.sw[1])
        )
      })

      return groups
    }
  }
})
