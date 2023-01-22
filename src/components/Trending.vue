<template>
  <div
      class="md:block hidden w-1/3 h-full border-l border-lighter py-2 px-8 lg:pl-7 md:pl-5 overflow-y-scroll relative lg:pr-8 md:pr-0">
    <!-- Search bar -->
    <Search :alert="alert"/>
    <!-- Follow recommendation section -->
    <People :alert="alert"/>
    <!-- Trending section -->
    <Topics :alert="alert"/>
  </div>
</template>

<script>
import People from "././sub components/People.vue";
import Topics from "././sub components/Topics.vue";
import Search from "././sub components/Search.vue";

export default {
  name: 'Trending',
  components: {People, Topics, Search},
  methods: {
    // for all the buttons or UI features that are not yet developed and can't respond to clicks
    alert() {
      alert('Feature under-development')
    }
  }
}
</script>