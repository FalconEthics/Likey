<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import SignupModal from '$lib/components/SignupModal.svelte';
	import CreatePostModal from '$lib/components/CreatePostModal.svelte';
	import { initializeAuth } from '$lib/auth.js';
	import { showLogin, showSignup, showCreatePost, loading } from '$lib/stores.js';

	let { children } = $props();
	
	onMount(() => {
		initializeAuth();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Likey - Share Your Moments</title>
	<meta name="description" content="A modern social media platform for sharing photos and connecting with friends" />
</svelte:head>

<div class="min-h-screen bg-base-100">
	<Navigation />
	
	<main class="container mx-auto px-4 py-6 max-w-6xl">
		{#if $loading}
			<div class="flex items-center justify-center h-64">
				<span class="loading loading-spinner loading-lg"></span>
			</div>
		{:else}
			{@render children?.()}
		{/if}
	</main>
</div>

<!-- Modals -->
{#if $showLogin}
	<LoginModal />
{/if}

{#if $showSignup}
	<SignupModal />
{/if}

{#if $showCreatePost}
	<CreatePostModal />
{/if}
