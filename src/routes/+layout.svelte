<script>
	import { onMount } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/Likey.png';
	import Navigation from '$lib/components/Navigation.svelte';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';
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
		// Check auth state and profile state whenever user store changes
		checkProfileSetup();
	});

	// Also watch the user store specifically
	$effect(() => {
		if ($user) {
			// User profile exists, hide the setup modal
			needsProfileSetup = false;
		}
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
		// Check for OAuth errors in URL parameters before initializing auth
		checkForOAuthErrors();
		initializeAuth();
	});

	function checkForOAuthErrors() {
		// Don't check for errors if we're already on the error page
		if (window.location.pathname === '/error') {
			return;
		}

		const urlParams = new URLSearchParams(window.location.search);
		const hashParams = new URLSearchParams(window.location.hash.substring(1));

		// Check for error parameters in both URL and hash
		const error = urlParams.get('error') || hashParams.get('error');
		const errorDescription =
			urlParams.get('error_description') || hashParams.get('error_description');
		const errorCode = urlParams.get('error_code') || hashParams.get('error_code');

		// If we have an OAuth error, redirect to error page with parameters
		if (error) {
			console.log('OAuth error detected:', { error, errorDescription, errorCode });

			// Build error page URL with all error parameters
			const errorParams = new URLSearchParams();
			if (error) errorParams.set('error', error);
			if (errorDescription) errorParams.set('error_description', errorDescription);
			if (errorCode) errorParams.set('error_code', errorCode);

			// Redirect to error page
			window.location.href = `/error?${errorParams.toString()}`;
			return;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Likey - Share Your Moments</title>
	<meta
		name="description"
		content="A modern social media platform for sharing photos and connecting with friends"
	/>
</svelte:head>

<div class="min-h-screen bg-base-100">
	<Navigation />

	<main class="container mx-auto max-w-6xl px-4 py-6 pb-20 lg:pb-6">
		{#if $loading}
			<div class="flex h-64 items-center justify-center">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{:else}
			{@render children?.()}
		{/if}
	</main>

	{#if $user}
		<BottomNavigation />
	{/if}
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
