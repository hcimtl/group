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
      <div class="ui inline dropdown" @focus="setActive()" @click="setActive()" @blur="setInactive()" @keydown="sortKeyNav($event)" tabindex="0">
        <div class="text">{{ term(sortOptions[sortIndex].label) }}</div>
        <div :class="[sortSelectionActive ? 'active visible':'','menu left']">
          <div v-for="(option, index) in sortOptions"
            :key="`sort.option.${option.label}`"
            :class="[option.label == sortOptions[sortIndex].label ? 'active selected':'', 'item']"
            @click="sortBy(index)">

            {{ term(option.label) }}

          </div>
        </div>
        <i class="dropdown icon"></i>
      </div>
    </div>

    <group-list-item v-for="group in groupsShow" :key="`group.list.${group.id}`" v-bind:group="group"></group-list-item>

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
  import Papa from 'papaparse'

  export default {
    name: 'group-list',
    components: { GroupListItem },
    props: [],
    data: function(){
      return {
        sortIndex: 0,
        sortSelectionActive: false,
        sortOptions: [
          {
            label: 'group',
            sort_key: 'name',
          },
          {
            label: 'institution',
            sort_key: 'institution',
          },
          {
            label: 'head',
            sort_key: { type: 'array', key: ['heads', 0, 'name']},
          }
        ],
        amountToShow: 10
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
        const key = this.sortOptions[this.sortIndex].sort_key
        groups = groups.sort(sortLocale(key))
        this.amountToShow = 10
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
      sortKeyNav(e){
        e.preventDefault()
        if(e.which === 38) {
          if(this.sortIndex > 0) this.sortIndex--
        } else if(e.which === 40){
          if(this.sortIndex < this.sortOptions.length-1) this.sortIndex++
        } else if(e.which === 13 || e.which === 27){
          this.setInactive()
        }
      },
      setActive(){
        this.sortSelectionActive = true
      },
      setInactive(){
        this.sortSelectionActive = false
      },
      sortBy(index){
        this.sortIndex = index
      },
      showMore(){
        this.amountToShow += 10
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
            [this.term('department')]: group.department,
            [this.term('institute')]: group.institute,
            [this.term('canton')]: group.canton,
            [this.term('website')]: group.website,
            [this.term('topic')]: group.topics.map(topic => topic.name).join(', ')
          }
          table.push(row)
        }

        const csv = Papa.unparse(table, {
          quotes: false,
          delimiter: ";"
        })

        const blob = new Blob([`\ufeff${csv}\r\n${this.term('source_message')}`], {type: "text/csv;charset=ANSI"})
        saveAs(blob, `${this.term('export_name')}.csv`);
      }
    },
    updated: function(){
      this.eventHub.$emit('app-resize')
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
