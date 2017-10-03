<template>
  <div class="list-container">
    <div class="ui content">
      {{ term('sort_by') }}: <a @click="sortBy('institution')">{{ term('institution') }}</a> | <a @click="sortBy('group')">{{ term('group') }}</a> | <a @click="sortBy('head')">{{ term('head') }}</a>
    </div>
    <div class="ui divider"></div>
    <div v-for="group in groups" class="ui fluid card">
      <div class="content">
        <div class="right floated icon">
          <button class="ui icon mini primary button">
            <i class="icon location arrow"></i>
          </button>
        </div>
        <div class="header">
          <a target="_blank" :href="group.website.replace('#', '')">{{ group.name }}</a>
        </div>
        <div class="meta">
          {{group.heads.join(', ')}}
        </div>
        <div class="description">
          <p>
            <strong>{{group.institution}}</strong>
          </p>
          <p>
            {{group.departement}}<br>
            {{group.institute}}
          </p>
          <br>
          <div class="ui labels">
            <div class="ui black tiny label">{{group.mainTopic}}</div>
            <div class="ui basic tiny label" v-for="topic in group.topics">{{topic}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'group-list',
    props: [],
    data: function(){
      return {
        sort: 'institution'
      }
    },
    computed: {
      groups(){
        return this.$store.getters.groupsForList.slice(0,10)
      }
    },
    methods: {
      term(term){
        return this.$store.getters.term(term)
      },
      sortBy(term){
        this.sort = term
      }
    }
  }
</script>

<style lang="less">
  .ui.fluid.card {
    border: none;
    border-radius: 0;
    box-shadow: none;
    padding-bottom: 0.9em;
    border-bottom: 1px solid rgba(34,36,38,.15);
  }
</style>
