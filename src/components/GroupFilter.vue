<template>
  <div class="eight wide field">
    <label><i v-bind:class="[icon, 'icon']"></i> <span>{{ title }}</span></label>

    <div :class="[isLoading ? 'loading':'', 'ui fluid multiple search selection dropdown']" ref="filter">
      <input type="hidden" ref="input">
      <i class="dropdown icon"></i>
      <div class="text"></div>
      <div class="menu">
        <div v-for="option in options" :key="option.id" :class="[option.main ? 'bold' : '', 'item']" :data-value="option.id">{{ option.name }}</div>
      </div>
    </div>

  </div>
</template>

<script>
  import './../../node_modules/semantic-ui-css/components/transition.min.js'
  import './../../node_modules/semantic-ui-css/components/dropdown.min.js'

  import { sortLocale } from './../util.js'

  export default {
    name: 'group-filter',
    props: ['data','label', 'icon', 'fulltext'],
    data: function(){
      return {
        watcher: null
      }
    },
    methods: {
      refreshFilter(){
        const value = $(this.$refs.filter).dropdown('get value')
        $(this.$refs.filter).dropdown('clear')
        if(value) $(this.$refs.filter).dropdown('set exactly', value.split(','))
      }
    },
    computed: {
      title(){
        return this.$store.getters.term(this.label)
      },
      isLoading(){
        return this.options < 1
      },
      options(){
        return this.data.sort(sortLocale('name'))
      }
    },
    mounted: function(){
      const opts = {};
      if(this.fulltext) opts.fullTextSearch = true
      opts.onChange = (value, text, $choice) => {
        const arr = value ? value.split(',').map((v) => parseInt(v)) : []
        this.$store.commit('setSelected', { list: this.label,  data: arr })
      }
      $(this.$refs.filter).dropdown(opts)

      this.watcher = this.$store.watch((state, getters) => { return state.language.terms }, value => {
        this.refreshFilter()
      })
    },
    destroyed: function(){
      this.watcher()
    },
    updated: function(){
      $(window).trigger('resize')
    }
  }
</script>

<style lang="less">
  .ui.dropdown .menu>.item.bold {
    font-weight: 900;
  }
</style>
