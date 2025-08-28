<script>
	import { user } from '../stores.js';
	import { useFollow } from '../composables/useFollow.js';
	import { getOrCreateConversation } from '../messages.js';
	import { goto } from '$app/navigation';

	// Lucide Icons
	import { MessageCircle, Check } from 'lucide-svelte';

	/**
	 * @type {Object}
	 */
	const { user: profileUser, showReason = false } = $props();

	let isFollowing = $state(profileUser.is_following || false);
	let followLoading = $state(false);

	// Initialize follow composable
	const followManager = useFollow({
		onFollowChange: (newState) => {
			isFollowing = newState;
		},
		onCountUpdate: (delta) => {
			profileUser.followers_count = Math.max(0, (profileUser.followers_count || 0) + delta);
		}
	});

	/**
	 * Toggle follow status
	 */
	async function toggleFollow() {
		if (!$user || followLoading) return;

		followLoading = true;

		try {
			const result = await followManager.toggleFollow(
				profileUser.id,
				isFollowing,
				profileUser.display_name
			);

			if (!result.success && result.error) {
				console.error('Error toggling follow:', result.error);
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

<div class="card h-full bg-base-100 shadow-lg transition-shadow hover:shadow-xl">
	<div class="card-body flex h-full flex-col p-4 text-center">
		<!-- Profile Picture -->
		<a href="/profile/{profileUser.username}" class="avatar mx-auto">
			<div class="w-16 rounded-full">
				{#if profileUser.profile_pic_url}
					<img src={profileUser.profile_pic_url} alt={profileUser.display_name} />
				{:else}
					<div
						class="flex h-full w-full items-center justify-center bg-primary text-xl text-primary-content"
					>
						{profileUser.display_name?.charAt(0).toUpperCase() || 'U'}
					</div>
				{/if}
			</div>
		</a>

		<!-- User Info -->
		<div class="mt-3 flex-1">
			<a href="/profile/{profileUser.username}" class="block font-semibold hover:underline">
				{profileUser.display_name}
			</a>
			<p class="text-sm text-base-content/60">@{profileUser.username}</p>

			<div class="bio-container flex h-12 items-center justify-center">
				{#if profileUser.bio}
					<p class="line-clamp-2 text-xs text-base-content/80">
						{profileUser.bio}
					</p>
				{/if}
			</div>
		</div>

		<!-- Stats -->
		<div class="mt-2 flex justify-center gap-4 text-xs text-base-content/60">
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
		<div class="reason-container flex h-8 items-center justify-center">
			{#if showReason && profileUser.recommendation_reason}
				<div class="badge badge-ghost badge-sm">
					{getReasonText(profileUser.recommendation_reason)}
				</div>
			{/if}
		</div>

		<!-- Actions -->
		<div class="action-container mt-4">
			{#if $user && profileUser.id !== $user.id}
				<div class="flex h-10 items-center gap-2">
					<button
						class="btn h-full min-h-0 flex-1 font-medium btn-sm"
						class:loading={followLoading}
						class:follow-btn={!isFollowing}
						class:following-btn={isFollowing}
						onclick={toggleFollow}
						disabled={followLoading}
					>
						{#if followLoading}
							<!-- Loading spinner handled by loading class -->
						{:else if isFollowing}
							<Check size={14} class="mr-1" />
							Following
						{:else}
							Follow
						{/if}
					</button>

					<button
						class="btn flex h-full min-h-0 w-10 items-center justify-center border border-base-300 p-0 btn-ghost btn-sm hover:bg-base-200"
						onclick={startConversation}
						title="Send message"
					>
						<MessageCircle size={16} />
					</button>
				</div>
			{:else if !$user}
				<div class="flex h-10 items-center">
					<a
						href="/"
						class="btn h-full min-h-0 flex-1 font-medium btn-sm follow-btn"
					>
						Sign in to follow
					</a>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	@import "tailwindcss" reference;

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.follow-btn {
		@apply border-[hsl(346_77%_49%)] bg-[hsl(346_77%_49%)] text-white hover:bg-[hsl(346_77%_59%)];
	}

	.following-btn {
		@apply border-green-500 bg-green-500 text-white hover:border-red-500 hover:bg-red-500;
	}
</style>
