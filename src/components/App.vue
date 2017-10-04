<template>
  <div id="app" class="ui container">

    <div class="filter-container">
      <form class="ui form">
        <div class="two fields">
          <group-filter :data="this.$store.getters.topics" label="topic" icon="tags"></group-filter>
          <group-filter :data="this.$store.getters.institutions" label="institution" icon="home" fulltext="true"></group-filter>
        </div>
        <button class="ui button basic tiny labeled icon compact" @click="extended = !extended"><i class="icon angle down"></i>Erweiterte Filter</button>
        <div class="two fields" v-if="extended">
          <group-filter :data="this.$store.getters.cantons" label="canton" icon="marker"></group-filter>
          <group-filter :data="this.$store.getters.heads" label="head" icon="user" fulltext="true"></group-filter>
        </div>
      </form>
    </div>

    <group-map></group-map>
    <group-list></group-list>

  </div>
</template>

<script>
  import GroupFilter from './GroupFilter.vue'
  import GroupMap from './GroupMap.vue'
  import GroupList from './GroupList.vue'

  export default {
    name: 'app',
    data: function(){
      return {
        extended: false
      }
    },
    components: {
      GroupFilter, GroupMap, GroupList
    }
  }
</script>

<style lang="less">
  .filter-container {
    position: relative;
    z-index: 1000;
  }
</style>
