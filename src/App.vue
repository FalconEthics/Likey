<template v-cloak>
  <div id="app" class="flex justify-center h-screen bg-[url('https://i.postimg.cc/8zDHYjjf/bg.jpg')]">
    <Sidenav :username="username" :userid="userid"></Sidenav>
    <Feed :username="username" :userid="userid"></Feed>
    <Trending></Trending>
  </div>
</template>

<script>
import Sidenav from './components/Sidenav.vue'
import Feed from './components/Feed.vue'
import Trending from './components/Trending.vue'

export default {
  name: 'App',
  components: {
    Sidenav,
    Feed,
    Trending
  },
  data() {
    return{
    username: 'Soumik Das',
    userid: '@SD783370'
  }}
}
</script>