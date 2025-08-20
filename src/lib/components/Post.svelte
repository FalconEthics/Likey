<script>
	import { createEventDispatcher } from 'svelte';
	import { user } from '../stores.js';
	import { supabase } from '../supabase.js';
	import { formatRelativeTime } from '../utils.js';
	import { createNotification } from '../notifications.js';
	
	// Lucide Icons
	import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2 } from 'lucide-svelte';
	
	/**
	 * @type {import('../stores.js').Post}
	 */
	const { post } = $props();
	
	const dispatch = createEventDispatcher();
	
	// Local reactive state for post data to avoid prop mutation
	let postData = $state({ ...post });
	let isLiking = $state(false);
	let showComments = $state(false);
	let newComment = $state('');
	let comments = $state([]);
	let commentsLoading = $state(false);
	let showOptions = $state(false);
	let deleting = $state(false);
	
	// Update local state when prop changes
	$effect(() => {
		postData = { ...post };
	});
	
	/**
	 * Toggle like on post
	 */
	async function toggleLike() {
		if (!$user || isLiking) return;
		
		isLiking = true;
		
		try {
			if (postData.liked_by_user) {
				// Unlike
				const { error } = await supabase
					.from('likes')
					.delete()
					.eq('post_id', postData.id)
					.eq('user_id', $user.id);
				
				if (error) throw error;
				
				postData.liked_by_user = false;
				postData.like_count -= 1;
			} else {
				// Like
				const { error } = await supabase
					.from('likes')
					.insert({
						post_id: postData.id,
						user_id: $user.id
					});
				
				if (error) throw error;
				
				postData.liked_by_user = true;
				postData.like_count += 1;
				
				// Create notification for the post owner
				await createNotification(
					postData.user_id,
					'like',
					`${$user.display_name} liked your post`,
					$user.id,
					postData.id
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
					.eq('post_id', postData.id)
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
					post_id: postData.id,
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
			postData.comment_count += 1;
			newComment = '';
			
			// Create notification for the post owner
			await createNotification(
				postData.user_id,
				'comment',
				`${$user.display_name} commented on your post`,
				$user.id,
				postData.id
			);
		} catch (error) {
			console.error('Error adding comment:', error);
		}
	}
	
	/**
	 * Delete post
	 */
	async function deletePost() {
		if (!$user || postData.user_id !== $user.id || deleting) return;
		
		const confirmed = confirm('Are you sure you want to delete this post? This action cannot be undone.');
		if (!confirmed) return;
		
		deleting = true;
		
		try {
			// Delete post from database (this will cascade delete likes, comments, etc.)
			const { error } = await supabase
				.from('posts')
				.delete()
				.eq('id', postData.id)
				.eq('user_id', $user.id); // Extra security check
			
			if (error) throw error;
			
			// Dispatch event to parent components to remove from their local state
			dispatch('postDeleted', { postId: postData.id });
			
		} catch (error) {
			console.error('Error deleting post:', error);
			alert('Failed to delete postData. Please try again.');
		} finally {
			deleting = false;
			showOptions = false;
		}
	}
</script>

<article class="card bg-base-100 shadow-lg border border-base-300">
	<!-- Post Header -->
	<div class="flex items-center gap-3 p-4 pb-2">
		<a href="/profile/{postData.user.username}" class="avatar">
			<div class="w-10 rounded-full">
				{#if postData.user.profile_pic_url}
					<img src={postData.user.profile_pic_url} alt={postData.user.display_name} />
				{:else}
					<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full">
						{postData.user.display_name?.charAt(0).toUpperCase() || 'U'}
					</div>
				{/if}
			</div>
		</a>
		
		<div class="flex-1">
			<a href="/profile/{postData.user.username}" class="font-semibold hover:underline">
				{postData.user.display_name}
			</a>
			<p class="text-sm text-base-content/60">@{postData.user.username}</p>
		</div>
		
		<div class="flex items-center gap-2">
			<time class="text-sm text-base-content/60" datetime={postData.created_at}>
				{formatRelativeTime(postData.created_at)}
			</time>
			
			<!-- Options Menu (only for post owner) -->
			{#if $user && postData.user_id === $user.id}
				<div class="dropdown dropdown-end">
					<button class="btn btn-ghost btn-sm btn-circle" class:loading={deleting}>
						{#if !deleting}
							<MoreHorizontal size={16} />
						{/if}
					</button>
					<ul class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32">
						<li>
							<button 
								onclick={deletePost} 
								class="text-error flex items-center gap-2"
								disabled={deleting}
							>
								<Trash2 size={16} />
								Delete
							</button>
						</li>
					</ul>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Post Images -->
	{#if postData.image_urls && postData.image_urls.length > 0}
		<div class="px-4">
			{#if postData.image_urls.length === 1}
				<img 
					src={postData.image_urls[0]} 
					alt="Post" 
					class="w-full rounded-lg object-cover max-h-96"
					loading="lazy"
				/>
			{:else}
				<div class="carousel w-full rounded-lg">
					{#each postData.image_urls as imageUrl, index}
						<div class="carousel-item w-full" id={`post-${postData.id}-image-${index}`}>
							<img 
								src={imageUrl} 
								alt="Post {index + 1}" 
								class="w-full object-cover max-h-96"
								loading="lazy"
							/>
						</div>
					{/each}
				</div>
				
				{#if postData.image_urls.length > 1}
					<div class="flex justify-center py-2 gap-1">
						{#each postData.image_urls as _, index}
							<a href={`#post-${postData.id}-image-${index}`} class="btn btn-xs btn-circle">
								{index + 1}
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	{/if}
	
	<!-- Post Content -->
	{#if postData.caption}
		<div class="px-4 py-2">
			<p class="text-sm">{postData.caption}</p>
		</div>
	{/if}
	
	<!-- Post Actions -->
	<div class="flex items-center gap-4 px-4 py-3 border-t border-base-300">
		<!-- Like Button -->
		<button 
			class="btn btn-ghost btn-sm gap-2"
			class:text-error={postData.liked_by_user}
			onclick={toggleLike}
			disabled={isLiking || !$user}
		>
			<Heart 
				size={20} 
				fill={postData.liked_by_user ? 'currentColor' : 'none'}
				class={postData.liked_by_user ? 'text-red-500' : ''}
			/>
			{postData.like_count}
		</button>
		
		<!-- Comment Button -->
		<button 
			class="btn btn-ghost btn-sm gap-2"
			onclick={loadComments}
			disabled={!$user}
		>
			<MessageCircle size={20} />
			{postData.comment_count}
		</button>
		
		<!-- Share Button -->
		<button 
			class="btn btn-ghost btn-sm gap-2"
			onclick={() => {
				if (navigator.share) {
					navigator.share({
						title: 'Check out this post on Likey',
						url: window.location.origin + '/post/' + postData.id
					});
				} else {
					navigator.clipboard.writeText(window.location.origin + '/post/' + postData.id);
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