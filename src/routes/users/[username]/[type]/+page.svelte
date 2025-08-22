<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase.js';

	// Lucide Icons
	import { ArrowLeft, Users, UserPlus, UserCheck, UserMinus } from 'lucide-svelte';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	let users = $state([]);
	let loading = $state(true);
	let loadingMore = $state(false);
	let hasMore = $state(true);
	let offset = $state(0);
	const limit = 20;

	// Following state tracking for follow/unfollow buttons
	let followingStates = $state({});
	let followingLoading = $state({});

	/**
	 * Load users (followers or following)
	 */
	async function loadUsers(reset = false) {
		if (reset) {
			loading = true;
			offset = 0;
			users = [];
			hasMore = true;
		} else {
			loadingMore = true;
		}

		try {
			let query;

			if (data.type === 'followers') {
				// Get users who follow this profile
				query = supabase
					.from('follows')
					.select(
						`
						follower_id,
						created_at,
						follower:follower_id (
							id,
							username,
							display_name,
							profile_pic_url,
							bio
						)
					`
					)
					.eq('following_id', data.profile.id)
					.order('created_at', { ascending: false })
					.range(offset, offset + limit - 1);
			} else {
				// Get users that this profile follows
				query = supabase
					.from('follows')
					.select(
						`
						following_id,
						created_at,
						following:following_id (
							id,
							username,
							display_name,
							profile_pic_url,
							bio
						)
					`
					)
					.eq('follower_id', data.profile.id)
					.order('created_at', { ascending: false })
					.range(offset, offset + limit - 1);
			}

			const { data: results, error } = await query;

			if (error) throw error;

			// Transform the data to get user objects
			const newUsers = results.map((item) => {
				const user = data.type === 'followers' ? item.follower : item.following;
				return {
					...user,
					follow_date: item.created_at
				};
			});

			if (reset) {
				users = newUsers;
			} else {
				users = [...users, ...newUsers];
			}

			hasMore = results.length === limit;
			offset += results.length;

			// Load current user's following status for all users
			if (data.currentUser) {
				await loadFollowingStates(newUsers);
			}
		} catch (error) {
			console.error('Error loading users:', error);
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	/**
	 * Load following states for the current user
	 * @param {Array} userList - List of users to check following status for
	 */
	async function loadFollowingStates(userList) {
		if (!data.currentUser) return;

		const userIds = userList.map((u) => u.id);

		const { data: follows, error } = await supabase
			.from('follows')
			.select('following_id')
			.eq('follower_id', data.currentUser.id)
			.in('following_id', userIds);

		if (!error && follows) {
			const newStates = {};
			follows.forEach((follow) => {
				newStates[follow.following_id] = true;
			});
			followingStates = { ...followingStates, ...newStates };
		}
	}

	/**
	 * Follow/unfollow a user
	 * @param {Object} user - User to follow/unfollow
	 */
	async function toggleFollow(user) {
		if (!data.currentUser) {
			// Redirect to login or show login modal
			return;
		}

		if (user.id === data.currentUser.id) {
			// Can't follow yourself
			return;
		}

		followingLoading[user.id] = true;
		followingLoading = { ...followingLoading };

		const isFollowing = followingStates[user.id];

		try {
			if (isFollowing) {
				// Unfollow
				const { error } = await supabase
					.from('follows')
					.delete()
					.eq('follower_id', data.currentUser.id)
					.eq('following_id', user.id);

				if (error) throw error;

				followingStates[user.id] = false;
			} else {
				// Follow
				const { error } = await supabase.from('follows').insert({
					follower_id: data.currentUser.id,
					following_id: user.id
				});

				if (error) throw error;

				followingStates[user.id] = true;
			}

			followingStates = { ...followingStates };
		} catch (error) {
			console.error('Error toggling follow:', error);
		} finally {
			delete followingLoading[user.id];
			followingLoading = { ...followingLoading };
		}
	}

	/**
	 * Get the appropriate button text and style for follow button
	 * @param {Object} user
	 */
	function getFollowButtonProps(user) {
		if (!data.currentUser) {
			return { text: 'Follow', icon: UserPlus, classes: 'btn-primary' };
		}

		if (user.id === data.currentUser.id) {
			return { text: 'You', icon: Users, classes: 'btn-disabled', disabled: true };
		}

		const isFollowing = followingStates[user.id];
		const isLoading = followingLoading[user.id];

		if (isLoading) {
			return { text: '', icon: null, classes: 'btn-primary loading', disabled: true };
		}

		if (isFollowing) {
			return {
				text: 'Following',
				icon: UserCheck,
				classes: 'btn-outline hover:btn-error hover:text-error'
			};
		}

		return { text: 'Follow', icon: UserPlus, classes: 'btn-primary' };
	}

	// Load initial data
	onMount(() => {
		loadUsers(true);
	});
</script>

<svelte:head>
	<title
		>{data.profile.display_name}'s {data.type === 'followers' ? 'Followers' : 'Following'} - Likey</title
	>
</svelte:head>

<div class="mx-auto max-w-2xl">
	<!-- Header -->
	<div class="sticky top-0 z-10 border-b border-base-300 bg-base-100 p-4">
		<div class="flex items-center gap-4">
			<button class="btn btn-circle btn-ghost" onclick={() => history.back()}>
				<ArrowLeft size={20} />
			</button>

			<div class="flex-1">
				<h1 class="text-lg font-semibold">
					{data.profile.display_name}'s {data.type === 'followers' ? 'Followers' : 'Following'}
				</h1>
				<p class="text-sm text-base-content/60">
					{data.type === 'followers' ? data.profile.followers_count : data.profile.following_count}
					{data.type === 'followers' ? 'followers' : 'following'}
				</p>
			</div>
		</div>
	</div>

	<!-- Users List -->
	<div class="p-4">
		{#if loading}
			<div class="space-y-4">
				{#each Array(5) as _}
					<div class="flex items-center gap-3 p-3">
						<div class="h-12 w-12 skeleton rounded-full"></div>
						<div class="flex-1">
							<div class="mb-2 h-4 w-32 skeleton"></div>
							<div class="h-3 w-24 skeleton"></div>
						</div>
						<div class="h-8 w-20 skeleton"></div>
					</div>
				{/each}
			</div>
		{:else if users.length === 0}
			<div class="py-12 text-center">
				<Users size={48} class="mx-auto mb-4 text-base-content/40" />
				<h3 class="mb-2 text-lg font-semibold">
					{#if data.type === 'followers'}
						No followers yet
					{:else}
						Not following anyone yet
					{/if}
				</h3>
				<p class="text-base-content/60">
					{#if data.type === 'followers'}
						When people follow {data.profile.display_name}, they'll appear here.
					{:else}
						When {data.profile.display_name} follows people, they'll appear here.
					{/if}
				</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each users as user (user.id)}
					<div class="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-base-200">
						<!-- Avatar -->
						<a href="/profile/{user.username}" class="avatar">
							<div class="w-12 rounded-full">
								{#if user.profile_pic_url}
									<img src={user.profile_pic_url} alt={user.display_name} />
								{:else}
									<div
										class="flex h-full w-full items-center justify-center bg-primary text-primary-content"
									>
										{user.display_name?.charAt(0).toUpperCase() || 'U'}
									</div>
								{/if}
							</div>
						</a>

						<!-- User Info -->
						<div class="min-w-0 flex-1">
							<a href="/profile/{user.username}" class="block">
								<h3 class="truncate text-sm font-semibold hover:underline">
									{user.display_name}
								</h3>
								<p class="truncate text-xs text-base-content/60">@{user.username}</p>
								{#if user.bio}
									<p class="mt-1 line-clamp-2 text-xs text-base-content/80">{user.bio}</p>
								{/if}
							</a>
						</div>

						<!-- Follow Button -->
						{#if data.currentUser}
							{@const buttonProps = getFollowButtonProps(user)}
							<button
								class="btn btn-sm {buttonProps.classes}"
								disabled={buttonProps.disabled}
								onclick={() => toggleFollow(user)}
							>
								{#if buttonProps.icon && !followingLoading[user.id]}
									<buttonProps.icon size={16} />
								{/if}
								{buttonProps.text}
							</button>
						{/if}
					</div>
				{/each}

				<!-- Load More Button -->
				{#if hasMore}
					<div class="py-4 text-center">
						<button
							class="btn btn-outline"
							class:loading={loadingMore}
							onclick={() => loadUsers()}
							disabled={loadingMore}
						>
							{#if !loadingMore}
								Load more
							{/if}
						</button>
					</div>
				{/if}
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
