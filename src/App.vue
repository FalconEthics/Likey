<template v-cloak>
  <div id="app" class="flex justify-center h-screen bg-[url('../public/bg.jpg')]">
    <Sidenav></Sidenav>
    <Feed></Feed>
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
  }
}
</script>