<template>
  <div class="list-container">
    <div class="ui segment basic vertical right aligned">
      <button class="ui icon left floated tiny compact labeled button small-padding">
        <i class="icon download"></i>{{ term('export') }} (CSV)
      </button>
      <div class="ui label">
        <i class="icon users"></i> {{ numGroups }}
      </div>
    </div>
    <div class="ui vertical segment clearing right aligned small-padding">
      <span>{{ term('sort_by') }} </span>
      <div class="ui inline dropdown" ref="filter">
        <div class="text"></div>
        <div class="menu"></div>
        <i class="dropdown icon"></i>
      </div>
    </div>

    <div v-for="group in groups" class="ui vertical segment">
      <h4 class="ui header">
        <a target="_blank" :href="group.website">{{ group.name }}</a>
        <button class="ui right floated icon tiny primary button" @click="locate(group.id)">
          <i class="icon marker"></i>
        </button>
        <div class="sub header">
          {{group.heads.join(', ')}}
        </div>
      </h4>
      <div class="description">
        <p>
          <span><strong>{{group.institution}}</strong></span><br>
          <span v-if="group.institution != group.departement">{{group.departement}}</span><br>
          <span v-if="group.institution != group.institute && group.departement !== group.institute">{{group.institute}}</span><br>
        </p>
        <div class="ui labels">
          <div class="ui black tiny label">{{group.mainTopic}}</div>
          <div class="ui basic tiny label" v-for="topic in group.topics">{{topic}}</div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="ui vertical segment basic">
      <div class="ui active centered inline loader small"></div>
    </div>

    <div v-if="numGroups == 0 && !isLoading" class="ui vertical center aligned segment basic very padded">
      <div class="ui compact message">No group matching your criteria!</div>
    </div>

    <div v-if="numGroups > groups.length" class="ui vertical center aligned segment basic very padded">
      <button class="ui button primary centered" @click="showMore()">{{term('show_more')}}</button>
    </div>

  </div>
</template>

<script>
  export default {
    name: 'group-list',
    props: [],
    data: function(){
      return {
        sort: 'group',
        sort_options: {
          group: 'name',
          institution: 'institution',
          head: 'heads'
        },
        amountToShow: 10,
        watcher: null,
        watcher2: null
      }
    },
    computed: {
      isLoading(){
        return this.$store.state.group.list.length == 0
      },
      numGroups(){
        return this.$store.getters.groupsForList.length
      },
      groups(){
        let groups = this.$store.getters.groupsForList;
        const key = this.sort_options[this.sort]
        groups = groups.sort((a,b) => {
          if(a[key] instanceof Array) {
            return a[key][0].localeCompare(b[key][0])
          } else {
            return a[key].localeCompare(b[key])
          }
        })
        return groups.slice(0, this.amountToShow)
      }
    },
    methods: {
      locate(id){
        this.eventHub.$emit('locate', id)
      },
      term(term){
        return this.$store.getters.term(term)
      },
      sortBy(term){
        this.sort = term
      },
      showMore(){
        this.amountToShow += 10
      },
      refreshFilter(){
        const values = []
        for(let option in this.sort_options){
          const opt = this.sort_options[option]
          const value = {}
          value.name = this.term(option)
          value.value = option
          if(option == this.sort) value.selected = true
          values.push(value)
        }

        $(this.$refs.filter).dropdown({
          values: values,
          onChange: (value) => {
            this.sort = value
          }
        })
      }
    },
    mounted: function(){
      this.refreshFilter()
      this.watcher = this.$store.watch((state, getters) => { return state.language.terms }, value => {
        this.refreshFilter()
      })
      this.watcher2 = this.$store.watch((state, getters) => { return getters.groupsForList }, value => {
        this.amountToShow = 10
      })
    },
    destroyed: function(){
      this.watcher()
      this.watcher2()
    }
  }
</script>

<style lang="less">
  .list-container {
    .ui.header {
      margin-top: 0;
    }
    .ui.segment.small-padding {
      padding: 0.25em 0;
    }
  }
</style>
