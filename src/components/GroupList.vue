<template>
  <div class="list-container">
    <div class="ui segment basic vertical right aligned">
      <button @click="exportData" class="ui icon left floated tiny compact labeled button small-padding">
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

    <div v-for="group in groupsShow" :key="group.id" class="ui vertical segment">
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
          <span v-if="group.institution != group.departement">{{group.departement}} <br></span>
          <span v-if="group.institution != group.institute && group.departement !== group.institute">{{group.institute}}<br></span>
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
      <div class="ui compact message">{{term('no_results')}}</div>
    </div>

    <div v-if="numGroups > groupsShow.length" class="ui vertical center aligned segment basic very padded">
      <button class="ui button primary centered" @click="showMore()">{{term('show_more')}}</button>
    </div>

  </div>
</template>

<script>
  import { saveAs, sortLocale } from './../util.js'

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
      },
      exportData(){
        const groupsLength = this.groups.length
        const table = []
        for(let i = 0; i < groupsLength; i++){
          const group = this.groups[i]
          const row = {
            [this.term('research_group')]: group.name,
            [this.term('head')]: group.heads.join(', '),
            [this.term('institution')]: group.institution,
            [this.term('departement')]: group.departement,
            [this.term('institute')]: group.institute,
            [this.term('canton')]: group.canton,
            [this.term('website')]: group.website,
            [this.term('topic')]: `${group.mainTopic}, ${group.topics.join(', ')}`,
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
