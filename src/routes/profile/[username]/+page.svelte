<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores.js';
	import { supabase } from '$lib/supabase.js';
	import Post from '$lib/components/Post.svelte';
	import { createNotification } from '$lib/notifications.js';
	import { getOrCreateConversation } from '$lib/messages.js';
	import { goto } from '$app/navigation';
	
	// Lucide Icons
	import { MessageCircle } from 'lucide-svelte';
	
	const { data } = $props();
	let { profile } = data;
	let posts = $state(data.posts);
	
	let isFollowing = $state(false);
	let followLoading = $state(false);
	
	// Use $derived for Svelte 5 runes mode
	let isCurrentUser = $derived($user?.id === profile.id);
	
	/**
	 * Check if current user is following this profile
	 */
	async function checkFollowStatus() {
		if (!$user || isCurrentUser) return;
		
		try {
			const { data, error } = await supabase
				.from('follows')
				.select('id')
				.eq('follower_id', $user.id)
				.eq('following_id', profile.id)
				.single();
			
			isFollowing = !!data;
		} catch (error) {
			// Not following or error
			isFollowing = false;
		}
	}
	
	/**
	 * Toggle follow status
	 */
	async function toggleFollow() {
		if (!$user || isCurrentUser || followLoading) return;
		
		followLoading = true;
		
		try {
			if (isFollowing) {
				// Unfollow
				const { error } = await supabase
					.from('follows')
					.delete()
					.eq('follower_id', $user.id)
					.eq('following_id', profile.id);
				
				if (error) throw error;
				
				isFollowing = false;
				profile.followers_count -= 1;
			} else {
				// Follow
				const { error } = await supabase
					.from('follows')
					.insert({
						follower_id: $user.id,
						following_id: profile.id
					});
				
				if (error) throw error;
				
				isFollowing = true;
				profile.followers_count += 1;
				
				// Create notification for the followed user
				await createNotification(
					profile.id,
					'follow',
					`${$user.display_name} started following you`,
					$user.id
				);
			}
		} catch (error) {
			console.error('Error toggling follow:', error);
		} finally {
			followLoading = false;
		}
	}

	/**
	 * Start a conversation with this user
	 */
	async function startConversation() {
		if (!$user || isCurrentUser) return;
		
		const { data, error } = await getOrCreateConversation(profile.id);
		
		if (!error && data) {
			goto(`/messages/${data.id}`);
		}
	}
	
	/**
	 * Handle post deletion
	 * @param {CustomEvent} event
	 */
	function handlePostDeleted(event) {
		const { postId } = event.detail;
		
		// Remove post from local array
		posts = posts.filter(post => post.id !== postId);
		
		// Update profile post count
		profile.posts_count = Math.max(0, profile.posts_count - 1);
	}
	
	onMount(() => {
		checkFollowStatus();
		
		// Update like status for posts based on current user
		if ($user) {
			posts = posts.map(post => ({
				...post,
				liked_by_user: post.likes?.some(like => like.user_id === $user.id) || false
			}));
		}
	});
</script>

<svelte:head>
	<title>{profile.display_name} (@{profile.username}) - Likey</title>
	<meta name="description" content="{profile.bio || `${profile.display_name}'s profile on Likey`}" />
</svelte:head>

<div class="max-w-4xl mx-auto pb-28 lg:pb-6 px-4">
	<!-- Profile Header -->
	<div class="card bg-base-100 shadow-lg mb-6">
		<div class="card-body">
			<div class="flex flex-col md:flex-row gap-6">
				<!-- Profile Picture -->
				<div class="flex justify-center md:justify-start">
					<div class="avatar">
						<div class="w-32 rounded-full">
							{#if profile.profile_pic_url}
								<img src={profile.profile_pic_url} alt={profile.display_name} />
							{:else}
								<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-3xl">
									{profile.display_name?.charAt(0).toUpperCase() || 'U'}
								</div>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- Profile Info -->
				<div class="flex-1 text-center md:text-left">
					<div class="flex flex-col md:flex-row md:items-center gap-4 mb-4">
						<div>
							<h1 class="text-2xl font-bold">{profile.display_name}</h1>
							<p class="text-base-content/60">@{profile.username}</p>
						</div>
						
						<!-- Follow/Edit Button -->
						{#if $user}
							{#if isCurrentUser}
								<a href="/settings" class="btn btn-outline min-h-[44px] h-11 px-6 border-[hsl(346_77%_49%)] text-[hsl(346_77%_49%)] hover:bg-[hsl(346_77%_49%)] hover:text-white font-medium">
									Edit Profile
								</a>
							{:else}
								<div class="flex gap-2 items-center">
									<button 
										class="btn min-h-[44px] h-11 px-6 flex-1 min-w-[100px] font-medium border-[hsl(346_77%_49%)] bg-[hsl(346_77%_49%)] hover:bg-[hsl(346_77%_59%)] text-white"
										class:btn-outline={isFollowing}
										class:loading={followLoading}
										onclick={toggleFollow}
										disabled={followLoading}
									>
										{followLoading ? 'Loading...' : (isFollowing ? 'Following' : 'Follow')}
									</button>
									
									<button 
										class="btn btn-ghost min-h-[44px] h-11 w-11 p-0 flex items-center justify-center border border-base-300 hover:bg-base-200"
										onclick={startConversation}
										title="Send message"
									>
										<MessageCircle size={20} />
									</button>
								</div>
							{/if}
						{/if}
					</div>
					
					<!-- Stats -->
					<div class="flex justify-center md:justify-start gap-6 mb-4">
						<div class="text-center">
							<div class="font-bold text-lg">{profile.posts_count}</div>
							<div class="text-sm text-base-content/60">Posts</div>
						</div>
						<a href="/users/{profile.username}/followers" class="text-center hover:bg-base-200 rounded-lg p-2 -m-2 transition-colors">
							<div class="font-bold text-lg">{profile.followers_count}</div>
							<div class="text-sm text-base-content/60 hover:underline">Followers</div>
						</a>
						<a href="/users/{profile.username}/following" class="text-center hover:bg-base-200 rounded-lg p-2 -m-2 transition-colors">
							<div class="font-bold text-lg">{profile.following_count}</div>
							<div class="text-sm text-base-content/60 hover:underline">Following</div>
						</a>
					</div>
					
					<!-- Bio -->
					{#if profile.bio}
						<p class="text-base-content/80">{profile.bio}</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
	
	<!-- Posts Grid -->
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Posts</h2>
			<div class="text-sm text-base-content/60">
				{posts.length} {posts.length === 1 ? 'post' : 'posts'}
			</div>
		</div>
		
		{#if posts.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">📷</div>
				<h3 class="text-xl font-semibold mb-2">
					{isCurrentUser ? "You haven't" : `${profile.display_name} hasn't`} posted anything yet
				</h3>
				{#if isCurrentUser}
					<p class="text-base-content/60 mb-4">Share your first post to get started!</p>
				{/if}
			</div>
		{:else}
			{#each posts as post (post.id)}
				<Post {post} on:postDeleted={handlePostDeleted} />
			{/each}
		{/if}
	</div>
</div>