<template>
  <div class="w-full shadow-2xl rounded-3xl bg-white bg-opacity-60 my-4">
    <div class=" p-3">
      <p class="text-lg font-bold">Who to Follow</p>
    </div>
    <button @click="alert" v-for="friend in friends"
            class="w-full flex hover:bg-lighter p-3 border-t border-lighter">
      <img :src="`${friend.src}`" class="w-12 h-12 rounded-full border border-lighter"/>
      <div class="hidden lg:block md:block ml-4">
        <p class="lg:text-sm text-xs font-bold leading-tight"> {{ friend.name }} </p>
        <p class="lg:text-sm text-xs leading-tight"> {{ friend.handle }} </p>
      </div>
      <button @click="clk" class="ml-auto text-sm text-color py-1 px-4 rounded-full border-2 border-color">
        <p class="text-xs lg:text-sm">{{ msg }}</p>
      </button>
    </button>
    <button @click="alert" class="p-3 w-full hover:bg-lighter text-left text-color border-t border-lighter">
      Show More
    </button>
  </div>
</template>

<script>
export default {
  name: 'People',
  props: ['alert'],
  data() {
    return {
      friends: [
        {
          src: 'https://avatars.dicebear.com/api/personas/' + 17 + '.svg',
          name: 'Priyanka Chop',
          handle: '@HollyoodWali'
        },
        {src: 'https://avatars.dicebear.com/api/personas/' + 18 + '.svg', name: 'Deepika Pad', handle: '@deepubolly'},
        {src: 'https://avatars.dicebear.com/api/personas/' + 19 + '.svg', name: 'Salma Kha', handle: '@sallubhai'}
      ],
      msg: 'Follow'
    }
  },
  methods: {
    clk() {
      this.msg = 'Following';
    }
  }
}
</script>