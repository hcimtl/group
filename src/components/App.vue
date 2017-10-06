<template>
  <div id="app" class="ui container">

    <div class="filter-container">
      <form class="ui form">
        <div class="fields">
          <div class="fourteen wide field">
            <div class="two fields">
              <group-filter :data="this.$store.getters.topics" label="topic" icon="tags"></group-filter>
              <group-filter :data="this.$store.getters.institutions" label="institution" icon="home" fulltext="true"></group-filter>
            </div>
          </div>
          <div class="two wide field">
            <label class="label-without-content"></label>
            <button :class="[!extended ? 'basic' : '', 'ui fluid button icon']" @click="toggleExtendedFilter">
              <i class="icon options"></i>
            </button>
          </div>
        </div>
        <transition name="slide">
          <div class="fields" v-show="extended">
            <div class="fourteen wide field">
              <div class="two fields">
                <group-filter :data="this.$store.getters.cantons" label="canton" icon="marker"></group-filter>
                <group-filter :data="this.$store.getters.heads" label="head" icon="user" fulltext="true"></group-filter>
              </div>
            </div>
          </div>
        </transition>

      </form>
    </div>

    <group-map></group-map>
    <group-list></group-list>

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
        extended: false
      }
    },
    methods: {
      toggleExtendedFilter(e){
        e.preventDefault()
        this.extended = !this.extended
      }
    },
    components: {
      GroupFilter, GroupMap, GroupList
    },
    mounted: function(){
      const domain = document.domain.match(/[a-z0-9\-]*.[a-z0-9\-]+$/i)[0]
      document.domain = domain
      const iframe = window.frameElement
      const extra = 150

      if(iframe){
        $(window).on('resize', () => {
          const height = $('#app').height()
          $(window.frameElement).height(height+extra)
        })
      }
      this.eventHub.$on('goToMap', () => {
        const target = iframe ? window.parent.document : document
        const top = iframe ? $(iframe).offset().top : 0
        $(target).scrollTop(top)
      })
    },
    destroyed: function(){
      $(window).off('resize')
      this.eventHub.$off('goToMap')
    },
    updated: function(){
      $(window).trigger('resize')
    }
  }
</script>

<style lang="less">
  .filter-container {
    position: relative;
    z-index: 1000;

    .ui.form {

      .fields {
        .fields {
          margin-bottom: 0;
        }

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
          max-height: 150px;
          overflow: hidden;
        }
        &.slide-enter, &.slide-leave-to  {
          max-height: 0px;
          margin: 0px;
        }
      }
    }


  }
</style>
