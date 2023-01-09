<template>
    <div class="w-full md:w-1/2 h-full overflow-y-scroll shadow-2xl bg-white bg-opacity-75">
        <div class="px-5 py-3 border-b border-lighter flex items-center justify-between">
            <h1 class="text-xl font-bold">Home</h1>
            <i class="far fa-star text-xl text-color"></i>
        </div>
        <!-- Create New Post section -->
        <div class="px-5 py-3 border-b-8 border-lighter flex">
            <div class="flex-none">
                <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`"
                    class="flex-none w-12 h-12 rounded-full border border-lighter" />
            </div>
            <form v-on:submit.prevent="addNewTweet" class="w-full px-4 relative">
                <textarea v-model.lazy.trim="thetweet" placeholder="What's up?"
                    class="mt-3 pb-3 w-full focus:outline-none bg-color bg-opacity-0" />
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
                        class="h-9 w-9 rounded-full flex-none lg:h-12 lg:w-12" />
                </div>
                <div class="w-full">
                    <div class="flex items-center w-full">
                        <p class="font-semibold"> Soumik Das </p>
                        <p class="text-xs lg:text-sm text-dark ml-2"> @SD783370 </p>
                        <p class="text-xs lg:text-sm text-dark ml-2 mr-1"> Just Now </p>
                        <button v-if="dropdown == false" @click="dropdown = !dropdown, check(tweet.id)"
                            class="fas fa-angle-down text-dark ml-auto"></button>
                        <!-- Delete user posts -->
                        <button v-if="dropdown == true && chk == tweet.id" @click="delTweet(tweet.content)"><i
                                class="fa-solid fa-trash text-dark ml-auto pl-5"></i></button>
                        <!-- Edit user posts -->
                        <button v-if="dropdown == true && chk == tweet.id" @click="edit = !edit"><i
                                class="fa-solid fa-pen text-dark ml-auto pl-5"></i></button>
                    </div>
                    <div v-if="edit == 1 && chk == tweet.id" class="flex items-center">
                        <textarea type="text" v-model="tweet.content" placeholder="{{ tweet.content }}"
                            class="text-sm lg:text-base w-full outline-1 rounded-lg p-2" />
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
        <!-- Diplay tweets of others with likes and comments -->
        <div v-for="follow in following" :key="follow.id" class="w-full p-4 border-b hover:bg-lightcl flex">
            <div class="flex-none mr-4">
                <!-- profile pic generator from avatar.com -->
                <img :src="`${'https://avatars.dicebear.com/api/personas/' + follow.id + '.svg'}`"
                    class="h-9 w-9 lg:h-12 lg:w-12 rounded-full flex-none" />
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
                <div v-if="clickCheck == true && cmttag == follow.id"
                    class="w-30 place-items-center pt-4 lg:pl-10 pr-10 pb-4 mt-0 flex" v-for="comment in comments"
                    :key="comment.id">
                    <!-- display comments of the clicked post only -->
                    <div class="flex-none mr-4">
                        <img :src="`${'https://avatars.dicebear.com/api/personas/' + comment.id + '.svg'}`"
                            class="h-9 w-9 lg:h-12 lg:w-12 rounded-full flex-none" />
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
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'Feed',
    data() {
        return {
            following: [],
            users: [],
            tm: ['sec', 'min', 'hr', 'day', 'wk', 'mo', 'yr'],
            comments: [],
            // rangen: Math.round(Math.random() * 10),
            tweets: [
                { content: 'Am Learning Vue guys!', id: 0 }
            ],
            thetweet: '',
            clickCheck: false,
            cmttag: 0,
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
        },
        check(content) {
            // console.log('check triggered')
            this.chk = content;
        }
    },
    beforeMount() {
        this.getPosts();
        this.getUser();
    },
    computed: {
        addNewTweet() {
            // console.log('addNewTweet triggered')
            let newTweet = {
                content: this.thetweet,
                id: this.tweets.length
            };
            this.tweets.push(newTweet)
            this.thetweet = '';
        },

        // the below funtions can be used furthur for better performance and to stop the feed refresh issue that happens every thime we click on the comment button
        //but there are uneven number of users and posts/comments so i had to generate random generators here and there to fill the empty fields and along with that endpoints of dummy api's are not
        //optiized so i can't directly use .id.post and .id.username or .id.post.comments etc. so i had to sned get request to seperate end points each time 

        /* namegen() {
            // console.log('namegen triggered')
            return this.users[Math.round(Math.random() * 9)].name;
        },
        uidgen() {
            // console.log('uidgen triggered')
            return this.users[Math.round(Math.random() * 9)].username;
        },
        timegen() {
            // console.log('timegen triggered')
            this.tm = ['sec', 'min', 'hr', 'day', 'wk', 'mo', 'yr'];
            return this.rangen + ' ' + this.tm[Math.floor(Math.random() * this.tm.length)];
        },
        imggen() {
            // console.log('imggen triggered')
            return 'https://avatars.dicebear.com/api/personas/' + Math.ceil(Math.random() * 60) + '.svg';
        },
        numgen() {
            // console.log('numgen triggered')
            this.rangen = Math.ceil(Math.random() * 100);
            return this.rangen;
        } */
    }
}
</script>