<template>
  <div class="list-container">
    <div class="ui segment basic vertical right aligned">
      <button @click="exportData" class="ui icon left floated mini compact labeled button small-padding">
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

    <group-list-item v-for="group in groupsShow" :key="group.id" v-bind:group="group"></group-list-item>

    <div v-if="isLoading" class="ui vertical segment basic">
      <div class="ui active centered inline loader small"></div>
    </div>

    <div v-if="numGroups == 0 && !isLoading" class="ui vertical center aligned segment basic very padded">
      <div class="ui compact message">{{term('no_results')}}</div>
    </div>

    <div v-if="numGroups > groupsShow.length" class="ui vertical center aligned segment basic very padded">
      <button class="ui button primary icon centered" @click="showMore()">{{term('show_more')}}</button>
    </div>

  </div>
</template>

<script>
  import GroupListItem from './GroupListItem.vue'
  import { saveAs, sortLocale } from './../util.js'

  export default {
    name: 'group-list',
    components: { GroupListItem },
    props: [],
    data: function(){
      return {
        sort: 'group',
        sort_options: {
          group: 'name',
          institution: 'institution',
          head: { type: 'array', key: ['heads', 0, 'name']}
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
        return this.groups.length
      },
      groups(){
        let groups = this.$store.getters.groupsAvailable;
        const key = this.sort_options[this.sort]
        groups = groups.sort(sortLocale(key))
        return groups
      },
      groupsShow(){
        const groups = this.groups.slice(0, this.amountToShow)
        return groups;
      }
    },
    methods: {
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
      },
      exportData(){
        const groupsLength = this.groups.length
        const table = []
        for(let i = 0; i < groupsLength; i++){
          const group = this.groups[i]
          const row = {
            [this.term('research_group')]: group.name,
            [this.term('head')]: group.heads.map(head => head.name).join(', '),
            [this.term('institution')]: group.institution,
            [this.term('departement')]: group.departement,
            [this.term('institute')]: group.institute,
            [this.term('canton')]: group.canton,
            [this.term('website')]: group.website,
            [this.term('topic')]: group.topics.map(topic => topic.name).join(', ')
          }
          table.push(row)
        }

        const csv = $.csv.fromObjects(table, { separator: ';' })

        const blob = new Blob([`\ufeff${csv}\r\n${this.term('source_message')}`], {type: "text/csv;charset=ANSI"})
        saveAs(blob, `${this.term('export_name')}.csv`);
      }
    },
    mounted: function(){
      this.refreshFilter()
      this.watcher = this.$store.watch((state, getters) => { return state.language.terms }, value => {
        this.refreshFilter()
      })
      this.watcher2 = this.$store.watch((state, getters) => { return getters.groupsAvailable }, value => {
        this.amountToShow = 10
      })
    },
    destroyed: function(){
      this.watcher()
      this.watcher2()
    },
    updated: function(){
      $(window).trigger('resize')
    }
  }
</script>

<style lang="less">
  .list-container {
    position: relative;
    z-index: 900;

    .ui.header {
      margin-top: 0;
    }
    .ui.segment.small-padding {
      padding: 0.25em 0;
    }
  }
</style>
