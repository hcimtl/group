import Vue from 'vue'
import Vuex from 'vuex'
import Papa from 'papaparse'

import { intersect, setHashParams, getHashParams, ajax } from './util.js'
import { eventHub } from './eventHub.js'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    language: {
      selected: 'de',
      terms: {}
    },
    topic: { list: [], data: {}, selected: [], available: [] },
    institution: { list: [], data: {}, selected: [], available: [] },
    canton: { list: [], data: {}, selected: [], available: [] },
    head: { list: [], data: {}, selected: [], available: [] },
    group: { list: [], data: {}, selected: [] },
    bounds: {
      ne: [47.933243004813725, 10.575639903386495],
      sw: [45.639066961601685, 5.883893951813307]
    },
    cacheDuration: (1000*60*60*24*3) // 3 days
  },
  mutations: {
    setLanguage(state, data) {
      Vue.set(state.language, 'selected', data.data)
      this.dispatch('loadLanguage')
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
  },
  actions: {
    loadLanguage({ commit, state }){
      ajax(`./data/language.${state.language.selected}.json`, (data) => {
        data = JSON.parse(data)
        commit('setLanguageTerms', { data: data })
        document.title = data.title
      })
    },
    loadGroups({ commit, state }){
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('dbDate')
        const dbGroupArray = localStorage.getItem('groupArray')

        if((Date.now() - dbDate) < state.cacheDuration && dbGroupArray){
          commit('setData', { list: 'group', data: JSON.parse(dbGroupArray) })
          resolve()
        } else {
          ajax('./data/groups.csv', (data) => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            const groupArray = parsedCSV.data.map(group => {
              return {
                id: parseInt(group.id),
                name: group.name.trim(),
                headIds: group.headIds ? group.headIds.toString().split(',').map(id => parseInt(id)) : [],
                institutionId: parseInt(group.institutionId),
                department: group.department.trim(),
                institute: group.institute.trim(),
                cantonId: parseInt(group.cantonId),
                street: group.street.trim(),
                city: group.city,
                zip: group.zip,
                website: group.website.trim(),
                mainTopicId: parseInt(group.mainTopicId),
                coords: { lat: parseFloat(group.lat), lng: parseFloat(group.lng) },
                topicIds: group.topicIds ? group.topicIds.toString().split(',').map(id => parseInt(id)) : []
              }
            })
            commit('setData', { list: 'group', data: groupArray })
            localStorage.setItem('groupArray', JSON.stringify(groupArray))
            localStorage.setItem('dbDate', Date.now())
            resolve()
          }, (err) => {
            reject()
          })
        }
      })
    },
    loadTopics({ commit, state }){
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('dbDate')
        const dbTopicArray = localStorage.getItem('topicArray')
        if((Date.now() - dbDate) < state.cacheDuration && dbTopicArray){
          commit('setData', { list: 'topic', data: JSON.parse(dbTopicArray) })
          resolve()
        } else {
          ajax('./data/topics.csv', (data) => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            const topicArray = parsedCSV.data.map(topic => {
              return {
                id: parseInt(topic.id),
                de: topic.de.trim(),
                fr: topic.fr.trim(),
                it: topic.it.trim(),
                en: topic.en.trim(),
                main: !!parseInt(topic.main)
              }
            })
            commit('setData', { list: 'topic', data: topicArray })
            localStorage.setItem('topicArray', JSON.stringify(topicArray))
            localStorage.setItem('dbDate', Date.now())
            resolve()
          }, (err) => {
            reject(err)
          })
        }
      })
    },
    loadCantons({ commit, state }){
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('dbDate')
        const dbCantonArray = localStorage.getItem('cantonArray')
        if((Date.now() - dbDate) < state.cacheDuration && dbCantonArray){
          commit('setData', { list: 'canton', data: JSON.parse(dbCantonArray) })
          resolve()
        } else {
          ajax('./data/cantons.csv', (data) => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            const cantonArray = parsedCSV.data.map(canton => {
              return {
                id: parseInt(canton.id),
                name: canton.name.trim(),
                short: canton.short.trim()
              }
            })
            commit('setData', { list: 'canton', data: cantonArray })
            localStorage.setItem('cantonArray', JSON.stringify(cantonArray))
            localStorage.setItem('dbDate', Date.now())
            resolve()
          }, (err) => {
            reject(err)
          })
        }
      })
    },
    loadHeads({ commit, state }){
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('dbDate')
        const dbHeadArray = localStorage.getItem('headArray')
        if((Date.now() - dbDate) < state.cacheDuration && dbHeadArray){
          commit('setData', { list: 'head', data: JSON.parse(dbHeadArray) })
          resolve()
        } else {
          ajax('./data/persons.csv', (data) => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            const headArray = parsedCSV.data.map(head => {
              return {
                id: parseInt(head.id),
                name: head.name.trim()
              }
            })

            commit('setData', { list: 'head', data: headArray })
            localStorage.setItem('headArray', JSON.stringify(headArray))
            localStorage.setItem('dbDate', Date.now())
            resolve()
          }, (err) => {
            reject(err)
          })
        }
      })
    },
    loadInstitutions({ commit, state }){
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('dbDate')
        const dbInstitutionArray = localStorage.getItem('institutionArray')
        if((Date.now() - dbDate) < state.cacheDuration && dbInstitutionArray){
          commit('setData', { list: 'institution', data: JSON.parse(dbInstitutionArray) })
          resolve()
        } else {
          ajax('./data/institutions.csv', (data) => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            const institutionArray = parsedCSV.data.map(institution => {
              return {
                id: parseInt(institution.id),
                name: institution.name.trim(),
                short: institution.short.trim()
              }
            })
            commit('setData', { list: 'institution', data: institutionArray })
            localStorage.setItem('institutionArray', JSON.stringify(institutionArray))
            localStorage.setItem('dbDate', Date.now())
            resolve()
          }, (err) => {
            reject(err)
          })
        }
      })
    },
    loadHash({ commit, state }){
      const params = getHashParams()
      let topics = []
      let institutions = []
      let cantons = []
      let heads = []

      if(params.lang && params.lang != state.language.selected){
        commit('setLanguage', { data: params.lang })
      }

      if(params.topic) topics = params.topic.split(',').map(id => parseInt(id))
      if(params.institution) institutions = params.institution.split(',').map(id => parseInt(id))
      if(params.canton) cantons = params.canton.split(',').map(id => parseInt(id))
      if(params.head) heads = params.head.split(',').map(id => parseInt(id))


      if(state.topic.selected.toString() != topics.toString()) commit('setSelected', { list: 'topic', data: topics })
      if(state.institution.selected.toString() != institutions.toString()) commit('setSelected', { list: 'institution', data: institutions })
      if(state.canton.selected.toString() != cantons.toString()) commit('setSelected', { list: 'canton', data: cantons })
      if(state.head.selected.toString() != heads.toString()) commit('setSelected', { list: 'head', data: heads })
    }
  }
})
