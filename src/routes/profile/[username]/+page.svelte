<script>
	import { onMount } from 'svelte';
	import { user } from '$lib/stores.js';
	import { supabase } from '$lib/supabase.js';
	import VirtualizedPostList from '$lib/components/VirtualizedPostList.svelte';
	import { createNotification } from '$lib/notifications.js';
	import { getOrCreateConversation } from '$lib/messages.js';
	import { goto } from '$app/navigation';

	// Lucide Icons
	import { MessageCircle, Camera, Check } from 'lucide-svelte';

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
				const { error } = await supabase.from('follows').insert({
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
		posts = posts.filter((post) => post.id !== postId);

		// Update profile post count
		profile.posts_count = Math.max(0, profile.posts_count - 1);
	}

	onMount(() => {
		checkFollowStatus();

		// Update like status for posts based on current user
		if ($user) {
			posts = posts.map((post) => ({
				...post,
				liked_by_user: post.likes?.some((like) => like.user_id === $user.id) || false
			}));
		}
	});
</script>

<svelte:head>
	<title>{profile.display_name} (@{profile.username}) - Likey</title>
	<meta name="description" content={profile.bio || `${profile.display_name}'s profile on Likey`} />
</svelte:head>

<div class="mx-auto max-w-4xl px-4 pb-28 lg:pb-6">
	<!-- Profile Header -->
	<div class="card mb-6 bg-base-100 shadow-lg">
		<div class="card-body">
			<div class="flex flex-col gap-6 md:flex-row">
				<!-- Profile Picture -->
				<div class="flex justify-center md:justify-start">
					<div class="avatar">
						<div class="w-32 rounded-full">
							{#if profile.profile_pic_url}
								<img src={profile.profile_pic_url} alt={profile.display_name} />
							{:else}
								<div
									class="flex h-full w-full items-center justify-center bg-primary text-3xl text-primary-content"
								>
									{profile.display_name?.charAt(0).toUpperCase() || 'U'}
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Profile Info -->
				<div class="flex-1 text-center md:text-left">
					<div class="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
						<div>
							<h1 class="text-2xl font-bold">{profile.display_name}</h1>
							<p class="text-base-content/60">@{profile.username}</p>
						</div>

						<!-- Follow/Edit Button -->
						{#if $user}
							{#if isCurrentUser}
								<a
									href="/settings"
									class="btn h-11 min-h-[44px] border-[hsl(346_77%_49%)] px-6 font-medium text-[hsl(346_77%_49%)] btn-outline hover:bg-[hsl(346_77%_49%)] hover:text-white"
								>
									Edit Profile
								</a>
							{:else}
								<div class="flex items-center gap-2">
									<button
										class="btn h-11 min-h-[44px] min-w-[100px] flex-1 px-6 font-medium"
										class:loading={followLoading}
										class:follow-btn={!isFollowing}
										class:following-btn={isFollowing}
										onclick={toggleFollow}
										disabled={followLoading}
									>
										{#if followLoading}
											Loading...
										{:else if isFollowing}
											<Check size={16} class="mr-1" />
											Following
										{:else}
											Follow
										{/if}
									</button>

									<button
										class="btn flex h-11 min-h-[44px] w-11 items-center justify-center border border-base-300 p-0 btn-ghost hover:bg-base-200"
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
					<div class="mb-4 flex justify-center gap-6 md:justify-start">
						<div class="text-center">
							<div class="text-lg font-bold">{profile.posts_count}</div>
							<div class="text-sm text-base-content/60">Posts</div>
						</div>
						<a
							href="/users/{profile.username}/followers"
							class="-m-2 rounded-lg p-2 text-center transition-colors hover:bg-base-200"
						>
							<div class="text-lg font-bold">{profile.followers_count}</div>
							<div class="text-sm text-base-content/60 hover:underline">Followers</div>
						</a>
						<a
							href="/users/{profile.username}/following"
							class="-m-2 rounded-lg p-2 text-center transition-colors hover:bg-base-200"
						>
							<div class="text-lg font-bold">{profile.following_count}</div>
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

	<!-- Posts Section -->
	<div class="space-y-6">
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Posts</h2>
			<div class="text-sm text-base-content/60">
				{posts.length}
				{posts.length === 1 ? 'post' : 'posts'}
			</div>
		</div>

		<VirtualizedPostList
			bind:posts
			loading={false}
			hasMore={false}
			emptyStateIcon={Camera}
			emptyStateTitle={isCurrentUser ? "You haven't posted anything yet" : `${profile.display_name} hasn't posted anything yet`}
			emptyStateDescription={isCurrentUser ? "Share your first post to get started!" : "Check back later for new posts!"}
			showCreateButton={false}
			showHeader={false}
			showRefreshButton={false}
			virtualizationThreshold={30}
			containerHeight="auto"
			containerClass="profile-posts-container"
			on:postDeleted={handlePostDeleted}
		/>
	</div>
</div>

<style>
	@import "tailwindcss" reference;

	.follow-btn {
		@apply border-[hsl(346_77%_49%)] bg-[hsl(346_77%_49%)] text-white hover:bg-[hsl(346_77%_59%)];
	}

	.following-btn {
		@apply border-green-500 bg-green-500 text-white hover:border-red-500 hover:bg-red-500;
	}
</style>
