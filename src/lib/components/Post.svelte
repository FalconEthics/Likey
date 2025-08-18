<script>
	import { createEventDispatcher } from 'svelte';
	import { user } from '../stores.js';
	import { supabase } from '../supabase.js';
	import { formatRelativeTime } from '../utils.js';
	import { createNotification } from '../notifications.js';
	
	// Lucide Icons
	import { Heart, MessageCircle, Share2 } from 'lucide-svelte';
	
	/**
	 * @type {import('../stores.js').Post}
	 */
	const { post } = $props();
	
	const dispatch = createEventDispatcher();
	
	let isLiking = false;
	let showComments = false;
	let newComment = '';
	let comments = [];
	let commentsLoading = false;
	
	/**
	 * Toggle like on post
	 */
	async function toggleLike() {
		if (!$user || isLiking) return;
		
		isLiking = true;
		
		try {
			if (post.liked_by_user) {
				// Unlike
				const { error } = await supabase
					.from('likes')
					.delete()
					.eq('post_id', post.id)
					.eq('user_id', $user.id);
				
				if (error) throw error;
				
				post.liked_by_user = false;
				post.like_count -= 1;
			} else {
				// Like
				const { error } = await supabase
					.from('likes')
					.insert({
						post_id: post.id,
						user_id: $user.id
					});
				
				if (error) throw error;
				
				post.liked_by_user = true;
				post.like_count += 1;
				
				// Create notification for the post owner
				await createNotification(
					post.user_id,
					'like',
					`${$user.display_name} liked your post`,
					$user.id,
					post.id
				);
			}
		} catch (error) {
			console.error('Error toggling like:', error);
		} finally {
			isLiking = false;
		}
	}
	
	/**
	 * Load comments for the post
	 */
	async function loadComments() {
		if (!showComments) {
			showComments = true;
			commentsLoading = true;
			
			try {
				const { data, error } = await supabase
					.from('comments')
					.select(`
						*,
						profiles:user_id (
							username,
							display_name,
							profile_pic_url
						)
					`)
					.eq('post_id', post.id)
					.order('created_at', { ascending: true });
				
				if (error) throw error;
				
				comments = data.map(comment => ({
					...comment,
					user: comment.profiles
				}));
			} catch (error) {
				console.error('Error loading comments:', error);
			} finally {
				commentsLoading = false;
			}
		} else {
			showComments = false;
		}
	}
	
	/**
	 * Add a new comment
	 * @param {Event} event
	 */
	async function addComment(event) {
		event.preventDefault();
		
		if (!$user || !newComment.trim()) return;
		
		try {
			const { data, error } = await supabase
				.from('comments')
				.insert({
					post_id: post.id,
					user_id: $user.id,
					content: newComment.trim()
				})
				.select(`
					*,
					profiles:user_id (
						username,
						display_name,
						profile_pic_url
					)
				`)
				.single();
			
			if (error) throw error;
			
			const commentWithUser = {
				...data,
				user: data.profiles
			};
			
			comments = [...comments, commentWithUser];
			post.comment_count += 1;
			newComment = '';
			
			// Create notification for the post owner
			await createNotification(
				post.user_id,
				'comment',
				`${$user.display_name} commented on your post`,
				$user.id,
				post.id
			);
		} catch (error) {
			console.error('Error adding comment:', error);
		}
	}
</script>

<article class="card bg-base-100 shadow-lg border border-base-300">
	<!-- Post Header -->
	<div class="flex items-center gap-3 p-4 pb-2">
		<a href="/profile/{post.user.username}" class="avatar">
			<div class="w-10 rounded-full">
				{#if post.user.profile_pic_url}
					<img src={post.user.profile_pic_url} alt={post.user.display_name} />
				{:else}
					<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full">
						{post.user.display_name?.charAt(0).toUpperCase() || 'U'}
					</div>
				{/if}
			</div>
		</a>
		
		<div class="flex-1">
			<a href="/profile/{post.user.username}" class="font-semibold hover:underline">
				{post.user.display_name}
			</a>
			<p class="text-sm text-base-content/60">@{post.user.username}</p>
		</div>
		
		<time class="text-sm text-base-content/60" datetime={post.created_at}>
			{formatRelativeTime(post.created_at)}
		</time>
	</div>
	
	<!-- Post Images -->
	{#if post.image_urls && post.image_urls.length > 0}
		<div class="px-4">
			{#if post.image_urls.length === 1}
				<img 
					src={post.image_urls[0]} 
					alt="Post" 
					class="w-full rounded-lg object-cover max-h-96"
					loading="lazy"
				/>
			{:else}
				<div class="carousel w-full rounded-lg">
					{#each post.image_urls as imageUrl, index}
						<div class="carousel-item w-full" id={`post-${post.id}-image-${index}`}>
							<img 
								src={imageUrl} 
								alt="Post {index + 1}" 
								class="w-full object-cover max-h-96"
								loading="lazy"
							/>
						</div>
					{/each}
				</div>
				
				{#if post.image_urls.length > 1}
					<div class="flex justify-center py-2 gap-1">
						{#each post.image_urls as _, index}
							<a href={`#post-${post.id}-image-${index}`} class="btn btn-xs btn-circle">
								{index + 1}
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
	
	<!-- Post Content -->
	{#if post.caption}
		<div class="px-4 py-2">
			<p class="text-sm">{post.caption}</p>
		</div>
	{/if}
	
	<!-- Post Actions -->
	<div class="flex items-center gap-4 px-4 py-3 border-t border-base-300">
		<!-- Like Button -->
		<button 
			class="btn btn-ghost btn-sm gap-2"
			class:text-error={post.liked_by_user}
			onclick={toggleLike}
			disabled={isLiking || !$user}
		>
			<Heart 
				size={20} 
				fill={post.liked_by_user ? 'currentColor' : 'none'}
				class={post.liked_by_user ? 'text-red-500' : ''}
			/>
			{post.like_count}
		</button>
		
		<!-- Comment Button -->
		<button 
			class="btn btn-ghost btn-sm gap-2"
			onclick={loadComments}
			disabled={!$user}
		>
			<MessageCircle size={20} />
			{post.comment_count}
		</button>
		
		<!-- Share Button -->
		<button 
			class="btn btn-ghost btn-sm gap-2"
			onclick={() => {
				if (navigator.share) {
					navigator.share({
						title: 'Check out this post on Likey',
						url: window.location.origin + '/post/' + post.id
					});
				} else {
					navigator.clipboard.writeText(window.location.origin + '/post/' + post.id);
				}
			}}
		>
			<Share2 size={20} />
		</button>
	</div>
	
	<!-- Comments Section -->
	{#if showComments}
		<div class="border-t border-base-300">
			{#if commentsLoading}
				<div class="flex justify-center py-4">
					<span class="loading loading-spinner loading-sm"></span>
				</div>
			{:else}
				<!-- Existing Comments -->
				{#if comments.length > 0}
					<div class="max-h-64 overflow-y-auto">
						{#each comments as comment}
							<div class="flex gap-3 p-4 border-b border-base-300 last:border-b-0">
								<div class="avatar">
									<div class="w-6 rounded-full">
										{#if comment.user.profile_pic_url}
											<img src={comment.user.profile_pic_url} alt={comment.user.display_name} />
										{:else}
											<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
												{comment.user.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>
								
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<a href="/profile/{comment.user.username}" class="font-semibold text-sm hover:underline">
											{comment.user.display_name}
										</a>
										<time class="text-xs text-base-content/60">
											{formatRelativeTime(comment.created_at)}
										</time>
									</div>
									<p class="text-sm mt-1">{comment.content}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}
				
				<!-- Add Comment Form -->
				{#if $user}
					<form onsubmit={addComment} class="flex gap-3 p-4">
						<div class="avatar">
							<div class="w-6 rounded-full">
								{#if $user.profile_pic_url}
									<img src={$user.profile_pic_url} alt={$user.display_name} />
								{:else}
									<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
										{$user.display_name?.charAt(0).toUpperCase() || 'U'}
									</div>
								{/if}
							</div>
						</div>
						
						<div class="flex-1 flex gap-2">
							<input 
								type="text" 
								placeholder="Add a comment..." 
								class="input input-sm input-bordered flex-1"
								bind:value={newComment}
								required
							/>
							<button type="submit" class="btn btn-primary btn-sm" disabled={!newComment.trim()}>
								Post
							</button>
						</div>
					</form>
				{/if}
			{/if}
		</div>
	{/if}
</article>