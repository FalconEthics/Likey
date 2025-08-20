<script>
	import { onMount } from 'svelte';
	import { posts, feedLoading, user, showCreatePost, trendingPosts, recommendedUsers, trendingUsers, searchQuery, searchResults, searchLoading } from '../stores.js';
	import { supabase } from '../supabase.js';
	import Post from './Post.svelte';
	import { 
		getTrendingPosts, 
		getUserRecommendations, 
		getTrendingUsers, 
		getExplorePosts,
		searchUsers 
	} from '../search.js';
	import { goto } from '$app/navigation';
	
	// Lucide Icons
	import { RefreshCw, Camera, Plus, Flame, Users, Search } from 'lucide-svelte';
	
	let hasMore = $state(true);
	let page = $state(0);
	const postsPerPage = 10;
	let searchTimeout;
	let explorePosts = $state([]);
	
	/**
	 * Load posts from the database
	 * @param {boolean} append - Whether to append to existing posts or replace
	 */
	async function loadPosts(append = false) {
		if ($feedLoading) return;
		
		feedLoading.set(true);
		
		try {
			const { data, error } = await supabase
				.from('posts')
				.select(`
					*,
					profiles:user_id (
						username,
						display_name,
						profile_pic_url
					),
					likes:likes!left (
						user_id
					)
				`)
				.order('created_at', { ascending: false })
				.range(page * postsPerPage, (page + 1) * postsPerPage - 1);
			
			if (error) throw error;
			
			// Add liked_by_user flag for each post
			const postsWithLikeStatus = data.map(post => ({
				...post,
				user: post.profiles,
				liked_by_user: post.likes.some(like => like.user_id === $user?.id)
			}));
			
			if (append) {
				posts.update(currentPosts => [...currentPosts, ...postsWithLikeStatus]);
			} else {
				posts.set(postsWithLikeStatus);
			}
			
			hasMore = data.length === postsPerPage;
			page += 1;
		} catch (error) {
			console.error('Error loading posts:', error);
		} finally {
			feedLoading.set(false);
		}
	}
	
	/**
	 * Handle infinite scroll
	 */
	function handleScroll() {
		if (hasMore && !$feedLoading) {
			const scrollPosition = window.innerHeight + window.scrollY;
			const documentHeight = document.documentElement.offsetHeight;
			
			if (scrollPosition >= documentHeight - 1000) {
				loadPosts(true);
			}
		}
	}

	/**
	 * Load sidebar data for desktop layout
	 */
	async function loadSidebarData() {
		try {
			await Promise.all([
				getTrendingPosts(5).then(result => {
					if (!result.error && result.data) {
						trendingPosts.set(result.data);
					}
				}),
				getTrendingUsers(6).then(result => {
					if (!result.error && result.data) {
						trendingUsers.set(result.data);
					}
				}),
				getExplorePosts(6).then(result => {
					if (!result.error && result.data) {
						explorePosts = result.data;
					}
				}),
				$user ? getUserRecommendations(6).then(result => {
					if (!result.error && result.data) {
						recommendedUsers.set(result.data);
					}
				}) : Promise.resolve()
			]);
		} catch (error) {
			console.error('Error loading sidebar data:', error);
		}
	}

	/**
	 * Handle search input
	 */
	async function handleSearch() {
		const query = $searchQuery.trim();
		
		if (query.length < 2) {
			searchResults.set([]);
			return;
		}

		searchLoading.set(true);

		// Debounce search
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(async () => {
			const { data, error } = await searchUsers(query, 5);
			
			if (!error && data) {
				searchResults.set(data);
			}
			
			searchLoading.set(false);
		}, 300);
	}

	/**
	 * Navigate to search result
	 * @param {Object} user
	 */
	function selectSearchResult(user) {
		goto(`/profile/${user.username}`);
		searchQuery.set('');
		searchResults.set([]);
	}
	
	onMount(() => {
		loadPosts();
		loadSidebarData();
		
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	});
</script>

<!-- Mobile Layout -->
<div class="lg:hidden max-w-2xl mx-auto">
	<!-- Create Post Button -->
	<div class="mb-6">
		<button 
			class="btn btn-primary w-full"
			onclick={() => showCreatePost.set(true)}
		>
			<Plus size={20} />
			Create Post
		</button>
	</div>
	
	<!-- Feed Header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Feed</h1>
		<button 
			class="btn btn-outline btn-sm"
			onclick={() => {
				page = 0;
				hasMore = true;
				posts.set([]);
				loadPosts();
			}}
			disabled={$feedLoading}
		>
			{#if $feedLoading}
				<span class="loading loading-spinner loading-sm"></span>
			{:else}
				<RefreshCw size={16} />
			{/if}
			Refresh
		</button>
	</div>
	
	<!-- Posts -->
	{#if $posts.length === 0 && !$feedLoading}
		<div class="text-center py-12">
			<Camera size={64} class="mx-auto mb-4 text-base-content/40" />
			<h3 class="text-xl font-semibold mb-2">No posts yet</h3>
			<p class="text-base-content/60 mb-4">Follow some users or create your first post to get started!</p>
		</div>
	{:else}
		<div class="space-y-6">
			{#each $posts as post (post.id)}
				<Post {post} />
			{/each}
		</div>
		
		<!-- Loading indicator -->
		{#if $feedLoading}
			<div class="flex justify-center py-8">
				<span class="loading loading-spinner loading-md"></span>
			</div>
		{/if}
		
		<!-- End of feed indicator -->
		{#if !hasMore && $posts.length > 0}
			<div class="text-center py-8 text-base-content/60">
				You've reached the end of your feed!
			</div>
		{/if}
	{/if}
</div>

<!-- Desktop Layout with Sidebars -->
<div class="hidden lg:grid lg:grid-cols-12 lg:gap-8">
	<!-- Left Sidebar -->
	<div class="col-span-3 space-y-6">
		<!-- Search Section -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
					<Search size={18} />
					Search
				</h3>
				<div class="relative">
					<input 
						type="text" 
						placeholder="Search users..." 
						class="input input-bordered input-sm w-full"
						bind:value={$searchQuery}
						oninput={handleSearch}
					/>
					
					{#if $searchResults.length > 0}
						<div class="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg max-h-60 overflow-y-auto">
							{#each $searchResults as result (result.id)}
								<button 
									class="flex items-center gap-3 w-full p-3 hover:bg-base-200 transition-colors"
									onclick={() => selectSearchResult(result)}
								>
									<div class="avatar">
										<div class="w-6 rounded-full">
											{#if result.profile_pic_url}
												<img src={result.profile_pic_url} alt={result.display_name} />
											{:else}
												<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
													{result.display_name?.charAt(0).toUpperCase() || 'U'}
												</div>
											{/if}
										</div>
									</div>
									
									<div class="flex-1 text-left">
										<div class="font-semibold text-sm">{result.display_name}</div>
										<div class="text-xs text-base-content/60">@{result.username}</div>
									</div>
								</button>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</div>

		<!-- Trending Section -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
					<Flame size={18} />
					Trending
				</h3>
				{#if $trendingPosts.length === 0}
					<p class="text-sm text-base-content/60">No trending posts yet</p>
				{:else}
					<div class="space-y-3">
						{#each $trendingPosts.slice(0, 3) as post (post.id)}
							<a href="/post/{post.id}" class="block group">
								<div class="flex gap-3">
									{#if post.image_urls && post.image_urls.length > 0}
										<div class="w-12 h-12 rounded bg-base-300 flex-shrink-0 overflow-hidden">
											<img src={post.image_urls[0]} alt="Post" class="w-full h-full object-cover" />
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
											{post.content || 'Image post'}
										</p>
										<p class="text-xs text-base-content/60 mt-1">
											by @{post.user?.username}
										</p>
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="col-span-6">
		<!-- Create Post Button -->
		<div class="mb-6">
			<button 
				class="btn btn-primary w-full"
				onclick={() => showCreatePost.set(true)}
			>
				<Plus size={20} />
				Create Post
			</button>
		</div>
		
		<!-- Feed Header -->
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-2xl font-bold">Feed</h1>
			<button 
				class="btn btn-outline btn-sm"
				onclick={() => {
					page = 0;
					hasMore = true;
					posts.set([]);
					loadPosts();
					loadSidebarData();
				}}
				disabled={$feedLoading}
			>
				{#if $feedLoading}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<RefreshCw size={16} />
				{/if}
				Refresh
			</button>
		</div>

		<!-- Posts -->
		{#if $posts.length === 0 && !$feedLoading}
			<div class="text-center py-12">
				<Camera size={64} class="mx-auto mb-4 text-base-content/40" />
				<h3 class="text-xl font-semibold mb-2">No posts yet</h3>
				<p class="text-base-content/60 mb-4">Follow some users or create your first post to get started!</p>
			</div>
		{:else}
			<div class="space-y-6">
				{#each $posts as post (post.id)}
					<Post {post} />
				{/each}
			</div>
			
			<!-- Loading indicator -->
			{#if $feedLoading}
				<div class="flex justify-center py-8">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			{/if}
			
			<!-- End of feed indicator -->
			{#if !hasMore && $posts.length > 0}
				<div class="text-center py-8 text-base-content/60">
					You've reached the end of your feed!
				</div>
			{/if}
		{/if}
	</div>

	<!-- Right Sidebar -->
	<div class="col-span-3 space-y-6">
		<!-- People Section -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
					<Users size={18} />
					People
				</h3>
				{#if $user && $recommendedUsers.length > 0}
					<div class="space-y-3">
						<h4 class="text-sm font-medium text-base-content/80">Suggested for you</h4>
						{#each $recommendedUsers.slice(0, 4) as recommendedUser (recommendedUser.id)}
							<a href="/profile/{recommendedUser.username}" class="flex items-center gap-3 hover:bg-base-300 p-2 rounded transition-colors">
								<div class="avatar">
									<div class="w-8 rounded-full">
										{#if recommendedUser.profile_pic_url}
											<img src={recommendedUser.profile_pic_url} alt={recommendedUser.display_name} />
										{:else}
											<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
												{recommendedUser.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-medium truncate">{recommendedUser.display_name}</div>
									<div class="text-xs text-base-content/60 truncate">@{recommendedUser.username}</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}

				{#if $trendingUsers.length > 0}
					<div class="space-y-3 {$user && $recommendedUsers.length > 0 ? 'mt-4 pt-4 border-t border-base-300' : ''}">
						<h4 class="text-sm font-medium text-base-content/80">Popular users</h4>
						{#each $trendingUsers.slice(0, 4) as trendingUser (trendingUser.id)}
							<a href="/profile/{trendingUser.username}" class="flex items-center gap-3 hover:bg-base-300 p-2 rounded transition-colors">
								<div class="avatar">
									<div class="w-8 rounded-full">
										{#if trendingUser.profile_pic_url}
											<img src={trendingUser.profile_pic_url} alt={trendingUser.display_name} />
										{:else}
											<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
												{trendingUser.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>
								<div class="flex-1 min-w-0">
									<div class="text-sm font-medium truncate">{trendingUser.display_name}</div>
									<div class="text-xs text-base-content/60 truncate">@{trendingUser.username}</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Latest Section -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
					<Camera size={18} />
					Latest
				</h3>
				{#if explorePosts.length === 0}
					<p class="text-sm text-base-content/60">No latest posts yet</p>
				{:else}
					<div class="space-y-3">
						{#each explorePosts.slice(0, 5) as post (post.id)}
							<a href="/post/{post.id}" class="block group">
								<div class="flex gap-3">
									{#if post.image_urls && post.image_urls.length > 0}
										<div class="w-12 h-12 rounded bg-base-300 flex-shrink-0 overflow-hidden">
											<img src={post.image_urls[0]} alt="Post" class="w-full h-full object-cover" />
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
											{post.content || 'Image post'}
										</p>
										<p class="text-xs text-base-content/60 mt-1">
											by @{post.user?.username}
										</p>
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>