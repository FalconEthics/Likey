<script>
	import { onMount } from 'svelte';
	import { user, trendingPosts, recommendedUsers, trendingUsers } from '$lib/stores.js';
	import {
		getTrendingPosts,
		getUserRecommendations,
		getTrendingUsers,
		getExplorePosts,
		refreshTrendingPosts
	} from '$lib/search.js';
	import TrendingSection from '$lib/components/explore/TrendingSection.svelte';
	import PeopleSection from '$lib/components/explore/PeopleSection.svelte';
	import LatestSection from '$lib/components/explore/LatestSection.svelte';

	// Lucide Icons
	import { RefreshCw, Flame, Users, Camera } from 'lucide-svelte';

	let activeTab = $state('trending');
	let loading = $state(true);
	let explorePosts = $state([]);

	/**
	 * Load trending posts
	 */
	async function loadTrendingPosts() {
		const { data, error } = await getTrendingPosts(20);

		if (!error && data) {
			trendingPosts.set(data);
		}
	}

	/**
	 * Load recommended users
	 */
	async function loadRecommendedUsers() {
		if (!$user) return;

		const { data, error } = await getUserRecommendations(10);

		if (!error && data) {
			recommendedUsers.set(data);
		}
	}

	/**
	 * Load trending users
	 */
	async function loadTrendingUsers() {
		const { data, error } = await getTrendingUsers(15);

		if (!error && data) {
			trendingUsers.set(data);
		}
	}

	/**
	 * Load explore posts (recent popular posts)
	 */
	async function loadExplorePosts() {
		const { data, error } = await getExplorePosts(30);

		if (!error && data) {
			explorePosts = data;
		}
	}

	/**
	 * Refresh all data
	 */
	async function refreshData() {
		loading = true;

		try {
			// Refresh trending posts calculation
			await refreshTrendingPosts();

			// Load all data
			await Promise.all([
				loadTrendingPosts(),
				loadTrendingUsers(),
				loadExplorePosts(),
				$user ? loadRecommendedUsers() : Promise.resolve()
			]);
		} catch (error) {
			console.error('Error refreshing explore data:', error);
		} finally {
			loading = false;
		}
	}

	/**
	 * Switch tabs
	 * @param {string} tab
	 */
	function switchTab(tab) {
		activeTab = tab;
	}

	onMount(() => {
		refreshData();
	});
</script>

<svelte:head>
	<title>Explore - Likey</title>
</svelte:head>

<div class="mx-auto max-w-6xl pb-28">
	<!-- Header -->
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Explore</h1>
		<button class="btn btn-outline btn-sm" onclick={refreshData} disabled={loading}>
			{#if loading}
				<span class="loading loading-sm loading-spinner"></span>
			{:else}
				<RefreshCw size={16} />
			{/if}
			Refresh
		</button>
	</div>

	<!-- Tabs -->
	<div class="tabs-bordered mb-6 tabs">
		<button
			class="tab-lg tab gap-2"
			class:tab-active={activeTab === 'trending'}
			onclick={() => switchTab('trending')}
		>
			<Flame size={18} />
			Trending
		</button>
		<button
			class="tab-lg tab gap-2"
			class:tab-active={activeTab === 'users'}
			onclick={() => switchTab('users')}
		>
			<Users size={18} />
			People
		</button>
		<button
			class="tab-lg tab gap-2"
			class:tab-active={activeTab === 'latest'}
			onclick={() => switchTab('latest')}
		>
			<Camera size={18} />
			Latest
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-lg loading-spinner"></span>
		</div>
	{:else}
		<!-- Trending Tab -->
		{#if activeTab === 'trending'}
			<TrendingSection {loading} onRefresh={refreshData} />
		{/if}

		<!-- Users Tab -->
		{#if activeTab === 'users'}
			<PeopleSection {loading} />
		{/if}

		<!-- Latest Tab -->
		{#if activeTab === 'latest'}
			<LatestSection bind:explorePosts {loading} onRefresh={refreshData} />
		{/if}
	{/if}
</div>
