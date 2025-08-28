<script>
	import { createVirtualizer } from '@tanstack/svelte-virtual';
	import Post from './Post.svelte';
	import { Camera, RefreshCw } from 'lucide-svelte';

	// Props using Svelte 5 syntax
	let {
		posts = $bindable([]),
		title = '',
		subtitle = '',
		loading = false,
		hasMore = false,
		emptyStateIcon = Camera,
		emptyStateTitle = 'No posts yet',
		emptyStateDescription = 'Check back later for new content!',
		showCreateButton = false,
		showRefreshButton = false,
		onLoadMore = () => {},
		onRefresh = () => {},
		onCreatePost = () => {},
		virtualizationThreshold = 50,
		estimatedItemSize = 450,
		containerHeight = '600px',
		showHeader = true,
		headerClass = '',
		containerClass = ''
	} = $props();

	// State
	let parentRef = $state();
	let useVirtualization = $state(false);
	let virtualizer = $state();

	// Only virtualize if we have enough posts to justify the overhead
	// Auto height containers can't be virtualized properly
	$effect(() => {
		useVirtualization = posts.length > virtualizationThreshold && containerHeight !== 'auto';
	});

	// Set up TanStack Virtual when we need it
	// Virtualizer handles rendering only visible items for performance
	$effect(() => {
		if (useVirtualization && parentRef && posts.length > virtualizationThreshold) {
			virtualizer = createVirtualizer({
				count: posts.length,
				getScrollElement: () => parentRef,
				estimateSize: () => estimatedItemSize, // Rough guess at post height
				overscan: 10 // Render 10 extra items above/below for smooth scrolling
			});
		} else {
			virtualizer = null;
		}
	});

	// Check if we need to load more when using virtualization
	$effect(() => {
		if (virtualizer && hasMore && onLoadMore) {
			const items = virtualizer.getVirtualItems();
			if (items.length > 0) {
				const lastItem = items[items.length - 1];
				if (lastItem.index >= posts.length - 8 && !loading) {
					onLoadMore();
				}
			}
		}
	});

	// Handle scroll for non-virtualized lists
	function handleScroll() {
		if (!useVirtualization && hasMore && !loading && onLoadMore) {
			const scrollPosition = window.innerHeight + window.scrollY;
			const documentHeight = document.documentElement.offsetHeight;

			if (scrollPosition >= documentHeight - 1000) {
				onLoadMore();
			}
		}
	}

	// Add scroll listener for non-virtualized infinite scroll
	$effect(() => {
		if (!useVirtualization && hasMore && onLoadMore) {
			window.addEventListener('scroll', handleScroll);
			return () => {
				window.removeEventListener('scroll', handleScroll);
			};
		}
	});
</script>

<div class="virtualized-post-list {containerClass}">
	<!-- Header Section -->
	{#if showHeader && (title || showRefreshButton || showCreateButton)}
		<div class="header-section {headerClass}">
			{#if title}
				<div>
					<h1 class="likey-gradient-text text-2xl font-bold">{title}</h1>
					{#if subtitle}
						<p class="mt-1 text-sm text-base-content/60">{subtitle}</p>
					{/if}
				</div>
			{/if}

			<div class="header-actions">
				{#if showCreateButton}
					<button
						class="btn btn-primary btn-sm"
						onclick={onCreatePost}
						title="Create post"
					>
						<RefreshCw size={16} />
						Create
					</button>
				{/if}

				{#if showRefreshButton}
					<button
						class="btn btn-circle btn-ghost"
						onclick={onRefresh}
						disabled={loading}
						title="Refresh"
					>
						{#if loading}
							<span class="loading loading-sm loading-spinner"></span>
						{:else}
							<RefreshCw size={20} class="text-primary" />
						{/if}
					</button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Posts Content -->
	{#if posts.length === 0 && !loading}
		<!-- Empty State -->
		<div class="modern-empty-state">
			<div class="empty-state-content">
				<div class="empty-state-icon">
					<svelte:component this={emptyStateIcon} size={48} />
					<div class="empty-state-glow"></div>
				</div>
				<h3 class="empty-state-title">{emptyStateTitle}</h3>
				<p class="empty-state-description">{emptyStateDescription}</p>
				{#if showCreateButton}
					<div class="empty-state-actions">
						<button class="btn btn-sm btn-primary" onclick={onCreatePost}>
							<RefreshCw size={16} />
							Create your first post
						</button>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		{#if useVirtualization && virtualizer}
			<!-- Virtualized posts for performance -->
			<div
				bind:this={parentRef}
				class="virtual-posts-container"
				style="height: {containerHeight}; overflow-y: auto;"
			>
				<div style="height: {virtualizer.getTotalSize()}px; width: 100%; position: relative;">
					{#each virtualizer.getVirtualItems() as virtualItem (virtualItem.index)}
						<div
							style="position: absolute; top: 0; left: 0; width: 100%; height: {virtualItem.size}px; transform: translateY({virtualItem.start}px);"
						>
							<div class="mb-6">
								<Post post={posts[virtualItem.index]} on:postDeleted />
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Regular list for smaller feeds -->
			<div class="posts-container space-y-6">
				{#each posts as post (post.id)}
					<Post {post} on:postDeleted />
				{/each}
			</div>
		{/if}

		<!-- Loading indicator -->
		{#if loading}
			<div class="flex justify-center py-8">
				<span class="loading loading-md loading-spinner"></span>
			</div>
		{/if}

		<!-- End of feed indicator -->
		{#if !hasMore && posts.length > 0 && !loading}
			<div class="py-8 text-center text-base-content/60">
				You've reached the end!
			</div>
		{/if}
	{/if}
</div>

<style>
	.virtualized-post-list {
		width: 100%;
	}

	.header-section {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		padding: 1rem 0;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Virtual container styling */
	.virtual-posts-container {
		border-radius: 12px;
		background: transparent;
	}

	.virtual-posts-container::-webkit-scrollbar {
		width: 6px;
	}

	.virtual-posts-container::-webkit-scrollbar-track {
		background: hsl(var(--base-200));
		border-radius: 6px;
	}

	.virtual-posts-container::-webkit-scrollbar-thumb {
		background: hsl(var(--base-300));
		border-radius: 6px;
	}

	.virtual-posts-container::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--base-content) / 0.3);
	}

	/* Posts container for non-virtualized lists */
	.posts-container {
		position: relative;
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
		background: linear-gradient(135deg, hsl(var(--base-200)) 0%, hsl(var(--base-300)) 100%);
		border-radius: 24px;
		margin-bottom: 24px;
		color: hsl(var(--base-content) / 0.4);
	}

	.empty-state-glow {
		position: absolute;
		inset: -4px;
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.1) 0%,
			hsl(340 70% 65% / 0.1) 50%,
			hsl(348 80% 70% / 0.1) 100%
		);
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
		background: linear-gradient(135deg, hsl(var(--base-content)) 0%, hsl(var(--primary)) 100%);
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
		0%,
		100% {
			opacity: 0.2;
			filter: blur(8px);
		}
		50% {
			opacity: 0.4;
			filter: blur(12px);
		}
	}

	/* Gradient text effect */
	:global(.likey-gradient-text) {
		background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(340 70% 65%) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Loading states */
	:global(.loading) {
		color: hsl(var(--primary));
	}

	/* Mobile responsiveness */
	@media (max-width: 640px) {
		.header-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.header-actions {
			align-self: flex-end;
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