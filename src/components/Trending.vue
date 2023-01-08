<template>
    <div
        class="md:block hidden w-1/3 h-full border-l border-lighter py-2 px-8 lg:pl-7 md:pl-5 overflow-y-scroll relative lg:pr-8 md:pr-0">
        <input @keypress.enter="alert" class="pl-12 shadow-2xl mt-3 rounded-3xl w-full p-2 bg-lightcl text-sm mb-4"
            placeholder="Search Likey" />
        <i class="fas fa-search absolute left-0 top-0 mt-7 ml-12 text-sm text-light"></i>
        <div class="w-full shadow-2xl rounded-3xl bg-white bg-opacity-60 my-4">
            <div class=" p-3">
                <p class="text-lg font-bold">Who to Follow</p>
            </div>
            <button @click="alert" v-for="friend in friends"
                class="w-full flex hover:bg-lighter p-3 border-t border-lighter">
                <img :src="`${friend.src}`" class="w-12 h-12 rounded-full border border-lighter" />
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

    </div>
</template>

<script>
export default {
    name: 'Trending',
    nm: 'demo',
    data() {
        return {
            trending: [
                { top: 'Trending in IND', title: 'Mogo', bottom: 'We are proud momo Lovers' },
                { top: 'Music', title: 'Kesariya', bottom: '392K Tweets' },
                { top: 'Movie', title: 'DDLJ', bottom: '40M tweets' },
                { top: 'Trending in AU', title: 'Reihana', bottom: '12k tweets' },
                { top: 'Trending', title: 'Friends', bottom: '25.4M tweets' },
            ],
            friends: [
                { src: 'https://avatars.dicebear.com/api/personas/' + 17 + '.svg', name: 'Priyanka Chop', handle: '@HollyoodWali' },
                { src: 'https://avatars.dicebear.com/api/personas/' + 18 + '.svg', name: 'Deepika Pad', handle: '@deepubolly' },
                { src: 'https://avatars.dicebear.com/api/personas/' + 19 + '.svg', name: 'Salma Kha', handle: '@sallubhai' }
            ],
            msg: 'Follow'
        }
    },
    methods: {
        clk() {
            this.msg = 'Following';
        },
        alert() {
            alert('Feature under-development')
        }
    }
}
</script>