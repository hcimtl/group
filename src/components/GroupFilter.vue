<template>
  <div class="eight wide field">
    <label><i v-bind:class="[icon, 'icon']"></i> <span>{{ title }}</span></label>

    <div :class="[isLoading ? 'loading':'', 'ui fluid multiple search selection dropdown']" ref="filter">
      <input type="hidden" ref="input">
      <i class="dropdown icon"></i>
      <div class="text"></div>
      <div class="menu" ref="menu">
        <!--<div v-for="option in options" :key="`${label}.${option.id}`" :class="[option.main ? 'bold' : '', 'item']" :data-value="option.id">
          {{ option.name }}
        </div>-->
      </div>
    </div>

  </div>
</template>

<script>

  import { sortLocale, setHashParams } from './../util.js'

  export default {
    name: 'group-filter',
    props: ['data','label', 'icon'],
    data: function(){
      return {
        watcher: null,
        watcher2: null
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
        const amount = this.amountToShow
        return this.data.sort(sortLocale('name'))
      }
    },

    mounted: function(){
      const opts = {
        fields: { name: "name", value: "id" },
        apiSettings: {
          responseAsync: (opt, callback) => {
            const query = opt.urlData.query.toLowerCase()
            callback({
              results: this.options.filter(o => {
                return o.name.toLowerCase().indexOf(query) !== -1
              })
            })
          },
          cache: false,
          filterRemoteData: true,
          saveRemoteData: false
        }
      }
      opts.onChange = (value, text, $choice) => {
        setHashParams(this.label, value)
      }
      $(this.$refs.filter).dropdown(opts)

      this.watcher2 = this.$store.watch((state, getters) => { return state[this.label].selected }, value => {
        let oldValue = $(this.$refs.filter).dropdown('get value')
        const newValue = value.map(id => id.toString())

        oldValue = oldValue ? oldValue.split(',').map(id => id.toString()) : []

        const toAdd = newValue.filter((i) => { return oldValue.indexOf(i) == -1 })
        const toRemove = oldValue.filter((i) => { return newValue.indexOf(i) == -1 })

        if(oldValue != newValue){
          toRemove.forEach((i) => {
            $(this.$refs.filter).dropdown('remove selected', i)
          })
          toAdd.forEach((i) => {
            $(this.$refs.filter).dropdown('set selected', i)
          })
        }
      })

      this.watcher = this.$store.watch((state, getters) => { return state.language.terms }, value => {
        this.refreshFilter()
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
  .ui.dropdown .menu>.item.bold {
    font-weight: 900;
  }
</style>
