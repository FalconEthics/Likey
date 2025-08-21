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

<!-- Modern Mobile Layout -->
<div class="lg:hidden max-w-2xl mx-auto px-4 pb-28">
	<!-- Modern Header Section -->
	<div class="sticky top-16 z-40 bg-base-100/80 backdrop-blur-xl border-b border-base-300/50 -mx-4 px-4 py-4 mb-6">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-bold likey-gradient-text">Feed</h1>
				<p class="text-sm text-base-content/60 mt-1">Discover what's happening</p>
			</div>
			<button 
				class="btn btn-circle btn-ghost"
				onclick={() => {
					page = 0;
					hasMore = true;
					posts.set([]);
					loadPosts();
				}}
				disabled={$feedLoading}
				title="Refresh feed"
			>
				{#if $feedLoading}
					<span class="loading loading-spinner loading-sm"></span>
				{:else}
					<RefreshCw size={20} class="text-primary" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Floating Create Post Button -->
	<div class="modern-create-post mb-8">
		<button 
			class="create-post-btn"
			onclick={() => showCreatePost.set(true)}
		>
			<div class="create-post-content">
				<div class="create-post-icon">
					<Plus size={24} />
				</div>
				<div class="create-post-text">
					<span class="create-post-title">Share your moment</span>
					<span class="create-post-subtitle">What's on your mind?</span>
				</div>
			</div>
			<div class="create-post-glow"></div>
		</button>
	</div>
	
	<!-- Posts -->
	{#if $posts.length === 0 && !$feedLoading}
		<div class="modern-empty-state">
			<div class="empty-state-content">
				<div class="empty-state-icon">
					<Camera size={48} />
					<div class="empty-state-glow"></div>
				</div>
				<h3 class="empty-state-title">Your feed awaits</h3>
				<p class="empty-state-description">
					Follow some amazing creators or share your first moment to see posts here!
				</p>
				<div class="empty-state-actions">
					<button 
						class="btn btn-primary btn-sm"
						onclick={() => showCreatePost.set(true)}
					>
						<Plus size={16} />
						Create your first post
					</button>
				</div>
			</div>
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
	<div class="col-span-6 pb-24">
		<!-- Modern Header Section -->
		<div class="sticky top-4 z-40 bg-base-100/80 backdrop-blur-xl border border-base-300/50 rounded-2xl p-6 mb-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold likey-gradient-text">Feed</h1>
					<p class="text-sm text-base-content/60 mt-1">Discover what's happening</p>
				</div>
				<button 
					class="btn btn-circle btn-ghost"
					onclick={() => {
						page = 0;
						hasMore = true;
						posts.set([]);
						loadPosts();
						loadSidebarData();
					}}
					disabled={$feedLoading}
					title="Refresh feed"
				>
					{#if $feedLoading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<RefreshCw size={20} class="text-primary" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Desktop Create Post Button -->
		<div class="desktop-create-post mb-8">
			<button 
				class="create-post-btn"
				onclick={() => showCreatePost.set(true)}
			>
				<div class="create-post-content">
					<div class="create-post-icon">
						<Plus size={24} />
					</div>
					<div class="create-post-text">
						<span class="create-post-title">Share your moment</span>
						<span class="create-post-subtitle">What's on your mind?</span>
					</div>
				</div>
				<div class="create-post-glow"></div>
			</button>
		</div>

		<!-- Posts -->
		{#if $posts.length === 0 && !$feedLoading}
			<div class="modern-empty-state">
				<div class="empty-state-content">
					<div class="empty-state-icon">
						<Camera size={48} />
						<div class="empty-state-glow"></div>
					</div>
					<h3 class="empty-state-title">Your feed awaits</h3>
					<p class="empty-state-description">
						Follow some amazing creators or share your first moment to see posts here!
					</p>
					<div class="empty-state-actions">
						<button 
							class="btn btn-primary btn-sm"
							onclick={() => showCreatePost.set(true)}
						>
							<Plus size={16} />
							Create your first post
						</button>
					</div>
				</div>
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

<style>
	/* Modern Create Post Button */
	.modern-create-post {
		position: relative;
	}

	.create-post-btn {
		position: relative;
		width: 100%;
		background: linear-gradient(135deg, 
			hsl(var(--base-100)) 0%, 
			hsl(var(--base-200)) 100%);
		border: 2px solid transparent;
		border-radius: 20px;
		padding: 20px 24px;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		box-shadow: 
			0 4px 20px rgba(0, 0, 0, 0.08),
			0 0 0 1px hsl(var(--base-300) / 0.5);
	}

	.create-post-btn:hover {
		transform: translateY(-2px);
		box-shadow: 
			0 8px 30px rgba(0, 0, 0, 0.12),
			0 0 0 2px hsl(var(--primary) / 0.3);
	}

	.create-post-btn:active {
		transform: translateY(0px);
	}

	.create-post-content {
		display: flex;
		align-items: center;
		gap: 16px;
		position: relative;
		z-index: 2;
	}

	.create-post-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, 
			hsl(var(--primary)) 0%, 
			hsl(340 70% 65%) 100%);
		border-radius: 16px;
		color: white;
		box-shadow: 0 4px 16px hsl(var(--primary) / 0.3);
		transition: all 0.3s ease;
	}

	.create-post-btn:hover .create-post-icon {
		transform: scale(1.05);
		box-shadow: 0 6px 20px hsl(var(--primary) / 0.4);
	}

	.create-post-text {
		display: flex;
		flex-direction: column;
		flex: 1;
		text-align: left;
	}

	.create-post-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: hsl(var(--base-content));
		margin-bottom: 2px;
	}

	.create-post-subtitle {
		font-size: 0.9rem;
		color: hsl(var(--base-content) / 0.6);
		font-weight: 400;
	}

	.create-post-glow {
		position: absolute;
		inset: -2px;
		background: linear-gradient(135deg, 
			hsl(var(--primary) / 0.1) 0%, 
			hsl(340 70% 65% / 0.1) 50%, 
			hsl(348 80% 70% / 0.1) 100%);
		border-radius: 22px;
		opacity: 0;
		filter: blur(8px);
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.create-post-btn:hover .create-post-glow {
		opacity: 1;
		animation: glow-pulse 2s ease-in-out infinite;
	}

	@keyframes glow-pulse {
		0%, 100% { 
			opacity: 0.3;
			filter: blur(8px);
		}
		50% { 
			opacity: 0.6;
			filter: blur(12px);
		}
	}

	/* Modern Posts Container */
	:global(.space-y-6) {
		position: relative;
	}

	/* Enhanced loading states */
	:global(.loading) {
		color: hsl(var(--primary));
	}

	/* Dark theme adjustments */
	[data-theme="dark"] .create-post-btn {
		background: linear-gradient(135deg, 
			hsl(var(--base-200)) 0%, 
			hsl(var(--base-300)) 100%);
		box-shadow: 
			0 4px 20px rgba(0, 0, 0, 0.2),
			0 0 0 1px hsl(var(--base-300) / 0.3);
	}

	[data-theme="dark"] .create-post-btn:hover {
		box-shadow: 
			0 8px 30px rgba(0, 0, 0, 0.3),
			0 0 0 2px hsl(var(--primary) / 0.4);
	}

	/* Modern Empty State */
	.modern-empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		padding: 2rem;
	}

	.empty-state-content {
		text-align: center;
		max-width: 320px;
	}

	.empty-state-icon {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: linear-gradient(135deg, 
			hsl(var(--base-200)) 0%, 
			hsl(var(--base-300)) 100%);
		border-radius: 24px;
		margin-bottom: 24px;
		color: hsl(var(--base-content) / 0.4);
	}

	.empty-state-glow {
		position: absolute;
		inset: -4px;
		background: linear-gradient(135deg, 
			hsl(var(--primary) / 0.1) 0%, 
			hsl(340 70% 65% / 0.1) 50%, 
			hsl(348 80% 70% / 0.1) 100%);
		border-radius: 28px;
		opacity: 0.3;
		filter: blur(8px);
		animation: gentle-glow 3s ease-in-out infinite;
		z-index: -1;
	}

	.empty-state-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--base-content));
		margin-bottom: 12px;
		background: linear-gradient(135deg, 
			hsl(var(--base-content)) 0%, 
			hsl(var(--primary)) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.empty-state-description {
		color: hsl(var(--base-content) / 0.6);
		font-size: 1rem;
		line-height: 1.6;
		margin-bottom: 24px;
	}

	.empty-state-actions {
		display: flex;
		justify-content: center;
	}

	@keyframes gentle-glow {
		0%, 100% { 
			opacity: 0.2;
			filter: blur(8px);
		}
		50% { 
			opacity: 0.4;
			filter: blur(12px);
		}
	}

	/* Desktop Create Post Button */
	.desktop-create-post {
		position: relative;
	}

	/* Gradient text effect */
	:global(.likey-gradient-text) {
		background: linear-gradient(135deg, 
			hsl(var(--primary)) 0%, 
			hsl(340 70% 65%) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.create-post-btn {
			padding: 16px 20px;
		}
		
		.create-post-content {
			gap: 12px;
		}
		
		.create-post-icon {
			width: 44px;
			height: 44px;
		}
		
		.create-post-title {
			font-size: 1rem;
		}
		
		.create-post-subtitle {
			font-size: 0.85rem;
		}

		.empty-state-icon {
			width: 64px;
			height: 64px;
			border-radius: 20px;
		}

		.empty-state-title {
			font-size: 1.25rem;
		}

		.empty-state-description {
			font-size: 0.9rem;
		}
	}
</style>