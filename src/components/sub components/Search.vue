<template>
  <input @keypress.enter="alert" class="pl-12 shadow-2xl mt-3 rounded-3xl w-full p-2 bg-lightcl text-sm mb-4"
         placeholder="Search Likey"/>
  <i class="fas fa-search absolute left-0 top-0 mt-7 ml-12 text-sm text-light"></i>
</template>

<script>
export default {
  name: 'Search',
  props: ['alert']
}
</script>
