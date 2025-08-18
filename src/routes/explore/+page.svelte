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
	import Post from '$lib/components/Post.svelte';
	import UserCard from '$lib/components/UserCard.svelte';
	
	// Lucide Icons
	import { RefreshCw, Flame, Users, Camera } from 'lucide-svelte';

	let activeTab = 'trending';
	let loading = true;
	let explorePosts = [];

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
		
		// Refresh trending posts calculation
		await refreshTrendingPosts();
		
		// Load all data
		await Promise.all([
			loadTrendingPosts(),
			loadTrendingUsers(),
			loadExplorePosts(),
			$user ? loadRecommendedUsers() : Promise.resolve()
		]);
		
		loading = false;
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

<div class="max-w-6xl mx-auto">
	<!-- Header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-3xl font-bold">Explore</h1>
		<button 
			class="btn btn-outline btn-sm"
			onclick={refreshData}
			disabled={loading}
		>
			{#if loading}
				<span class="loading loading-spinner loading-sm"></span>
			{:else}
				<RefreshCw size={16} />
			{/if}
			Refresh
		</button>
	</div>

	<!-- Tabs -->
	<div class="tabs tabs-bordered mb-6">
		<button 
			class="tab tab-lg gap-2"
			class:tab-active={activeTab === 'trending'}
			onclick={() => switchTab('trending')}
		>
			<Flame size={18} />
			Trending
		</button>
		<button 
			class="tab tab-lg gap-2"
			class:tab-active={activeTab === 'users'}
			onclick={() => switchTab('users')}
		>
			<Users size={18} />
			People
		</button>
		<button 
			class="tab tab-lg gap-2"
			class:tab-active={activeTab === 'latest'}
			onclick={() => switchTab('latest')}
		>
			<Camera size={18} />
			Latest
		</button>
	</div>

	{#if loading}
		<div class="flex justify-center py-12">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<!-- Trending Tab -->
		{#if activeTab === 'trending'}
			<div class="space-y-8">
				<!-- Recommended Users (if logged in) -->
				{#if $user && $recommendedUsers.length > 0}
					<div>
						<h2 class="text-xl font-semibold mb-4">Suggested for you</h2>
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{#each $recommendedUsers as recommendedUser (recommendedUser.id)}
								<UserCard user={recommendedUser} showReason={true} />
							{/each}
						</div>
					</div>
				{/if}

				<!-- Trending Posts -->
				<div>
					<h2 class="text-xl font-semibold mb-4">Trending Posts</h2>
					{#if $trendingPosts.length === 0}
						<div class="text-center py-8">
							<div class="text-4xl mb-4">📈</div>
							<p class="text-base-content/60">No trending posts yet. Check back later!</p>
						</div>
					{:else}
						<!-- Use simple rendering for trending posts (limited quantity) -->
						<div class="space-y-6">
							{#each $trendingPosts as post (post.id)}
								<Post {post} />
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Users Tab -->
		{#if activeTab === 'users'}
			<div class="space-y-8">
				<!-- Recommended Users (if logged in) -->
				{#if $user && $recommendedUsers.length > 0}
					<div>
						<h2 class="text-xl font-semibold mb-4">Recommended for you</h2>
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{#each $recommendedUsers as recommendedUser (recommendedUser.id)}
								<UserCard user={recommendedUser} showReason={true} />
							{/each}
						</div>
					</div>
				{/if}

				<!-- Trending Users -->
				<div>
					<h2 class="text-xl font-semibold mb-4">Popular Users</h2>
					{#if $trendingUsers.length === 0}
						<div class="text-center py-8">
							<div class="text-4xl mb-4">👥</div>
							<p class="text-base-content/60">No users to show yet.</p>
						</div>
					{:else}
						<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
							{#each $trendingUsers as trendingUser (trendingUser.id)}
								<UserCard user={trendingUser} />
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Latest Tab -->
		{#if activeTab === 'latest'}
			<div>
				<h2 class="text-xl font-semibold mb-4">Latest Posts</h2>
				{#if explorePosts.length === 0}
					<div class="text-center py-8">
						<Camera size={48} class="mx-auto mb-4 text-base-content/40" />
						<p class="text-base-content/60">No posts to explore yet.</p>
					</div>
				{:else}
					<!-- Simple rendering for explore posts (manageable quantity) -->
					<div class="space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
						{#each explorePosts as post (post.id)}
							<Post {post} />
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>