<script>
	import { onMount } from 'svelte';
	import { user, showLogin } from '$lib/stores.js';
	import { supabase } from '$lib/supabase.js';
	import { formatRelativeTime } from '$lib/utils.js';
	import { createNotification } from '$lib/notifications.js';
	import { goto } from '$app/navigation';
	
	// Lucide Icons
	import { Heart, MessageCircle, Share2, MoreHorizontal, Trash2, ArrowLeft } from 'lucide-svelte';
	
	/** @type {import('./$types').PageData} */
	let { data } = $props();
	
	// Local reactive state for post data
	let postData = $state({ ...data.post });
	let isLiking = $state(false);
	let newComment = $state('');
	let comments = $state([]);
	let commentsLoading = $state(true);
	let showOptions = $state(false);
	let deleting = $state(false);
	let addingComment = $state(false);
	
	/**
	 * Load comments for the post (auto-load since this is single post view)
	 */
	async function loadComments() {
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
	}
	
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
				
				// Create notification for the post owner (if not own post)
				if (postData.user_id !== $user.id) {
					await createNotification(
						postData.user_id,
						'like',
						`${$user.display_name} liked your post`,
						$user.id,
						postData.id
					);
				}
			}
		} catch (error) {
			console.error('Error toggling like:', error);
		} finally {
			isLiking = false;
		}
	}
	
	/**
	 * Add a new comment
	 * @param {Event} event
	 */
	async function addComment(event) {
		event.preventDefault();
		
		if (!$user || !newComment.trim() || addingComment) return;
		
		addingComment = true;
		
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
			
			// Create notification for the post owner (if not own post)
			if (postData.user_id !== $user.id) {
				await createNotification(
					postData.user_id,
					'comment',
					`${$user.display_name} commented on your post`,
					$user.id,
					postData.id
				);
			}
		} catch (error) {
			console.error('Error adding comment:', error);
		} finally {
			addingComment = false;
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
			
			// Navigate back to home after successful deletion
			goto('/');
			
		} catch (error) {
			console.error('Error deleting post:', error);
			alert('Failed to delete post. Please try again.');
		} finally {
			deleting = false;
			showOptions = false;
		}
	}
	
	/**
	 * Share post functionality
	 */
	async function sharePost() {
		const url = window.location.href;
		
		if (navigator.share) {
			try {
				await navigator.share({
					title: `${postData.user.display_name}'s post on Likey`,
					text: postData.caption || 'Check out this post on Likey',
					url: url
				});
			} catch (error) {
				// User cancelled or error occurred, fallback to clipboard
				if (error.name !== 'AbortError') {
					await navigator.clipboard.writeText(url);
					// Could add toast notification here: "Link copied to clipboard!"
				}
			}
		} else {
			// Fallback to clipboard
			try {
				await navigator.clipboard.writeText(url);
				// Could add toast notification here: "Link copied to clipboard!"
			} catch (error) {
				console.error('Failed to copy to clipboard:', error);
				// Fallback: show the URL in a prompt
				prompt('Copy this link to share:', url);
			}
		}
	}
	
	// Load comments on mount
	onMount(() => {
		loadComments();
	});
</script>

<svelte:head>
	<title>{postData.user.display_name}'s post - Likey</title>
	<meta name="description" content={postData.caption || `Post by ${postData.user.display_name} on Likey`} />
</svelte:head>

<div class="min-h-screen bg-base-100">
	<!-- Back Navigation -->
	<div class="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
		<div class="flex items-center gap-4">
			<button onclick={() => history.back()} class="btn btn-ghost btn-circle">
				<ArrowLeft size={20} />
			</button>
			<h1 class="text-lg font-semibold">Post</h1>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-6 max-w-2xl">
		<article class="card bg-base-100 shadow-lg border border-base-300">
			<!-- Post Header -->
			<div class="flex items-center gap-3 p-4 pb-2">
				<a href="/profile/{postData.user.username}" class="avatar">
					<div class="w-12 rounded-full">
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
					<a href="/profile/{postData.user.username}" class="font-semibold hover:underline text-base">
						{postData.user.display_name}
					</a>
					<p class="text-sm text-base-content/60">@{postData.user.username}</p>
					<time class="text-sm text-base-content/60" datetime={postData.created_at}>
						{formatRelativeTime(postData.created_at)}
					</time>
				</div>
				
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
				<div class="px-4 py-3">
					<p class="text-base leading-relaxed">{postData.caption}</p>
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
				<button class="btn btn-ghost btn-sm gap-2" disabled>
					<MessageCircle size={20} />
					{postData.comment_count}
				</button>
				
				<!-- Share Button -->
				<button class="btn btn-ghost btn-sm gap-2" onclick={sharePost} title="Share this post">
					<Share2 size={20} />
				</button>
			</div>
		</article>
		
		<!-- Comments Section - Always Expanded -->
		<div class="card bg-base-100 shadow-lg border border-base-300 mt-6">
			<div class="p-4">
				<h2 class="text-lg font-semibold mb-4">Comments</h2>
				
				{#if commentsLoading}
					<div class="flex justify-center py-8">
						<span class="loading loading-spinner loading-md"></span>
					</div>
				{:else}
					<!-- Existing Comments -->
					{#if comments.length > 0}
						<div class="space-y-4 mb-6">
							{#each comments as comment}
								<div class="flex gap-3">
									<a href="/profile/{comment.user.username}" class="avatar">
										<div class="w-8 rounded-full">
											{#if comment.user.profile_pic_url}
												<img src={comment.user.profile_pic_url} alt={comment.user.display_name} />
											{:else}
												<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-sm">
													{comment.user.display_name?.charAt(0).toUpperCase() || 'U'}
												</div>
											{/if}
										</div>
									</a>
									
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<a href="/profile/{comment.user.username}" class="font-semibold text-sm hover:underline">
												{comment.user.display_name}
											</a>
											<span class="text-xs text-base-content/60">@{comment.user.username}</span>
											<time class="text-xs text-base-content/60">
												{formatRelativeTime(comment.created_at)}
											</time>
										</div>
										<p class="text-sm leading-relaxed">{comment.content}</p>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-8 text-base-content/60">
							<MessageCircle size={48} class="mx-auto mb-2 opacity-50" />
							<p>No comments yet. Be the first to comment!</p>
						</div>
					{/if}
					
					<!-- Add Comment Form -->
					{#if $user}
						<form onsubmit={addComment} class="flex gap-3 mt-6 pt-4 border-t border-base-300">
							<div class="avatar">
								<div class="w-8 rounded-full">
									{#if $user.profile_pic_url}
										<img src={$user.profile_pic_url} alt={$user.display_name} />
									{:else}
										<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-sm">
											{$user.display_name?.charAt(0).toUpperCase() || 'U'}
										</div>
									{/if}
								</div>
							</div>
							
							<div class="flex-1 flex gap-2">
								<textarea 
									placeholder="Write a comment..." 
									class="textarea textarea-bordered flex-1 resize-none"
									rows="2"
									bind:value={newComment}
									required
									disabled={addingComment}
								></textarea>
								<button 
									type="submit" 
									class="btn btn-primary" 
									disabled={!newComment.trim() || addingComment}
									class:loading={addingComment}
								>
									{#if !addingComment}
										Post
									{/if}
								</button>
							</div>
						</form>
					{:else}
						<div class="text-center py-6 text-base-content/60">
							<p>Please <button class="link" onclick={() => showLogin.set(true)}>sign in</button> to comment</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
</div>