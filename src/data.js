import { store } from './store.js'
import 'jquery-csv'

const dbDate = localStorage.getItem('dbDate')
const cacheDuration = (1000*60*60*24*3) // 3 days

if((Date.now() - dbDate) < cacheDuration){

  const topicArray = JSON.parse(localStorage.getItem('topicArray'))
  const institutionArray = JSON.parse(localStorage.getItem('institutionArray'))
  const cantonArray = JSON.parse(localStorage.getItem('cantonArray'))
  const headArray = JSON.parse(localStorage.getItem('headArray'))
  const groupArray = JSON.parse(localStorage.getItem('groupArray'))

  store.commit('setData', { list: 'topic', data: topicArray })
  store.commit('setData', { list: 'institution', data: institutionArray })
  store.commit('setData', { list: 'canton', data: cantonArray })
  store.commit('setData', { list: 'head', data: headArray })
  store.commit('setData', { list: 'group', data: groupArray })

} else {

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
        department: r.departement.trim(),
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


      const heads = r.group_head.split(/[\ ]*,[\ ]*|^[\ ]*|[\ ]*$/)
      for(let h in heads) {
        const head = heads[h]

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

      const topics = r.group_alltopics_de.split(/[\ ]*,[\ ]*|^[\ ]*|[\ ]*$/)
      const topics_fr = r.group_alltopics_fr.split(/[\ ]*,[\ ]*|^[\ ]*|[\ ]*$/)
      const topics_it = r.group_alltopics_it.split(/[\ ]*,[\ ]*|^[\ ]*|[\ ]*$/)
      const topics_en = r.group_alltopics_en.split(/[\ ]*,[\ ]*|^[\ ]*|[\ ]*$/)

      const main_topic = r.group_maintopic_de


      for(let t in topics) {
        const topic = topics[t] ? topics[t] : false
        const topic_fr = topics_fr[t] ? topics_fr[t] : false
        const topic_it = topics_it[t] ? topics_it[t] : false
        const topic_en = topics_en[t] ? topics_en[t] : false

        if(!topic || !topic_fr || !topic_it || !topic_en) break

        if(!topicArray[topic]) {
          topicArray[topic] = { de: topic, fr: topic_fr, it: topic_it, en: topic_en, id: topicIndex }
          groupArray[r.gid].topicIds.push(topicIndex)
          topicIndex++
        } else {
          groupArray[r.gid].topicIds.push(topicArray[topic].id)
        }

        if(topic == main_topic) {
          topicArray[topic].main = true
          groupArray[r.gid].mainTopicId = topicArray[topic].id
        }
      }
    }

    localStorage.setItem('topicArray', JSON.stringify(topicArray))
    localStorage.setItem('institutionArray', JSON.stringify(institutionArray))
    localStorage.setItem('cantonArray', JSON.stringify(cantonArray))
    localStorage.setItem('headArray', JSON.stringify(headArray))
    localStorage.setItem('groupArray', JSON.stringify(groupArray))
    localStorage.setItem('dbDate', Date.now())

    store.commit('setData', { list: 'topic', data: topicArray })
    store.commit('setData', { list: 'institution', data: institutionArray })
    store.commit('setData', { list: 'canton', data: cantonArray })
    store.commit('setData', { list: 'head', data: headArray })
    store.commit('setData', { list: 'group', data: groupArray })

  })
}
