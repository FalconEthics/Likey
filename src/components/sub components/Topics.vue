<template>
  <div class="w-full shadow-2xl rounded-3xl bg-white bg-opacity-60 ">
    <div class="flex items-center justify-between p-3">
      <p class="text-lg font-bold">Trends for You</p>
      <i class="fas fa-cog text-lg text-color"></i>
    </div>
    <button @click="alert" v-for="trend in trending"
            class="w-full flex justify-between hover:bg-lighter p-3 border-t border-lighter">
      <div>
        <p class="text-xs text-left leading-tight text-dark"> {{ trend.top }} </p>
        <p class="font-semibold text-sm text-left leading-tight"> {{ trend.title }} </p>
        <p class="text-left text-sm leading-tight text-dark"> {{ trend.bottom }} </p>
      </div>
      <i class="fas fa-angle-down text-lg text-dark"></i>
    </button>
    <button @click="alert" class="p-3 w-full hover:bg-lighter text-left text-color border-t border-lighter">
      Show More
    </button>
  </div>
</template>

<script>
export default {
  name: 'Topics',
  props: ['alert'],
  data() {
    return {
      // object to hold dummy data of trending and follow recommendation section to use "v-for" rendering - JSONPLACEHOLDER api doesn't provute dubby data for sections like this
      trending: [
        {top: 'Trending in IND', title: 'Mogo', bottom: 'We are proud momo Lovers'},
        {top: 'Music', title: 'Kesariya', bottom: '392K Tweets'},
        {top: 'Movie', title: 'DDLJ', bottom: '40M tweets'},
        {top: 'Trending in AU', title: 'Reihana', bottom: '12k tweets'},
        {top: 'Trending', title: 'Friends', bottom: '25.4M tweets'},
      ]
    }
  }
}
</script>