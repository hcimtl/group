import { store } from './store.js'
import 'jquery-csv'
import { getHashParams } from './util.js'

$.ajax({
  method: 'GET',
  url: './data/bafu_umwelt_fgrps_db.csv',
}).done(function(data) {
  const database = $.csv.toObjects(data)

  let cantonIndex = 0
  let institutionIndex = 0
  let headIndex = 0
  let topicIndex = 0

  const cantonArray = {}
  const institutionArray = {}
  const headArray = {}
  const topicArray = {}

  const groupArray = {}

  const dbLength = database.length

  for(let i = 0; i < dbLength; i++){
    const r = database[i]

    groupArray[r.gid] = {
      id: r.gid,
      name: r.groupname.trim(),
      headIds: [],
      institutionId: null,
      departement: r.departement.trim(),
      institute: r.institute.trim(),
      cantonId: null,
      street: r.group_street.trim(),
      city: r.group_city.trim(),
      zip: r.group_zip.trim(),
      website: r.group_website.replace('#', ''),
      coords: { lat: r.group_xcoord, lng: r.group_ycoord },
      topicIds: []
    }

    r.canton = r.canton.trim()
    if(!cantonArray[r.cantonID]) {
      cantonArray[r.cantonID] = { name: r.canton, short: r.cantonID, id: cantonIndex }
      groupArray[r.gid].cantonId = cantonIndex
      cantonIndex++
    } else {
      groupArray[r.gid].cantonId = cantonArray[r.cantonID].id
    }

    r.institution = r.institution.trim()
    if(!institutionArray[r.institution]) {
      institutionArray[r.institution] = {name: r.institution, id: institutionIndex }
      groupArray[r.gid].institutionId = institutionIndex
      institutionIndex++
    } else {
      groupArray[r.gid].institutionId = institutionArray[r.institution].id
    }


    const heads = r.group_head.split(/[\ ]*,[\ ]*/)
    for(let h in heads) {
      const head = heads[h].trim()

      if(head.length > 0){
        if(!headArray[head]) {
          headArray[head] = { name: head, id: headIndex }
          groupArray[r.gid].headIds.push(headIndex)
          headIndex++
        } else {
          groupArray[r.gid].headIds.push(headArray[head].id)
        }
      }
    }

    const topics = r.group_alltopics_de.split(',')
    const topics_fr = r.group_alltopics_fr.split(',')
    const topics_it = r.group_alltopics_it.split(',')
    const topics_en = r.group_alltopics_en.split(',')

    topics.unshift(r.group_maintopic_de)
    topics_fr.unshift(r.group_maintopic_fr)
    topics_it.unshift(r.group_maintopic_it)
    topics_en.unshift(r.group_maintopic_en)

    for(let t in topics) {
      const topic = topics[t].trim()
      const topic_fr = topics_fr[t] ? topics_fr[t].trim() : ''
      const topic_it = topics_it[t] ? topics_it[t].trim() : ''
      const topic_en = topics_en[t] ? topics_en[t].trim() : ''

      if(topic.length > 0){
        if(!topicArray[topic]) {
          topicArray[topic] = { de: topic, fr: topic_fr, it: topic_it, en: topic_en, id: topicIndex, main: t == 0 ? true : false }
          groupArray[r.gid].topicIds.push(topicIndex)
          topicIndex++
        } else {
          groupArray[r.gid].topicIds.push(topicArray[topic].id)
        }
        if(t == 0) groupArray[r.gid].mainTopicId = topicArray[topic].id
      }
    }
  }

  store.commit('setData', { list: 'topic', data: topicArray })
  store.commit('setData', { list: 'institution', data: institutionArray })
  store.commit('setData', { list: 'canton', data: cantonArray })
  store.commit('setData', { list: 'head', data: headArray })
  store.commit('setData', { list: 'group', data: groupArray })

})

loadLanguage()
store.watch((state, getters) => { return state.language.selected }, (value) => {
  loadLanguage()
})

function loadLanguage(){
  $.ajax({
    method: 'GET',
    url: `./data/language.${store.state.language.selected}.json`,
  }).done(function(data) {
    store.commit('setLanguageTerms', { data: data })
  });
}

loadHash()
$(window).on('hashchange', function(){
  loadHash()
})
function loadHash(){
  const params = getHashParams()
  if(params.lang){
    store.commit('setLanguage', { data: params.lang })
  }
}
