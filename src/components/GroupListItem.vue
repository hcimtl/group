<template>
  <div class="ui vertical segment">
    <button class="ui right floated icon button mini basic primary" @click="locate(group.id)">
      <i class="icon marker"></i>
    </button>
    <!-- <h4 class="ui header"> -->
      <p>
        <span v-if="group.name"><a target="_blank" :href="group.website">{{ group.name }} <sup><i class="icon external"></i></sup></a><br/></span>
        <span v-for="institution in group.institutions" :key="institution.id" >
          <!-- {{institution.name}} -->
          <a :href="institution.website">{{ institution.name }}<sup><i class="icon external"></i></sup></a>  
        </span>
      </p>
    <!-- </h4> -->
      <!-- <div class="ui labels">
        <div v-for="topic in topics" :key="topic.id" :class="[(topic.id == group.mainTopicId) ? 'bold' : '', 'ui basic label']">
          {{ topic.name }}
        </div>
      </div> -->

    <div class="description">
      <div class="sub header">
        <!-- {{ group.members.map(member => member.name).join(', ') }} -->
        <div v-for="member in group.members">
          <span :class="isMemberSelected(member) ? 'bold' : '' ">
            <a :href="member.website">{{ member.name }}<sup><i class="icon external"></i></sup></a>
            </span>
        ({{getRoles(member,group)}})
        <span class="ui labels">
          <div v-for="topic in getTopics(member.topicIds)" :key="topic.id" :class="[isTopicSelected(topic) ? 'bold' : '', 'ui basic label']"> 
            {{topic[lang]}}
          </div>
        </span>
        <br/>
       </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'group-list-item',
    props: ['group'],
    data: function(){
      return {}
    },
    computed: {
      topics(){
        const terms = this.$store.state.language.terms
        const tops = this.$store.getters.topics
        return this.group.topics.sort((a,b) => { return a.id == this.group.mainTopicId ? -1 : 1 })
      },
      lang(){
        return this.$store.state.language.selected;
      }
    },
    methods: {
      locate(id){
        this.eventHub.$emit('map-locate', id)
      },
      isMemberSelected(member){
        return ( this.$store.state.member.selected.indexOf(member.id) !== -1 )
      },
      isTopicSelected(topic){
        return ( this.$store.state.topic.selected.indexOf(topic.id) !== -1 )
      },
      getTopics(ids){
        let topics = [];
        if(Array.isArray(ids)){
          ids.forEach((id) => {
            topics.push( this.$store.state.topic.data[id])
          })
        }
        return topics;
      },
      getRoles(member,group){
        const roleIds = member.affiliations
        .filter((a) => {
          return a[0] === group.id;
        })[0][1];
        let roles = [];
        roleIds.forEach((roleId) => {
          roles.push(this.$store.getters.roles[roleId-1][this.$store.state.language.selected])
        })
        return roles.join(", ");
      }
    }
  }
</script>
