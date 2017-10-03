<template>
  <div id="app" class="ui container">
    <div class="filter-container">
      <form class="ui form">
        <div class="two fields">
          <group-filter :data="this.$store.getters.topics" label="topic" icon="tags"></group-filter>
          <group-filter :data="this.$store.getters.institutions" label="institution" icon="home" fulltext="true"></group-filter>
        </div>
        <div class="two fields">
          <group-filter :data="this.$store.getters.cantons" label="canton" icon="marker"></group-filter>
          <group-filter :data="this.$store.getters.heads" label="head" icon="user" fulltext="true"></group-filter>
        </div>
      </form>
    </div>
    <div class="map-container">
      <group-map></group-map>
    </div>
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
      return {}
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
  .map-container {
    position: relative;
    width: 100%;
    padding-bottom: 71.4%;
    z-index: 400;
  }
</style>
