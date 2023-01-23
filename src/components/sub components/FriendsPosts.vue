<template>
  <div v-for="post in posts" :key="post.id" class="w-full p-4 border-b hover:bg-lightcl flex">
    <div class="flex-none mr-4">
      <!-- profile pic generator from avatar.com -->
      <img :src="`${'https://avatars.dicebear.com/api/personas/' + post.id + '.svg'}`"
           alt="profile icon" class="h-9 w-9 lg:h-12 lg:w-12 rounded-full flex-none"/>
    </div>
    <div class="flex-col">
      <div class="flex">
        <div class="w-full">
          <div class="flex items-center w-full">
            <!-- random user generator -->
            <p class="font-semibold"> {{ usergen(post.id) }} </p>
            <!-- random username generator -->
            <p class="text-xs lg:text-sm text-dark ml-2"> {{ '@' + usernamegen(post.id) }} </p>
            <!-- random upload time generator -->
            <p class="text-xs lg:text-sm text-dark ml-2"> {{ timegen(post.id) }} </p>
            <i class="fas fa-angle-down text-dark ml-auto"></i>
          </div>
          <!-- display posts -->
          <p class="py-2 w-40 md:w-60 lg:w-fit text-sm lg:text-base">
            {{ post.body }}
          </p>
          <!-- generatos random number of likes, shares and comments -->
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center text-sm text-dark">
              <button @click="getComments(post.id)"><i class="far fa-comment mr-3"></i></button>
              <p class="mr-3"> 5 </p>
            </div>
            <div class="flex items-center text-sm text-dark">
              <i class="fas fa-retweet mr-3"></i>
              <p class="mr-3"> {{ sharegen(post.title) }} </p>
            </div>
            <div class="flex items-center text-sm text-dark">
              <i class="fas fa-heart mr-3"></i>
              <p class="mr-3"> {{ likegen(post.body) }} </p>
            </div>
            <div class="flex items-center text-sm text-dark">
              <i class="fas fa-share-square mr-3"></i>
            </div>
          </div>
        </div>
      </div>
      <!-- display comments -->
      <div v-if="clickCheck === true && cmtid === post.id"
           class="w-30 place-items-center pt-4 lg:pl-10 pr-10 pb-4 mt-0 flex" v-for="comment in comments"
           :key="comment.id">
        <!-- display comments of the clicked post only -->
        <div v-cloak class="flex-none mr-4">
          <img :src="`${'https://avatars.dicebear.com/api/personas/' + comment.id + '.svg'}`"
               alt="profile icon" class="h-9 w-9 lg:h-12 lg:w-12 rounded-full flex-none"/>
        </div>
        <div>
          <!-- random user info generator -->
          <div v-cloak class="flex items-center w-full">
            <p class="font-semibold text-xs lg:text-sm"> {{ usergen(comment.id) }}
            </p>
            <p class="text-xs lg:text-sm text-dark ml-2"> {{ '@' + usernamegen(comment.id) }} </p>
            <p class="text-xs lg:text-sm text-dark ml-2"> {{ timegen(comment.id) }} </p>
            <i class="fas fa-angle-down text-dark ml-auto"></i>
          </div>
          <!-- comments of the respected post -->
          <p v-cloak class="text-xs lg:text-sm py-2 w-40 md:w-60 lg:w-fit">
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
      posts: [],
      users: [],
      comments: [],
      time: [],
      clickCheck: false,
      cmtid: 0
    }
  },
  methods: {
    getPosts() {
      // console.log('getPosts triggered')
      axios
          .get('https://jsonplaceholder.typicode.com/posts')
          .then(response => {
            this.posts = response.data;
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
      this.cmtid = id;
      this.clickCheck = !this.clickCheck;
    },
    usergen(id) {
      // console.log('usergen triggered')
      if (id < 10) {
        return this.users[id].name;
      } else if (id > 10 && id < 20) {
        return this.users[id - 10].name;
      } else if (id > 20 && id < 30) {
        return this.users[id - 20].name;
      } else if (id > 30 && id < 40) {
        return this.users[id - 30].name;
      } else if (id > 40 && id < 50) {
        return this.users[id - 40].name;
      } else if (id > 50 && id < 60) {
        return this.users[id - 50].name;
      } else if (id > 60 && id < 70) {
        return this.users[id - 60].name;
      } else if (id > 70 && id < 80) {
        return this.users[id - 70].name;
      } else if (id > 80 && id < 90) {
        return this.users[id - 80].name;
      } else if (id > 90 && id < 100) {
        return this.users[id - 90].name;
      } else if (id > 100) {
        return this.users[id - 90].name;
      } else {
        return this.users[0].name;
      }
    },
    usernamegen(id) {
      // console.log('usernamegen triggered')
      if (id < 10) {
        return this.users[id].name;
      } else if (id > 10 && id < 20) {
        return this.users[id - 10].username;
      } else if (id > 20 && id < 30) {
        return this.users[id - 20].username;
      } else if (id > 30 && id < 40) {
        return this.users[id - 30].username;
      } else if (id > 40 && id < 50) {
        return this.users[id - 40].username;
      } else if (id > 50 && id < 60) {
        return this.users[id - 50].username;
      } else if (id > 60 && id < 70) {
        return this.users[id - 60].username;
      } else if (id > 70 && id < 80) {
        return this.users[id - 70].username;
      } else if (id > 80 && id < 90) {
        return this.users[id - 80].username;
      } else if (id > 90 && id < 100) {
        return this.users[id - 90].username;
      } else if (id > 100) {
        return this.users[id - 90].username;
      } else {
        return this.users[0].name;
      }
    },
    timegen(id) {
      // console.log('timegen triggered')
      return this.time[id] + ' min';
    },
    likegen(content) {
      // console.log('likegen triggered')
      let str = content;
      return str.length;
    },
    sharegen(title) {
      // console.log('sharegen triggered')
      let str = title;
      return str.length;
    }
  },
  beforeMount() {
    this.getPosts();
    this.getUser();
    this.time = Array.from({length: 500}, (_, index) => index + 1);
  }
}
</script>