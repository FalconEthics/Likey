<template>
    <div class="lg:w-1/5 border-r border-lighter px-2 lg:px-6 py-2 flex flex-col justify-between">
        <div class="md:-ml-5 lg:m-2 md:mr-2">
            <button class="pl-5 mb-4 h-12 w-12 hover:bg-lightcolor text-4xl rounded-full text-color">
                <i class="fa-regular fa-thumbs-up"></i>
            </button>
            <div class="shadow-2xl rounded-3xl mb-7 lg:p-6">
                <button @click="alert" v-for="tab in tabs"
                    :class="`focus:outline-none hover:text-color flex items-center py-2 px-4 hover:bg-lightcolor rounded-full mr-auto mb-3 md:pl-6 ${id === tab.id ? 'text-color' : ''}`">
                    <i :class="`${tab.icon} text-2xl text-left`"></i>
                    <p class="text-lg font-semibold text-left hidden lg:block ml-5"> {{ tab.title }} </p>
                </button>
            </div>
            <button
                class="shadow-2xl text-white bg-color rounded-full font-semibold focus:outline-none w-12 h-12 lg:h-auto lg:w-full p-3 md:ml-2 lg:ml-0 hover:bg-darkcolor">
                <p class="hidden lg:block">Tweet</p>
                <i class="fas fa-plus lg:hidden"></i>
            </button>
        </div>
        <div class="lg:w-full relative">
            <button @click="dropdown = !dropdown"
                class="flex items-center w-full hover:bg-lightcolor rounded-full p-2 focus:outline-none">
                <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`" class="w-10 h-10 rounded-full border border-lighter" />
                <div class="hidden lg:block ml-4">
                    <p class="text-sm font-bold leading-tight"> Soumik Das </p>
                    <p class="text-sm leading-tight"> @SD783370 </p>
                </div>
                <i class="hidden lg:block fas fa-angle-down ml-auto text-lg"></i>
            </button>
            <div v-if="dropdown === true"
                class="absolute bottom-0 left-0 w-64 rounded-lg shadow-md border-lightest bg-white mb-16">
                <button @click="dropdown = false"
                    class="flex items-center w-full hover:bg-lightest p-2 focus:outline-none">
                    <img :src="`${'https://avatars.dicebear.com/api/personas/' + 100 + '.svg'}`" class="w-10 h-10 rounded-full border border-lighter" />
                    <div class="ml-4">
                        <p class="text-sm font-bold leading-tight"> Soumik Das </p>
                        <p class="text-sm leading-tight"> @SD783370 </p>
                    </div>
                    <i class="fas fa-check ml-auto test-color"></i>
                </button>
                <button @click="dropdown = false"
                    class="w-full text-left hover:bg-lightest border-t border-lighter p-3 test-sm focus:outline-none">
                    Add an existing account
                </button>
                <button @click="dropdown = false"
                    class="w-full text-left hover:bg-lightest border-t border-lighter p-3 test-sm focus:outline-none">
                    Log out @SD783370
                </button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Sidenav',
    data() {
        return {
            tabs: [
                { icon: 'fas fa-home', title: 'Home', id: 'home' },
                { icon: 'fas fa-hashtag', title: 'Explore', id: 'explore' },
                { icon: 'far fa-bell', title: 'Notifications', id: 'notifications' },
                { icon: 'far fa-envelope', title: 'Messages', id: 'messages' },
                { icon: 'far fa-bookmark', title: 'Bookmarks', id: 'bookmarks' },
                { icon: 'fas fa-clipboard-list', title: 'Lists', id: 'lists' },
                { icon: 'far fa-user', title: 'Profile', id: 'profile' },
                { icon: 'fas fa-ellipsis-h', title: 'More', id: 'more' }
            ],
            id: 'home',
            dropdown: false
        }
    },
    methods: {
        alert() {
            alert('Feature under-development')
        }
    }
}
</script>