<script>
	import { onMount } from 'svelte';
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import { posts, feedLoading, user } from '../stores.js';
	import { supabase } from '../supabase.js';
	import Post from './Post.svelte';
	
	// Lucide Icons
	import { RefreshCw, Camera } from 'lucide-svelte';
	
	let hasMore = true;
	let page = 0;
	const postsPerPage = 20; // Increased for better virtualization
	let scrollElement;
	
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
	 * Load more posts when needed
	 */
	async function loadMorePosts() {
		if (hasMore && !$feedLoading) {
			await loadPosts(true);
		}
	}
	
	// Create virtualizer instance with dynamic sizing
	$: virtualizer = createVirtualizer({
		count: $posts.length + (hasMore ? 1 : 0), // +1 for loading indicator
		getScrollElement: () => scrollElement,
		estimateSize: (index) => {
			// Different estimates based on post content
			const post = $posts[index];
			if (!post) return 200; // Loading indicator height
			
			let baseHeight = 200; // Header + actions + padding
			
			// Add height for images
			if (post.image_urls?.length > 0) {
				baseHeight += 400; // Image container height
			}
			
			// Add height for caption
			if (post.caption) {
				const estimatedLines = Math.ceil(post.caption.length / 60);
				baseHeight += estimatedLines * 24; // 24px per line
			}
			
			return baseHeight;
		},
		overscan: 5, // Render 5 extra items outside viewport for smoother scrolling
		measureElement: (element) => {
			// Measure actual element height for accuracy
			return element?.getBoundingClientRect().height;
		},
	});
	
	// Get virtual items - access the store values properly
	$: virtualItems = virtualizer ? $virtualizer.getVirtualItems() : [];
	$: totalSize = virtualizer ? $virtualizer.getTotalSize() : 0;
	
	/**
	 * Handle scroll to load more posts
	 */
	function handleScroll() {
		if (!scrollElement || $feedLoading || !hasMore) return;
		
		const { scrollTop, scrollHeight, clientHeight } = scrollElement;
		const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
		
		// Load more when 80% scrolled
		if (scrollPercentage > 0.8) {
			loadMorePosts();
		}
	}
	
	/**
	 * Refresh feed
	 */
	function refreshFeed() {
		page = 0;
		hasMore = true;
		loadPosts();
	}
	
	onMount(() => {
		loadPosts();
	});
</script>

<div class="max-w-2xl mx-auto">
	<!-- Feed Header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Feed</h1>
		<button 
			class="btn btn-outline btn-sm"
			onclick={refreshFeed}
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
		<!-- Virtualized Container -->
		<div 
			bind:this={scrollElement}
			class="h-[calc(100vh-12rem)] overflow-auto"
			onscroll={handleScroll}
		>
			<!-- Virtual container with total height -->
			<div style="height: {totalSize}px; position: relative;">
				{#each virtualItems as virtualItem (virtualItem.index)}
					{@const index = virtualItem.index}
					{@const post = $posts[index]}
					
					<div
						data-index={virtualItem.index}
						use:$virtualizer.measureElement
						style="
							position: absolute;
							top: 0;
							left: 0;
							width: 100%;
							transform: translateY({virtualItem.start}px);
						"
					>
						{#if post}
							<!-- Render actual post with proper spacing -->
							<div class="pb-6">
								<Post {post} />
							</div>
						{:else if hasMore}
							<!-- Loading indicator for new posts -->
							<div class="flex justify-center py-8">
								<span class="loading loading-spinner loading-md"></span>
								<p class="ml-2 text-base-content/60">Loading more posts...</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
		
		<!-- End of feed indicator -->
		{#if !hasMore && $posts.length > 0}
			<div class="text-center py-8 text-base-content/60">
				You've reached the end of your feed!
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Custom scrollbar styling */
	.overflow-auto {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
	}
	
	.overflow-auto::-webkit-scrollbar {
		width: 6px;
	}
	
	.overflow-auto::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.overflow-auto::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}
	
	.overflow-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(0, 0, 0, 0.3);
	}
</style>