<script>
	import { user } from '../stores.js';
	import { supabase } from '../supabase.js';
	import { createNotification } from '../notifications.js';
	import { getOrCreateConversation } from '../messages.js';
	import { goto } from '$app/navigation';
	
	// Lucide Icons
	import { MessageCircle } from 'lucide-svelte';

	/**
	 * @type {Object}
	 */
	const { user: profileUser, showReason = false } = $props();

	let isFollowing = $state(profileUser.is_following || false);
	let followLoading = $state(false);

	/**
	 * Toggle follow status
	 */
	async function toggleFollow() {
		if (!$user || followLoading) return;
		
		followLoading = true;
		
		try {
			if (isFollowing) {
				// Unfollow
				const { error } = await supabase
					.from('follows')
					.delete()
					.eq('follower_id', $user.id)
					.eq('following_id', profileUser.id);
				
				if (error) throw error;
				
				isFollowing = false;
				profileUser.followers_count = Math.max(0, profileUser.followers_count - 1);
			} else {
				// Follow
				const { error } = await supabase
					.from('follows')
					.insert({
						follower_id: $user.id,
						following_id: profileUser.id
					});
				
				if (error) throw error;
				
				isFollowing = true;
				profileUser.followers_count += 1;
				
				// Create notification
				await createNotification(
					profileUser.id,
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
		if (!$user) return;
		
		const { data, error } = await getOrCreateConversation(profileUser.id);
		
		if (!error && data) {
			goto(`/messages/${data.id}`);
		}
	}

	/**
	 * Get reason text for recommendation
	 * @param {string} reason
	 * @returns {string}
	 */
	function getReasonText(reason) {
		switch (reason) {
			case 'mutual_followers':
				return 'Mutual connections';
			case 'similar_interests':
				return 'Similar interests';
			case 'new_user':
				return 'New to Likey';
			default:
				return 'Suggested';
		}
	}
</script>

<div class="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
	<div class="card-body p-4 text-center">
		<!-- Profile Picture -->
		<a href="/profile/{profileUser.username}" class="avatar mx-auto">
			<div class="w-16 rounded-full">
				{#if profileUser.profile_pic_url}
					<img src={profileUser.profile_pic_url} alt={profileUser.display_name} />
				{:else}
					<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xl">
						{profileUser.display_name?.charAt(0).toUpperCase() || 'U'}
					</div>
				{/if}
			</div>
		</a>

		<!-- User Info -->
		<div class="mt-3">
			<a href="/profile/{profileUser.username}" class="font-semibold hover:underline block">
				{profileUser.display_name}
			</a>
			<p class="text-sm text-base-content/60">@{profileUser.username}</p>
			
			{#if profileUser.bio}
				<p class="text-xs text-base-content/80 mt-2 line-clamp-2">
					{profileUser.bio}
				</p>
			{/if}
		</div>

		<!-- Stats -->
		<div class="flex justify-center gap-4 text-xs text-base-content/60 mt-2">
			<div>
				<span class="font-semibold">{profileUser.followers_count || 0}</span>
				<span>followers</span>
			</div>
			<div>
				<span class="font-semibold">{profileUser.posts_count || 0}</span>
				<span>posts</span>
			</div>
		</div>

		<!-- Recommendation Reason -->
		{#if showReason && profileUser.recommendation_reason}
			<div class="badge badge-ghost badge-sm mt-2">
				{getReasonText(profileUser.recommendation_reason)}
			</div>
		{/if}

		<!-- Actions -->
		{#if $user && profileUser.id !== $user.id}
			<div class="card-actions justify-center mt-4 gap-2">
				<button 
					class="btn btn-primary btn-sm flex-1"
					class:btn-outline={isFollowing}
					class:loading={followLoading}
					onclick={toggleFollow}
					disabled={followLoading}
				>
					{followLoading ? '' : (isFollowing ? 'Following' : 'Follow')}
				</button>
				
				<button 
					class="btn btn-ghost btn-sm btn-square"
					onclick={startConversation}
					title="Send message"
				>
					<MessageCircle size={16} />
				</button>
			</div>
		{:else if !$user}
			<div class="card-actions justify-center mt-4">
				<a href="/" class="btn btn-primary btn-sm">
					Sign in to follow
				</a>
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>