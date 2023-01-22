<template>
  <div class="w-full md:w-1/2 h-full overflow-y-scroll shadow-2xl bg-white bg-opacity-75">
    <div class="px-5 py-3 border-b border-lighter flex items-center justify-between">
      <h1 class="text-xl font-bold">Home</h1>
      <i class="far fa-star text-xl text-color"></i>
    </div>
    <!--  User Posts Section-->
    <UserPosts :username="username" :userid="userid"/>
    <!-- Diplay tweets of others with likes and comments -->
    <FriendsPosts/>
  </div>
</template>

<script>
import UserPosts from "./sub components/UserPosts.vue";
import FriendsPosts from "././sub components/FriendsPosts.vue";

export default {
  name: 'Feed',
  props: ['username', 'userid'],
  components: {FriendsPosts, UserPosts}
}
</script>
