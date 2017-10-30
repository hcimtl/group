<template>
  <div class="ui vertical segment">
    <button class="ui right floated icon button mini basic primary" @click="locate(group.id)">
      <i class="icon marker"></i>
    </button>
    <h4 class="ui header">
      <a target="_blank" :href="group.website">{{ group.name }} <sup><i class="icon external"></i></sup></a>

      <div class="sub header">
        {{ group.heads.map(head => head.name).join(', ') }}
      </div>
    </h4>
    <div class="description">
      <p>
        <span><strong>{{group.institution}}</strong></span><br>
        <span v-if="group.institution != group.department">{{group.department}} <br></span>
        <span v-if="group.institution != group.institute && group.department !== group.institute">{{group.institute}}<br></span>
      </p>
      <div class="ui labels">
        <div v-for="topic in topics" :key="topic.id" :class="[(topic.id == group.mainTopicId) ? 'bold' : '', 'ui basic label']">
          {{ topic.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'group-list-item',
    props: ['group'],
    data: function(){
      return {}
    },
    computed: {
      topics(){
        const terms = this.$store.state.language.terms
        const tops = this.$store.getters.topics
        return this.group.topics.sort((a,b) => { return a.id == this.group.mainTopicId ? -1 : 1 })
      }
    },
    methods: {
      locate(id){
        this.eventHub.$emit('map-locate', id)
      }
    }
  }
</script>
