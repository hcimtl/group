<template>
  <div class="field">
    <label><i v-bind:class="[icon, 'icon']"></i> <span>{{label}}</span></label>

    <div class="ui fluid multiple search selection dropdown" ref="filter">
      <input type="hidden" ref="input">
      <i class="dropdown icon"></i>
      <div class="text"></div>
      <div class="menu">
        <div v-for="option in all" class="item" :data-value="option.value">{{ option.name }}</div>
      </div>
    </div>

    <!--<select class="ui fluid search dropdown" multiple="" v-model="selected" ref="filter">
      <option v-for="option in all" :value="option.value">{{ option.name }}</option>
    </select>-->
  </div>
</template>

<script>
  import './../../node_modules/semantic-ui-css/components/transition.min.js'
  import './../../node_modules/semantic-ui-css/components/dropdown.min.js'

  export default {
    name: 'group-filter',
    props: ['data','label', 'icon', 'update', "fulltext"],
    data: function(){
      return {}
    },
    computed: {
      all(){
        return this.data.all
      }
    },
    mounted: function(){
      const opts = {};
      if(this.fulltext) opts.fullTextSearch = true
      opts.selected
      opts.onChange =  (value, text, $choice) => {
        value = value.split(',')
        this.$store.commit(this.update, { type: 'selected', data: value })
      }

      $(this.$refs.filter).dropdown(opts)
    }
  }
</script>

<style lang="less">

</style>
