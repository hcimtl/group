<template>
  <div id="app" ref="app">

    <div class="filter-container">
      <form class="ui form">
        <div class="fields">
          <div class="fifteen wide field">
            <div class="two fields">
              <group-filter :data="this.$store.getters.topics" label="topic" icon="tags"></group-filter>
              <group-filter :data="this.$store.getters.institutions" label="institution" icon="home"></group-filter>
            </div>
            <transition name="slide">
              <div class="two fields" v-show="extended || forceExtended">
                <group-filter :data="this.$store.getters.cantons" label="canton" icon="marker"></group-filter>
                <group-filter :data="this.$store.getters.heads" label="head" icon="user"></group-filter>
              </div>
            </transition>
          </div>
          <div class="field">
            <label class="label-without-content"></label>
            <button type="button" :class="[!extended ? 'basic' : 'basic black', 'ui fluid button icon']" @click="toggleExtendedFilter">
              <i :class="[extended ? 'close' : 'options', 'icon']"></i>
            </button>
          </div>
        </div>
      </form>
    </div>

    <group-map></group-map>
    <group-list></group-list>

    <div class="ui segment basic" style="text-align: center;">
      <a href="https://creativecommons.org/licenses/by/3.0/ch/" target="_blank">
        <img src="./../assets/cc_logo.svg" style="width: 100px">
      </a>
    </div>

  </div>
</template>

<script>
  import GroupFilter from './GroupFilter.vue'
  import GroupMap from './GroupMap.vue'
  import GroupList from './GroupList.vue'

  export default {
    name: 'app',
    data: function(){
      return {
        extended: true,
        iframeHashUpdater: null,
        languageWatcher: null
      }
    },
    computed: {
      forceExtended(){
        return this.$store.state.canton.selected.length > 0 || this.$store.state.head.selected.length > 0
      }
    },
    methods: {
      toggleExtendedFilter(e){
        e.preventDefault()
        this.extended = !this.extended
      },
      resizeIframe(){
        const extra = 200
        const height = this.$refs.app.clientHeight
        window.frameElement.style.height = (height+extra) + 'px'
      },
      loadHash(){
        this.$store.dispatch('loadHash')
      },
      loadLanguage(){
        this.$store.dispatch('loadLanguage')
      }
    },
    components: {
      GroupFilter, GroupMap, GroupList
    },
    mounted: function(){
      const self = this
      const domain = document.domain.match(/[a-z0-9\-]*.[a-z0-9\-]+$/i)[0]
      document.domain = domain
      const iframe = window.frameElement

      if(iframe){
        window.addEventListener('resize', this.resizeIframe)
        this.eventHub.$on('app-resize', () => {
          this.resizeIframe()
        })

        this.iframeHashUpdater = window.setInterval(() => {
          this.loadHash()
        }, 50)
      } else {
        window.addEventListener('hashchange', this.loadHash)
      }

      this.loadLanguage()
      this.loadHash()

      window.addEventListener('mousemove', function hideOptions(e){
        this.removeEventListener('mousemove', hideOptions)
        setTimeout(() => {
          self.extended = false
        }, 500)
      })

      this.eventHub.$on('goToMap', () => {
        if(iframe) {
          const top = iframe.getBoundingClientRect().top + window.parent.window.pageYOffset
          window.parent.window.scrollTo(0, top)
        } else {
          const top = 0
          window.scrollTo(0, top)
        }
      })

    },
    destroyed: function(){
      const iframe = window.frameElement

      this.eventHub.$off('goToMap')
      this.eventHub.$off('app-resize')

      window.removeEventListener('hashchange', this.loadHash)
      if(iframe) {
        window.removeEventListener('resize', this.resizeIframe)
        window.clearTimeout(this.iframeHashUpdater)
      }
    },
    updated: function(){
      this.eventHub.$emit('app-resize')
    }
  }
</script>

<style lang="less">
  #app {
    position: relative;
    max-width: 900px;
    margin: auto;
    padding: 20px;
  }
  .filter-container {
    position: relative;
    z-index: 1000;

    .ui.form {

      .ui.icon.button {
        padding: 0.763em 0.6875em 0.763em;
      }

      & > .fields {
        margin-bottom: 0;
      }
      .fields {

        .label-without-content {
          &::after {
            content: '\00A0';
          }

          @media only screen and (max-width: 768px) {
            &::after {
              display: none;
            }
          }
        }
        @media only screen and (max-width: 768px) {
          .button {
            margin-bottom: 1em;
          }
        }



        &.slide-enter-active, &.slide-leave-active {
          transition: all 0.35s;
          max-height: 67px;
          overflow: hidden;
        }
        &.slide-enter, &.slide-leave-to  {
          max-height: 0px;
          margin: 0px;
        }

        @media only screen and (max-width: 768px) {
          &.slide-enter-active, &.slide-leave-active {
            transition: all 0.35s;
            max-height: 165px;
            overflow: hidden;
          }
          &.slide-enter, &.slide-leave-to  {
            max-height: 0px;
            margin: 0px;
          }
        }
      }
    }
  }
</style>
