<template>
  <div id="app" ref="app">
    <div class="filter-container">
      <form class="ui form">
        <div class="fields">
          <div class="sixteen wide field">
            <div class="four fields">
              <div class="two wide field">
                <label>
                  <i class="icon tag"></i>
                  <span>{{term('lang')}}</span>
                </label>
                <div
                  class="ui fluid selection dropdown"
                  id="lang"
                  @focus="setActive()"
                  @blur="setInactive()"
                  @keydown="langKeyNav($event)"
                  tabindex="0"
                >
                  <div class="text" @click="setActive()">{{ term(langOptions[langIndex].label) }}</div>
                  <div :class="[langSelectionActive ? 'active visible':'','menu right']">
                    <div
                      v-for="(option, index) in langOptions"
                      :key="`lang.option.${option.label}`"
                      :class="[option.label == langOptions[langIndex].label ? 'active selected':'', 'item']"
                      @click="language(index)"
                    >{{ term(option.label) }}</div>
                  </div>
                  <i class="dropdown icon"></i>
                </div>
              </div>
              <group-filter :data="this.$store.getters.topics" label="topic" icon="tags"></group-filter>
              <group-filter
                :data="this.$store.getters.institutions"
                label="institution"
                icon="home"
              ></group-filter>
              <group-filter :data="this.$store.getters.members" label="member" icon="user"></group-filter>
            </div>
          </div>
          <div class="field">
            <label class="label-without-content"></label>
          </div>
        </div>
      </form>
    </div>
    
    <group-map></group-map>
    <group-list></group-list>

    <div class="ui segment basic" style="text-align: center;">
      <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank">
        <img src="./../assets/cc_logo.svg" style="width: 100px" />
      </a>
    </div>
  </div>
</template>

<script>
import GroupFilter from "./GroupFilter.vue";
import GroupMap from "./GroupMap.vue";
import GroupList from "./GroupList.vue";

export default {
  name: "app",
  data: function() {
    return {
      extended: true,
      iframeHashUpdater: null,
      languageWatcher: null,
      langIndex: 0,
      langSelectionActive: false,
      langOptions: [
        {
          label: "en",
          lang_key: "en"
        },
        {
          label: "fr",
          lang_key: "fr"
        }
      ]
    };
  },
  computed: {
    forceExtended() {
      return this.$store.state.member.selected.length > 0;
    }
  },
  methods: {
    toggleExtendedFilter(e) {
      e.preventDefault();
      this.extended = !this.extended;
    },
    resizeIframe() {
      const extra = 200;
      const height = this.$refs.app.clientHeight;
      window.frameElement.style.height = height + extra + "px";
    },
    term(term) {
      return this.$store.getters.term(term);
    },
    langKeyNav(e) {
      if (e.which === 38) {
        e.preventDefault();
        if (this.langIndex > 0) this.langIndex--;
      } else if (e.which === 40) {
        e.preventDefault();
        if (this.langIndex < this.langOptions.length - 1) this.langIndex++;
      } else if (e.which === 13 || e.which === 27) {
        e.preventDefault();
        this.setInactive();
      }
    },
    setActive() {
      if (!this.langSelectionActive) this.langSelectionActive = true;
    },
    setInactive() {
      this.langSelectionActive = false;
    },
    language(index) {
      this.langIndex = index;
      this.$store.commit("setLanguage", {
        data: this.langOptions[index].lang_key
      });
      this.setInactive();
    }
  },
  components: {
    GroupFilter,
    GroupMap,
    GroupList
  },
  mounted: function() {
    this.$store.dispatch("loadLanguage");
    this.$store.dispatch("loadHash");

    const tload = this.$store.dispatch("loadTopics");
    const rload = this.$store.dispatch("loadRoles");
    const hload = this.$store.dispatch("loadMembers");
    const iload = this.$store.dispatch("loadInstitutions");

    Promise.all([tload, rload, hload, iload])
      .then(values => {
        this.$store.dispatch("loadGroups");
      })
      .catch(err => {
        console.log(err);
      });

    const self = this;
    const domain = document.domain.match(/[a-z0-9\-]*.[a-z0-9\-]+$/i)[0];
    document.domain = domain;
    const iframe = window.frameElement;

    if (iframe) {
      window.addEventListener("resize", this.resizeIframe);
      this.eventHub.$on("app-resize", () => {
        this.resizeIframe();
      });

      this.iframeHashUpdater = window.setInterval(() => {
        this.$store.dispatch("loadHash");
      }, 50);
    } else {
      window.addEventListener("hashchange", () => {
        this.$store.dispatch("loadHash");
      });
    }

    window.addEventListener("mousemove", function hideOptions(e) {
      this.removeEventListener("mousemove", hideOptions);
      setTimeout(() => {
        self.extended = false;
      }, 500);
    });

    this.eventHub.$on("goToMap", () => {
      if (iframe) {
        const top =
          iframe.getBoundingClientRect().top + window.parent.window.pageYOffset;
        window.parent.window.scrollTo(0, top);
      } else {
        const top = 0;
        window.scrollTo(0, top);
      }
    });
  },
  destroyed: function() {
    const iframe = window.frameElement;

    this.eventHub.$off("goToMap");
    this.eventHub.$off("app-resize");

    window.removeEventListener("hashchange", this.loadHash);
    if (iframe) {
      window.removeEventListener("resize", this.resizeIframe);
      window.clearTimeout(this.iframeHashUpdater);
    }
  },
  updated: function() {
    this.eventHub.$emit("app-resize");
  }
};
</script>


<style lang="less">
#app {
  position: relative;
  max-width: 960px;
  margin: 0.5em;
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
          content: "\00A0";
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

      &.slide-enter-active,
      &.slide-leave-active {
        transition: all 0.35s;
        max-height: 67px;
        overflow: hidden;
      }
      &.slide-enter,
      &.slide-leave-to {
        max-height: 0px;
        margin: 0px;
      }

      @media only screen and (max-width: 768px) {
        &.slide-enter-active,
        &.slide-leave-active {
          transition: all 0.35s;
          max-height: 165px;
          overflow: hidden;
        }
        &.slide-enter,
        &.slide-leave-to {
          max-height: 0px;
          margin: 0px;
        }
      }
    }
  }
}
</style>
