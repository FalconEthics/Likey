<template>
  <div v-for="follow in following" :key="follow.id" class="w-full p-4 border-b hover:bg-lightcl flex">
    <div class="flex-none mr-4">
      <!-- profile pic generator from avatar.com -->
      <img :src="`${'https://avatars.dicebear.com/api/personas/' + follow.id + '.svg'}`"
           class="h-9 w-9 lg:h-12 lg:w-12 rounded-full flex-none"/>
    </div>
    <div class="flex-col">
      <div class="flex">
        <div class="w-full">
          <div class="flex items-center w-full">
            <!-- random user generator -->
            <p class="font-semibold"> {{ users[Math.round(Math.random() * 9)].name }} </p>
            <!-- random username generator -->
            <p class="text-xs lg:text-sm text-dark ml-2"> {{
                '@' + users[Math.round(Math.random() *
                    9)].username
              }} </p>
            <!-- random upload time generator -->
            <p class="text-xs lg:text-sm text-dark ml-2"> {{
                Math.ceil(Math.random() * 100) + ' ' +
                this.tm[Math.floor(Math.random() * this.tm.length)]
              }} </p>
            <i class="fas fa-angle-down text-dark ml-auto"></i>
          </div>
          <!-- display posts -->
          <p class="py-2 w-40 md:w-60 lg:w-fit text-sm lg:text-base">
            {{ follow.body }}
          </p>
          <!-- generatos random number of likes, shares and comments -->
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center text-sm text-dark">
              <button @click="clciked(follow.id)"><i class="far fa-comment mr-3"></i></button>
              <p class="mr-3"> 5 </p>
            </div>
            <div class="flex items-center text-sm text-dark">
              <i class="fas fa-retweet mr-3"></i>
              <p class="mr-3"> {{ Math.ceil(Math.random() * 100) }} </p>
            </div>
            <div class="flex items-center text-sm text-dark">
              <i class="fas fa-heart mr-3"></i>
              <p class="mr-3"> {{ Math.ceil(Math.random() * 100) }} </p>
            </div>
            <div class="flex items-center text-sm text-dark">
              <i class="fas fa-share-square mr-3"></i>
            </div>
          </div>
        </div>
      </div>
      <!-- display comments -->
      <div v-if="clickCheck === true && cmttag === follow.id"
           class="w-30 place-items-center pt-4 lg:pl-10 pr-10 pb-4 mt-0 flex" v-for="comment in comments"
           :key="comment.id">
        <!-- display comments of the clicked post only -->
        <div class="flex-none mr-4">
          <img :src="`${'https://avatars.dicebear.com/api/personas/' + comment.id + '.svg'}`"
               class="h-9 w-9 lg:h-12 lg:w-12 rounded-full flex-none"/>
        </div>
        <div>
          <!-- random user info generator -->
          <div class="flex items-center w-full">
            <p class="font-semibold text-xs lg:text-sm"> {{ users[Math.round(Math.random() * 9)].name }}
            </p>
            <p class="text-xs lg:text-sm text-dark ml-2"> {{
                '@' + users[Math.round(Math.random() *
                    9)].username
              }} </p>
            <p class="text-xs lg:text-sm text-dark ml-2"> {{
                Math.ceil(Math.random() * 100) + ' ' +
                this.tm[Math.floor(Math.random() * this.tm.length)]
              }} </p>
            <i class="fas fa-angle-down text-dark ml-auto"></i>
          </div>
          <!-- comments of the respected post -->
          <p class="text-xs lg:text-sm py-2 w-40 md:w-60 lg:w-fit">
            {{ comment.body }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "FriendsPosts",
  data() {
    return {
      following: [],
      users: [],
      tm: ['sec', 'min', 'hr', 'day', 'wk', 'mo', 'yr'],
      comments: [],
      clickCheck: false,
      cmttag: 0,
    }
  },
  methods: {
    getPosts() {
      // console.log('getPosts triggered')
      axios
          .get('https://jsonplaceholder.typicode.com/posts')
          .then(response => {
            this.following = response.data;
          })
          .catch(error => {
            console.log(error);
          });
    },
    getUser() {
      // console.log('getUser triggered')
      axios
          .get('https://jsonplaceholder.typicode.com/users')
          .then(response => {
            this.users = response.data;
          })
          .catch(error => {
            console.log(error);
          });
    },
    getComments(id) {
      // console.log('getComments triggered')
      axios
          .get('https://jsonplaceholder.typicode.com/posts/' + id + '/comments')
          .then(response => {
            this.comments = response.data;
          })
          .catch(error => {
            console.log(error);
          });
      // return this.comments.length;
    },
    clciked(id) {
      // console.log('clciked triggered')
      this.clickCheck = !this.clickCheck;
      this.getComments(id);
      this.cmttag = id;
    }
  },
  beforeMount() {
    this.getPosts();
    this.getUser();
  }

}
</script>