<template>
  <div class="lg:w-1/5 border-r border-lighter px-2 lg:px-6 py-2 flex flex-col justify-between">
    <!-- Sidemenu Buttons -->
    <Menu />
    <!-- Proile options -->
    <Profile :username="username" :userid="userid"/>
  </div>
</template>

<script>
import Menu from "././sub components/Menu.vue";
import Profile from "././sub components/Profile.vue";

export default {
  name: 'Sidenav',
  props: ["username", "userid"],
  components: {Profile, Menu}
}
</script>
