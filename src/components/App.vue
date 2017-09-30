<template>
  <div id="app" class="ui container">
    <form class="ui form">
      <div class="two fields">
        <group-filter :data="this.$store.state.topic" label="topic" icon="tags" update="updateTopic"></group-filter>
        <group-filter :data="this.$store.state.head" label="head" icon="user" update="updateHead" fulltext="true"></group-filter>
      </div>
      <div class="two fields">
        <group-filter :data="this.$store.state.canton" label="canton" icon="marker" update="updateCanton"></group-filter>
        <group-filter :data="this.$store.state.head" label="head" icon="user" update="updateHead" fulltext="true"></group-filter>
      </div>
    </form>
  </div>
</template>

<script>
  import GroupFilter from './GroupFilter.vue'

  export default {
    name: 'app',
    data: function(){
      return {}
    },
    components: {
      GroupFilter
    }
  }
</script>

<style lang="less">

</style>
