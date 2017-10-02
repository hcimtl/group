<template>
  <div class="field">
    <label><i v-bind:class="[icon, 'icon']"></i> <span>{{label}}</span></label>

    <div :class="[isLoading ? 'loading':'', 'ui fluid multiple search selection dropdown']" ref="filter">
      <input type="hidden" ref="input">
      <i class="dropdown icon"></i>
      <div class="text"></div>
      <div class="menu">
        <div v-for="option in options" :class="[option.main ? 'bold' : '', 'item']" :data-value="option.id">{{ option.name }}</div>
      </div>
    </div>

  </div>
</template>

<script>
  import './../../node_modules/semantic-ui-css/components/transition.min.js'
  import './../../node_modules/semantic-ui-css/components/dropdown.min.js'

  import { asc } from './../util.js'

  export default {
    name: 'group-filter',
    props: ['data','label', 'icon', 'fulltext'],
    data: function(){
      return {}
    },
    computed: {
      isLoading(){
        return this.data.length < 1
      },
      options(){
        return this.data.sort(asc)
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
    }
  }
</script>

<style lang="less">
  .ui.dropdown .menu>.item.bold {
    font-weight: 900;
  }
</style>
