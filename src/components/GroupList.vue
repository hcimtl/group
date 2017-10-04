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
      {{ term('sort_by') }}
      <div class="ui inline dropdown" ref="filter">
        <div class="text"></div>
        <div class="menu"></div>
        <i class="dropdown icon"></i>
      </div>
    </div>
    <div v-if="numGroups == 0" class="ui vertical segment basic">
      <div class="ui active centered inline loader small"></div>
    </div>

    <div v-for="group in groups" class="ui vertical segment">
      <h3 class="ui header">
        <a target="_blank" :href="group.website">{{ group.name }}</a>
        <button class="ui right floated icon mini primary button" @click="locate(group.id)">
          <i class="icon location arrow"></i>
        </button>
        <div class="sub header">
          {{group.heads.join(', ')}}
        </div>
      </h3>

      <div class="description">
        <p>
          <div>
            <strong>{{group.institution}}</strong>
          </div>
          <div v-if="group.institution != group.departement">
            {{group.departement}}
          </div>
          <div v-if="group.institution != group.institute && group.departement !== group.institute">
            {{group.institute}}
          </div>
        </p>
        <div class="ui labels">
          <div class="ui black tiny label">{{group.mainTopic}}</div>
          <div class="ui basic tiny label" v-for="topic in group.topics">{{topic}}</div>
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
        sort: 'institution',
        sort_options: {
          institution: 'institution',
          group: 'name',
          head: 'heads'
        },
        amountToShow: 10,
        watcher: null
      }
    },
    computed: {
      numGroups(){
        return this.$store.getters.groupsForList.length
      },
      groups(){
        let groups = this.$store.getters.groupsForList;
        const key = this.sort_options[this.sort]
        groups = groups.sort((a,b) => {
          if(a[key] instanceof Array) {
            return a[key][0] < b[key][0] ? -1 : a[key][0] > b[key][0] ? 1 : 0
          } else {
            return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0
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
    },
    destroyed: function(){
      this.watcher()
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
