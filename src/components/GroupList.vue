<template>
  <div class="list-container">
    <div v-for="group in groups" class="ui fluid  card">
      <div class="content">
        <a class="header" target="_blank" :href="group.website.replace('#', '')">{{ group.name }}</a>
        <div class="description">
          <strong>{{group.institution}}</strong><br>
          {{group.institute}}<br>
          {{term('head')}}: {{group.heads.join(', ')}}<br>
        </div>
      </div>
      <div class="content">
        <div class="ui basic label"><strong>{{group.mainTopic}}</strong></div>
        <div class="ui basic label" v-for="topic in group.topics">{{topic}}</div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'group-list',
    props: [],
    data: function(){
      return {}
    },
    computed: {
      groups(){
        return this.$store.getters.groupsForList.slice(0,10)
      }
    },
    methods: {
      term(term){
        return this.$store.getters.term(term)
      }
    },
    mounted: function(){
    }
  }
</script>

<style lang="less">

</style>
