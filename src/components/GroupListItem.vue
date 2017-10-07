<template>
  <div class="ui vertical segment">
    <h4 class="ui header">
      <a target="_blank" :href="group.website">{{ group.name }}</a>
      <button class="ui right floated icon tiny primary button" @click="locate(group.id)">
        <i class="icon marker"></i>
      </button>
      <div class="sub header">
        {{ group.heads.map(head => head.name).join(', ') }}
      </div>
    </h4>
    <div class="description">
      <p>
        <span><strong>{{group.institution}}</strong></span><br>
        <span v-if="group.institution != group.departement">{{group.departement}} <br></span>
        <span v-if="group.institution != group.institute && group.departement !== group.institute">{{group.institute}}<br></span>
      </p>
      <div class="ui labels">
        <div v-for="topic in topics" :key="topic.id" :class="[(topic.id == group.mainTopicId) ? 'black' : 'basic', 'ui tiny label']">
          {{ topic.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { sortLocale } from './../util.js'

  export default {
    name: 'group-list-item',
    props: ['group'],
    data: function(){
      return {}
    },
    computed: {
      topics(){
        return this.group.topics.sort((a,b) => { return a.id == this.group.mainTopicId ? -1 : 1 })
      }
    },
    methods: {
      locate(id){
        this.eventHub.$emit('locate', id)
      }
    }
  }
</script>
