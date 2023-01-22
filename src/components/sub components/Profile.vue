<template>
  <div class="lg:w-full relative">
    <button @click="dropdown = !dropdown"
            class="flex items-center w-full hover:bg-lightcolor rounded-full p-2 focus:outline-none">
      <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`"
           class="w-10 h-10 rounded-full border border-lighter"/>
      <div class="hidden lg:block ml-4">
        <p class="text-sm font-bold leading-tight"> {{ username }} </p>
        <p class="text-sm leading-tight"> {{ userid }} </p>
      </div>
      <i class="hidden lg:block fas fa-angle-down ml-auto text-lg"></i>
    </button>
    <div v-if="dropdown === true"
         class="absolute bottom-0 left-0 w-64 rounded-lg shadow-md border-lightest bg-white mb-16">
      <button @click="dropdown = false"
              class="flex items-center w-full hover:bg-lightcl p-2 focus:outline-none">
        <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`"
             class="w-10 h-10 rounded-full border border-lighter"/>
        <div class="ml-4">
          <p class="text-sm font-bold leading-tight"> {{ username }} </p>
          <p class="text-sm leading-tight"> {{ userid }} </p>
        </div>
        <i class="fas fa-check ml-auto test-color"></i>
      </button>
      <!-- link to the login/signup page ~ it's ui only for now -->
      <a href="https://likey-extras-falconethics.vercel.app/">
        <button @click="dropdown = false"
                class="w-full text-left hover:bg-lightcl border-t border-lighter p-3 test-sm focus:outline-none">
          Add an existing account
        </button>
      </a>
      <a href="https://likey-extras-falconethics.vercel.app/">
        <button @click="dropdown = false"
                class="w-full text-left hover:bg-lightcl border-t border-lighter p-3 test-sm focus:outline-none">
          Log out {{ userid }}
        </button>
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  props: ["username", "userid"],
  data() {
    return {
      dropdown: false
    }
  }
}
</script>