<template>
  <div class="md:-ml-5 lg:m-2 md:mr-2 ">
    <button class="pl-4 lg:pl-5 mb-4 h-12 w-12 hover:bg-lightcolor text-4xl rounded-full text-color">
      <i class="fa-regular fa-thumbs-up"></i>
    </button>
    <div class="shadow-2xl rounded-3xl mb-7 lg:p-6 bg-white bg-opacity-60 ">
      <button @click="alert" v-for="tab in tabs"
              :class="`focus:outline-none hover:text-color flex items-center py-2 px-4 hover:bg-lightcl rounded-full mr-auto mb-3 md:pl-6 ${id === tab.id ? 'text-color' : ''}`">
        <i :class="`${tab.icon} text-2xl text-left`"></i>
        <p class="text-lg font-semibold text-left hidden lg:block ml-5"> {{ tab.title }} </p>
      </button>
    </div>
    <button
        class="shadow-2xl text-white bg-color rounded-full font-semibold focus:outline-none w-12 h-12 lg:h-30 lg:w-full md:ml-2 ml-1 lg:ml-0 hover:bg-darkcolor">
      <p class="hidden lg:block">Tweet</p>
      <i class="fas fa-plus lg:hidden"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Menu',
  data() {
    return {
      // object to hold icons, title and id of menu bar for "v-for" rendering
      tabs: [
        {icon: 'fas fa-home', title: 'Home', id: 'home'},
        {icon: 'fas fa-hashtag', title: 'Explore', id: 'explore'},
        {icon: 'far fa-bell', title: 'Notifications', id: 'notifications'},
        {icon: 'far fa-envelope', title: 'Messages', id: 'messages'},
        {icon: 'far fa-bookmark', title: 'Bookmarks', id: 'bookmarks'},
        {icon: 'fas fa-clipboard-list', title: 'Lists', id: 'lists'},
        {icon: 'far fa-user', title: 'Profile', id: 'profile'},
        {icon: 'fas fa-ellipsis-h', title: 'More', id: 'more'}
      ],
      id: 'home',
    }
  },
  methods: {
    // for all the buttons or UI features that are not yet developed and can't respond to clicks
    alert() {
      alert('Feature under-development')
    }
  }
}
</script>