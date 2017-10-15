import Vue from 'vue'
import Vuex from 'vuex'

import { intersect, setHashParams } from './util.js'
import { eventHub } from './eventHub.js'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    language: {
      selected: 'de',
      terms: {}
    },
    topic: { list: [], data: {}, selected: [], available: [] },
    institution: { list: [], data: {}, selected: [], available: []},
    canton: { list: [], data: {}, selected: [], available: [] },
    head: { list: [], data: {}, selected: [], available: [] },
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
      setHashParams(data.list, data.data)
      Vue.set(state[data.list], 'selected', data.data)
    }
  },
  getters: {
    term({language}){
      return (key, params) => {
        const term = language.terms[key]
        return term ? term : key;
      }
    },
    topics(state){
      return state.topic.available.map(id => {
        const topic = state.topic.data[id]
        topic.name = topic[state.language.selected]
        return topic
      })
    },
    institutions({institution}){
      return institution.available.map(id => institution.data[id])
    },
    cantons({canton}){
      return canton.available.map(id => canton.data[id])
    },
    heads({head}){
      return head.available.map(id => head.data[id])
    },

    groupById(state, getters){
      return (id) => {
        const group = state.group.data[id]

        group.canton = state.canton.data[group.cantonId].name
        group.institution = state.institution.data[group.institutionId].name
        group.topics = group.topicIds.map(topic_id => state.topic.data[topic_id])
        group.heads = group.headIds.map(head_id => state.head.data[head_id])

        return group
      }
    },

    allGroups(state, getters) {
      const lang = state.language.terms
      const groups = state.group.list.map(id => getters.groupById(id))
      return groups;
    },

    groups(state, getters) {
      const allG = getters.allGroups
      const slcC = state.canton.selected
      const slcI = state.institution.selected
      const slcH = state.head.selected
      const slcT = state.topic.selected

      let groups = []
      const tempC = {}
      let cantons = []
      const tempI = {}
      let institutions = []
      const tempH = {}
      let heads = []
      const tempT = {}
      let topics = []


      if(slcC.length === 0 && slcI.length === 0 && slcH.length === 0 && slcT.length === 0){

        groups = allG
        cantons = state.canton.list
        institutions = state.institution.list
        heads = state.head.list
        topics = state.topic.list

      } else {

        allG.forEach((v) => {
          const checkCanton = (slcC.length === 0 || slcC.indexOf(v.cantonId) != -1)
          const checkInstitution = (slcI.length === 0 || slcI.indexOf(v.institutionId) != -1)
          const checkHead = (slcH.length === 0 || intersect(slcH, v.headIds).length > 0)
          const checkTopic = (slcT.length === 0 || intersect(slcT, v.topicIds).length >= slcT.length)

          if(checkCanton && checkInstitution && checkHead && checkTopic){
            groups.push(v)

            v.topicIds.forEach(id => {
              if(!tempT[id]){
                tempT[id] = true
                topics.push(id)
              }
            })
          }

          if(checkInstitution && checkHead && checkTopic){
            if(!tempC[v.cantonId]){
              tempC[v.cantonId] = true
              cantons.push(v.cantonId)
            }
          }

          if(checkCanton && checkHead && checkTopic){
            if(!tempI[v.institutionId]){
              tempI[v.institutionId] = true
              institutions.push(v.institutionId)
            }
          }

          if(checkCanton && checkInstitution && checkTopic){
            v.headIds.forEach(id => {
              if(!tempH[id]){
                tempH[id] = true
                heads.push(id)
              }
            })
          }
        })
      }

      Vue.set(state.institution, 'available', institutions)
      Vue.set(state.canton, 'available', cantons)
      Vue.set(state.head, 'available', heads)
      Vue.set(state.topic, 'available', topics)

      return groups
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
