<script>
	import { onMount } from 'svelte';
	import { posts, feedLoading, user } from '../stores.js';
	import { supabase } from '../supabase.js';
	import Post from './Post.svelte';
	
	// Lucide Icons
	import { RefreshCw, Camera } from 'lucide-svelte';
	
	let hasMore = true;
	let page = 0;
	const postsPerPage = 10;
	
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
	
	onMount(() => {
		loadPosts();
		
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="max-w-2xl mx-auto">
	<!-- Feed Header -->
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold">Feed</h1>
		<button 
			class="btn btn-outline btn-sm"
			onclick={() => {
				page = 0;
				hasMore = true;
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