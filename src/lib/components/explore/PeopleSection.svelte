<script>
	import { user, recommendedUsers, trendingUsers } from '$lib/stores.js';
	import UserCard from '../UserCard.svelte';
	import { Users } from 'lucide-svelte';

	// Props
	let { loading = false } = $props();
</script>

<div class="people-section space-y-8">
	<!-- Recommended Users (if logged in) -->
	{#if $user && $recommendedUsers.length > 0}
		<div>
			<h2 class="mb-4 text-xl font-semibold">Recommended for you</h2>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each $recommendedUsers as recommendedUser (recommendedUser.id)}
					<UserCard user={recommendedUser} showReason={true} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Trending Users -->
	<div>
		<h2 class="mb-4 text-xl font-semibold">Popular Users</h2>
		{#if $trendingUsers.length === 0 && !loading}
			<div class="py-8 text-center">
				<div class="mb-4 text-4xl">👥</div>
				<p class="text-base-content/60">No users to show yet.</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each $trendingUsers as trendingUser (trendingUser.id)}
					<UserCard user={trendingUser} />
				{/each}
			</div>
		{/if}
	</div>
</div>