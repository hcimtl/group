import { store } from './store.js'
import 'jquery-csv'

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

  const groupArray = []

  for(let i = 0; i < database.length; i++){
    const r = database[i]

    groupArray[i] = {
      id: r.gid,
      name: r.groupname,
      headIds: [],
      institutionId: null,
      departement: r.departement,
      institute: r.institute,
      cantonId: null,
      street: r.group_street,
      city: r.group_city,
      zip: r.group_zip,
      website: r.group_website,
      coords: { lat: r.group_xcoord, lng: r.group_ycoord },
      topicIds: []
    }

    if(!cantonArray[r.cantonID]) {
      cantonArray[r.cantonID] = { name: r.canton, short: r.cantonID, id: cantonIndex }
      groupArray[i].cantonId = cantonIndex
      cantonIndex++
    } else {
      groupArray[i].cantonId = cantonArray[r.cantonID].id
    }

    if(!institutionArray[r.institution]) {
      institutionArray[r.institution] = {name: r.institution, id: institutionIndex }
      groupArray[i].institutionId = institutionIndex
      institutionIndex++
    } else {
      groupArray[i].institutionId = institutionArray[r.institution].id
    }


    const heads = r.group_head.split(/[\ ]*,[\ ]*/)
    for(let h in heads) {
      const head = heads[h].replace(/(^\ *)|(\ *$)/, '')

      if(head.length > 0){
        if(!headArray[head]) {
          headArray[head] = { name: head, id: headIndex }
          groupArray[i].headIds.push(headIndex)
          headIndex++
        } else {
          groupArray[i].headIds.push(headArray[head].id)
        }
      }
    }

    const topics = r.group_alltopics_de.split(/[\ ]*,[\ ]*/)
    topics.pop(r.group_maintopic_de)
    for(let t in topics) {
      const topic = topics[t].replace(/(^\ *)|(\ *$)/, '')

      if(topic.length > 0){
        if(!topicArray[topic]) {
          topicArray[topic] = { name: topic, id: topicIndex, main: t == 0 ? true : false }
          groupArray[i].topicIds.push(topicIndex)
          topicIndex++
        } else {
          groupArray[i].topicIds.push(topicArray[topic].id)
        }
      }
    }
  }

  store.commit('setData', { list: 'topic', data: topicArray })
  store.commit('setData', { list: 'institution', data: institutionArray })
  store.commit('setData', { list: 'canton', data: cantonArray })
  store.commit('setData', { list: 'head', data: headArray })
  store.commit('setData', { list: 'group', data:  groupArray })

})
