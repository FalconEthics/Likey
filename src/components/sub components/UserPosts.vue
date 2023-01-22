<template>
  <!-- Create New Post section -->
  <div class="px-5 py-3 border-b-8 border-lighter flex">
    <div class="flex-none">
      <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`"
           class="flex-none w-12 h-12 rounded-full border border-lighter"/>
    </div>
    <form v-on:submit.prevent="addNewTweet" class="w-full px-4 relative">
      <textarea v-model.lazy.trim="thetweet" placeholder="What's up?"
                class="mt-3 pb-3 w-full focus:outline-none bg-color bg-opacity-0"/>
      <div class="flex items-center">
        <i class="text-lg text-color mr-4 far fa-image"></i>
        <i class="text-lg text-color mr-4 fas fa-film"></i>
        <i class="text-lg text-color mr-4 far fa-chart-bar"></i>
        <i class="text-lg text-color mr-4 far fa-smile"></i>
      </div>
      <button type="submit"
              class="h-8 px-5 text-white font-semibold bg-color hover:bg-darkcolor focus:outline-none rounded-full absolute bottom-0 right-0">
        Tweet
      </button>
    </form>
  </div>
  <!-- Displaying tweets created by user -->
  <div class="flex flex-col-reverse">
    <div v-for="tweet in tweets" :key="tweet.id" class="w-full p-4 border-b hover:bg-lightcl flex">
      <div class="flex-none mr-4">
        <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`"
             class="h-9 w-9 rounded-full flex-none lg:h-12 lg:w-12"/>
      </div>
      <div class="w-full">
        <div class="flex items-center w-full">
          <p class="font-semibold"> {{ username }} </p>
          <p class="text-xs lg:text-sm text-dark ml-2"> {{ userid }} </p>
          <p class="text-xs lg:text-sm text-dark ml-2 mr-1"> Just Now </p>
          <button v-if="dropdown == false" @click="dropdown = !dropdown, check(tweet.id)"
                  class="fa-solid fa-bars text-dark ml-auto"></button>
          <!-- Delete user posts -->
          <button v-if="dropdown == true && chk == tweet.id" @click="delTweet(tweet.content)"><i
              class="fa-solid fa-trash text-dark ml-auto pl-5"></i></button>
          <!-- Edit user posts -->
          <button v-if="dropdown == true && chk == tweet.id" @click="edit = !edit"><i
              class="fa-solid fa-pen text-dark ml-auto pl-5"></i></button>
        </div>
        <div v-if="edit == 1 && chk == tweet.id" class="flex items-center">
                        <textarea type="text" v-model="tweet.content" placeholder="{{ tweet.content }}"
                                  class="text-sm lg:text-base w-full outline-1 rounded-lg p-2"/>
          <!-- save changes -->
          <button @click="edit = !edit, dropdown = !dropdown">
            <i class="fa-solid fa-floppy-disk m-auto mx-4 hover:text-color"></i>
          </button>
        </div>
        <!-- display edited twweet -->
        <p v-else class="py-2 text-sm lg:text-base">
          {{ tweet.content }}
        </p>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center text-sm text-dark">
            <i class="far fa-comment mr-3"></i>
            <p> 0 </p>
          </div>
          <div class="flex items-center text-sm text-dark">
            <i class="fas fa-retweet mr-3"></i>
            <p> 0 </p>
          </div>
          <div class="flex items-center text-sm text-dark">
            <i class="fas fa-heart mr-3"></i>
            <p> 1 </p>
          </div>
          <div class="flex items-center text-sm text-dark">
            <i class="fas fa-share-square mr-3"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserPosts",
  props: ["username", "userid"],
  data() {
    return {
      tweets: [
        {content: 'Am Learning Vue guys!', id: 0}
      ],
      thetweet: '',
      dropdown: false,
      edit: false,
      chk: 0
    }
  },
  methods: {
    delTweet(content) {
      // console.log('delTweet triggered')
      for (let i = 0; i < this.tweets.length; i++) {
        if (this.tweets[i].content == content) {
          this.tweets.splice(i, 1);
          this.dropdown = false;
        }
      }

    },
    check(id) {
      // console.log('check triggered')
      this.chk = id;
    }
  },
  computed: {
    addNewTweet() {
      // console.log('addNewTweet triggered')
      let newTweet = {
        content: this.thetweet,
        id: this.tweets.length,
      };
      this.tweets.push(newTweet)
      this.thetweet = '';
    }
  }
}
</script>
