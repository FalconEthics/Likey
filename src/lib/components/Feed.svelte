<script>
	import { onMount } from 'svelte';
	import {
		posts,
		feedLoading,
		user,
		showCreatePost,
		trendingPosts,
		recommendedUsers,
		trendingUsers,
		searchQuery,
		searchResults,
		searchLoading
	} from '../stores.js';
	import { supabase } from '../supabase.js';
	import VirtualizedPostList from './VirtualizedPostList.svelte';
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
	const postsPerPage = 20; // Increased for better virtualization
	let searchTimeout;
	let explorePosts = $state([]);

	/**
	 * Load posts from the database
	 * @param {boolean} append - Whether to append to existing posts or replace
	 */
	async function loadPosts(append = false) {
		// Prevent multiple simultaneous loads
		if ($feedLoading) return;

		feedLoading.set(true);

		try {
			// Get posts with all the data we need for displaying them
			// Using left joins so we get posts even if they have no likes
			const { data, error } = await supabase
				.from('posts')
				.select(
					`
					*,
					profiles:user_id (
						username,
						display_name,
						profile_pic_url
					),
					likes:likes!left (
						user_id
					)
				`
				)
				.order('created_at', { ascending: false }) // Newest first
				.range(page * postsPerPage, (page + 1) * postsPerPage - 1);

			if (error) throw error;

			// Add liked_by_user flag for each post
			const postsWithLikeStatus = data.map((post) => ({
				...post,
				user: post.profiles,
				liked_by_user: post.likes.some((like) => like.user_id === $user?.id)
			}));

			if (append) {
				posts.update((currentPosts) => [...currentPosts, ...postsWithLikeStatus]);
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
	 * Load sidebar data for desktop layout
	 */
	async function loadSidebarData() {
		try {
			await Promise.all([
				getTrendingPosts(5).then((result) => {
					if (!result.error && result.data) {
						trendingPosts.set(result.data);
					}
				}),
				getTrendingUsers(6).then((result) => {
					if (!result.error && result.data) {
						trendingUsers.set(result.data);
					}
				}),
				getExplorePosts(6).then((result) => {
					if (!result.error && result.data) {
						explorePosts = result.data;
					}
				}),
				$user
					? getUserRecommendations(6).then((result) => {
							if (!result.error && result.data) {
								recommendedUsers.set(result.data);
							}
						})
					: Promise.resolve()
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

	/**
	 * Refresh feed data
	 */
	function refreshFeed() {
		page = 0;
		hasMore = true;
		posts.set([]);
		loadPosts();
		loadSidebarData();
	}

	onMount(() => {
		loadPosts();
		loadSidebarData();

		return () => {
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	});
</script>

<!-- Modern Mobile Layout -->
<div class="mx-auto max-w-2xl px-4 pb-28 lg:hidden">
	<!-- Mobile Header -->
	<div
		class="sticky top-16 z-40 -mx-4 mb-6 border-b border-base-300/50 bg-base-100/80 px-4 py-4 backdrop-blur-xl"
	>
		<div class="flex items-center justify-between">
			<div>
				<h1 class="likey-gradient-text text-2xl font-bold">Feed</h1>
				<p class="mt-1 text-sm text-base-content/60">Discover what's happening</p>
			</div>
			<button
				class="btn btn-circle btn-ghost"
				onclick={refreshFeed}
				disabled={$feedLoading}
				title="Refresh feed"
			>
				{#if $feedLoading}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					<RefreshCw size={20} class="text-primary" />
				{/if}
			</button>
		</div>
	</div>

	<!-- Floating Create Post Button -->
	<div class="modern-create-post mb-8">
		<button class="create-post-btn" onclick={() => showCreatePost.set(true)}>
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

	<!-- Mobile Posts -->
	<VirtualizedPostList
		bind:posts={$posts}
		loading={$feedLoading}
		{hasMore}
		emptyStateIcon={Camera}
		emptyStateTitle="Your feed awaits"
		emptyStateDescription="Follow some amazing creators or share your first moment to see posts here!"
		showCreateButton={true}
		showHeader={false}
		onLoadMore={() => loadPosts(true)}
		onCreatePost={() => showCreatePost.set(true)}
		virtualizationThreshold={50}
		containerHeight="600px"
	/>
</div>

<!-- Desktop Layout with Sidebars -->
<div class="hidden lg:grid lg:grid-cols-12 lg:gap-8">
	<!-- Left Sidebar -->
	<div class="col-span-3 space-y-6">
		<!-- Search Section -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="mb-3 flex items-center gap-2 text-lg font-semibold">
					<Search size={18} />
					Search
				</h3>
				<div class="relative">
					<input
						type="text"
						placeholder="Search users..."
						class="input-bordered input input-sm w-full"
						bind:value={$searchQuery}
						oninput={handleSearch}
					/>

					{#if $searchResults.length > 0}
						<div
							class="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-lg"
						>
							{#each $searchResults as result (result.id)}
								<button
									class="flex w-full items-center gap-3 p-3 transition-colors hover:bg-base-200"
									onclick={() => selectSearchResult(result)}
								>
									<div class="avatar">
										<div class="w-6 rounded-full">
											{#if result.profile_pic_url}
												<img src={result.profile_pic_url} alt={result.display_name} />
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-content"
												>
													{result.display_name?.charAt(0).toUpperCase() || 'U'}
												</div>
											{/if}
										</div>
									</div>

									<div class="flex-1 text-left">
										<div class="text-sm font-semibold">{result.display_name}</div>
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
				<h3 class="mb-3 flex items-center gap-2 text-lg font-semibold">
					<Flame size={18} />
					Trending
				</h3>
				{#if $trendingPosts.length === 0}
					<p class="text-sm text-base-content/60">No trending posts yet</p>
				{:else}
					<div class="space-y-3">
						{#each $trendingPosts.slice(0, 3) as post (post.id)}
							<a href="/post/{post.id}" class="group block">
								<div class="flex gap-3">
									{#if post.image_urls && post.image_urls.length > 0}
										<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-base-300">
											<img src={post.image_urls[0]} alt="Post" class="h-full w-full object-cover" />
										</div>
									{/if}
									<div class="min-w-0 flex-1">
										<p
											class="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary"
										>
											{post.content || 'Image post'}
										</p>
										<p class="mt-1 text-xs text-base-content/60">
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
		<!-- Desktop Header -->
		<div
			class=" top-0 z-40 mb-6 rounded-2xl border border-base-300/50 bg-base-100/80 p-6 backdrop-blur-xl"
		>
			<div class="flex items-center justify-between">
				<div>
					<h1 class="likey-gradient-text text-2xl font-bold">Feed</h1>
					<p class="mt-1 text-sm text-base-content/60">Discover what's happening</p>
				</div>
				<button
					class="btn btn-circle btn-ghost"
					onclick={refreshFeed}
					disabled={$feedLoading}
					title="Refresh feed"
				>
					{#if $feedLoading}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						<RefreshCw size={20} class="text-primary" />
					{/if}
				</button>
			</div>
		</div>

		<!-- Desktop Create Post Button -->
		<div class="desktop-create-post mb-8">
			<button class="create-post-btn" onclick={() => showCreatePost.set(true)}>
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

		<!-- Desktop Posts -->
		<VirtualizedPostList
			bind:posts={$posts}
			loading={$feedLoading}
			{hasMore}
			emptyStateIcon={Camera}
			emptyStateTitle="Your feed awaits"
			emptyStateDescription="Follow some amazing creators or share your first moment to see posts here!"
			showCreateButton={true}
			showHeader={false}
			onLoadMore={() => loadPosts(true)}
			onCreatePost={() => showCreatePost.set(true)}
			virtualizationThreshold={50}
			containerHeight="700px"
		/>
	</div>

	<!-- Right Sidebar -->
	<div class="col-span-3 space-y-6">
		<!-- People Section -->
		<div class="card bg-base-200">
			<div class="card-body p-4">
				<h3 class="mb-3 flex items-center gap-2 text-lg font-semibold">
					<Users size={18} />
					People
				</h3>
				{#if $user && $recommendedUsers.length > 0}
					<div class="space-y-3">
						<h4 class="text-sm font-medium text-base-content/80">Suggested for you</h4>
						{#each $recommendedUsers.slice(0, 4) as recommendedUser (recommendedUser.id)}
							<a
								href="/profile/{recommendedUser.username}"
								class="flex items-center gap-3 rounded p-2 transition-colors hover:bg-base-300"
							>
								<div class="avatar">
									<div class="w-8 rounded-full">
										{#if recommendedUser.profile_pic_url}
											<img
												src={recommendedUser.profile_pic_url}
												alt={recommendedUser.display_name}
											/>
										{:else}
											<div
												class="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-content"
											>
												{recommendedUser.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium">{recommendedUser.display_name}</div>
									<div class="truncate text-xs text-base-content/60">
										@{recommendedUser.username}
									</div>
								</div>
							</a>
						{/each}
					</div>
				{/if}

				{#if $trendingUsers.length > 0}
					<div
						class="space-y-3 {$user && $recommendedUsers.length > 0
							? 'mt-4 border-t border-base-300 pt-4'
							: ''}"
					>
						<h4 class="text-sm font-medium text-base-content/80">Popular users</h4>
						{#each $trendingUsers.slice(0, 4) as trendingUser (trendingUser.id)}
							<a
								href="/profile/{trendingUser.username}"
								class="flex items-center gap-3 rounded p-2 transition-colors hover:bg-base-300"
							>
								<div class="avatar">
									<div class="w-8 rounded-full">
										{#if trendingUser.profile_pic_url}
											<img src={trendingUser.profile_pic_url} alt={trendingUser.display_name} />
										{:else}
											<div
												class="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-content"
											>
												{trendingUser.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium">{trendingUser.display_name}</div>
									<div class="truncate text-xs text-base-content/60">@{trendingUser.username}</div>
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
				<h3 class="mb-3 flex items-center gap-2 text-lg font-semibold">
					<Camera size={18} />
					Latest
				</h3>
				{#if explorePosts.length === 0}
					<p class="text-sm text-base-content/60">No latest posts yet</p>
				{:else}
					<div class="space-y-3">
						{#each explorePosts.slice(0, 5) as post (post.id)}
							<a href="/post/{post.id}" class="group block">
								<div class="flex gap-3">
									{#if post.image_urls && post.image_urls.length > 0}
										<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-base-300">
											<img src={post.image_urls[0]} alt="Post" class="h-full w-full object-cover" />
										</div>
									{/if}
									<div class="min-w-0 flex-1">
										<p
											class="line-clamp-2 text-sm font-medium transition-colors group-hover:text-primary"
										>
											{post.content || 'Image post'}
										</p>
										<p class="mt-1 text-xs text-base-content/60">
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
		background: linear-gradient(135deg, hsl(var(--base-100)) 0%, hsl(var(--base-200)) 100%);
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
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(340 70% 65%) 100%);
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
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.1) 0%,
			hsl(340 70% 65% / 0.1) 50%,
			hsl(348 80% 70% / 0.1) 100%
		);
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
		0%,
		100% {
			opacity: 0.3;
			filter: blur(8px);
		}
		50% {
			opacity: 0.6;
			filter: blur(12px);
		}
	}

	/* Enhanced loading states */
	:global(.loading) {
		color: hsl(var(--primary));
	}

	/* Dark theme adjustments */
	[data-theme='dark'] .create-post-btn {
		background: linear-gradient(135deg, hsl(var(--base-200)) 0%, hsl(var(--base-300)) 100%);
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.2),
			0 0 0 1px hsl(var(--base-300) / 0.3);
	}

	[data-theme='dark'] .create-post-btn:hover {
		box-shadow:
			0 8px 30px rgba(0, 0, 0, 0.3),
			0 0 0 2px hsl(var(--primary) / 0.4);
	}

	/* Desktop Create Post Button */
	.desktop-create-post {
		position: relative;
	}

	/* Gradient text effect */
	:global(.likey-gradient-text) {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(340 70% 65%) 100%);
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

	}
</style>
