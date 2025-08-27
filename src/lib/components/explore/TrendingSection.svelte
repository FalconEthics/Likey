<script>
	import { user, trendingPosts, recommendedUsers } from '$lib/stores.js';
	import VirtualizedPostList from '../VirtualizedPostList.svelte';
	import UserCard from '../UserCard.svelte';
	import { Flame } from 'lucide-svelte';

	// Props
	let { loading = false, onRefresh = () => {} } = $props();
</script>

<div class="trending-section space-y-8">
	<!-- Recommended Users (if logged in) -->
	{#if $user && $recommendedUsers.length > 0}
		<div>
			<h2 class="mb-4 text-xl font-semibold">Suggested for you</h2>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each $recommendedUsers as recommendedUser (recommendedUser.id)}
					<UserCard user={recommendedUser} showReason={true} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Trending Posts -->
	<div>
		<VirtualizedPostList
			bind:posts={$trendingPosts}
			title="Trending Posts"
			{loading}
			hasMore={false}
			emptyStateIcon={Flame}
			emptyStateTitle="No trending posts yet"
			emptyStateDescription="Check back later for hot content!"
			showHeader={false}
			showRefreshButton={false}
			{onRefresh}
			virtualizationThreshold={20}
			containerHeight="700px"
		/>
	</div>
</div>