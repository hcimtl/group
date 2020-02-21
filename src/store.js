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
    member: { list: [], data: {}, selected: [], available: [] },
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
    members({member}){
      return member.available.map(id => member.data[id])
    },

    groupById(state, getters){
      return (id) => {
        const group = state.group.data[id]

        group.institutions = group.institutionIds.map(institution_id => state.institution.data[institution_id])
        group.topics = group.topicIds.map(topic_id => state.topic.data[topic_id])
        group.members = group.memberIds.map(member_id => state.member.data[member_id])

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
      const slcI = state.institution.selected
      const slcH = state.member.selected
      const slcT = state.topic.selected

      let groups = []
      const tempC = {}
      const tempI = {}
      let institutions = []
      const tempH = {}
      let members = []
      const tempT = {}
      let topics = []


      if(slcI.length === 0 && slcH.length === 0 && slcT.length === 0){

        groups = allG
        institutions = state.institution.list
        members = state.member.list
        topics = state.topic.list

      } else {

        allG.forEach((v) => {
          const checkInstitution = (slcI.length === 0 || intersect(slcI, v.institutionIds).length > 0)
          const checkMember = (slcH.length === 0 || intersect(slcH, v.memberIds).length > 0)
          const checkTopic = (slcT.length === 0 || intersect(slcT, v.topicIds).length >= slcT.length)

          if(checkInstitution && checkMember && checkTopic){
            groups.push(v)

            v.topicIds.forEach(id => {
              if(!tempT[id]){
                tempT[id] = true
                topics.push(id)
              }
            })
          }

          if(checkInstitution && checkMember && checkTopic){
            v.institutionIds.forEach((institutionId) => {
            if(!tempI[institutionId]){
              tempI[institutionId] = true
              institutions.push(institutionId)
            }
            })
          }

          if(checkInstitution && checkTopic){
            v.memberIds.forEach(id => {
              if(!tempH[id]){
                tempH[id] = true
                members.push(id)
              }
            })
          }
        })
      }

      Vue.set(state.institution, 'available', institutions)
      Vue.set(state.member, 'available', members)
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
                institutionIds: group.institutionIds ? group.institutionIds.toString().split(',').map(id => parseInt(id)) : [],
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
            resolve()
          }, (err) => {
            reject(err)
          })
        }
      })
    },
    loadMembers({ commit, state }){
      return new Promise((resolve, reject) => {
        const dbDate = localStorage.getItem('dbDate')
        const dbMemberArray = localStorage.getItem('memberArray')
        if((Date.now() - dbDate) < state.cacheDuration && dbMemberArray){
          commit('setData', { list: 'member', data: JSON.parse(dbMemberArray) })
          resolve()
        } else {
          ajax('./data/persons.csv', (data) => {
            const parsedCSV = Papa.parse(data, { header: true, skipEmptyLines: true })
            const memberArray = parsedCSV.data.map(member => {
              return {
                id: parseInt(member.id),
                name: member.name.trim(),
                website: member.website.trim(),
                mainTopicId: parseInt(member.mainTopicId),
                topicIds: member.topicIds ? member.topicIds.toString().split(',').map(id => parseInt(id)) : [],
                affiliations: member.affiliations ?  JSON.parse(member.affiliations) : []
              }
            })

            commit('setData', { list: 'member', data: memberArray })
            localStorage.setItem('memberArray', JSON.stringify(memberArray))
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
      let members = []

      if(params.lang && params.lang != state.language.selected){
        commit('setLanguage', { data: params.lang })
      }

      if(params.topic) topics = params.topic.split(',').map(id => parseInt(id))
      if(params.institution) institutions = params.institution.split(',').map(id => parseInt(id))
      if(params.member) members = params.member.split(',').map(id => parseInt(id))


      if(state.topic.selected.toString() != topics.toString()) commit('setSelected', { list: 'topic', data: topics })
      if(state.institution.selected.toString() != institutions.toString()) commit('setSelected', { list: 'institution', data: institutions })
      if(state.member.selected.toString() != members.toString()) commit('setSelected', { list: 'member', data: members })
    }
  }
})
