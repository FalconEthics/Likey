<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/Navigation.svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import SignupModal from '$lib/components/SignupModal.svelte';
	import CreatePostModal from '$lib/components/CreatePostModal.svelte';
	import ProfileSetup from '$lib/components/ProfileSetup.svelte';
	import { initializeAuth } from '$lib/auth.js';
	import { showLogin, showSignup, showCreatePost, loading, user } from '$lib/stores.js';
	import { supabase } from '$lib/supabase.js';
	
	// Check if user is authenticated but has no profile
	let needsProfileSetup = $state(false);
	
	$effect(() => {
		// Check auth state and profile state
		checkProfileSetup();
	});
	
	async function checkProfileSetup() {
		const { data } = await supabase.auth.getUser();
		if (data.user && !$user) {
			// Check if profile actually exists in database
			try {
				const { data: profile, error } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', data.user.id)
					.single();
				
				if (profile && !error) {
					// Profile exists, update user store and hide modal
					user.set(profile);
					needsProfileSetup = false;
				} else {
					// No profile found, show setup modal
					needsProfileSetup = true;
				}
			} catch (err) {
				// Error checking profile, show setup modal
				needsProfileSetup = true;
			}
		} else {
			needsProfileSetup = false;
		}
	}

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

{#if needsProfileSetup}
	<ProfileSetup />
{/if}
