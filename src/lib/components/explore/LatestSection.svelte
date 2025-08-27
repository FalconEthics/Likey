<script>
	import VirtualizedPostList from '../VirtualizedPostList.svelte';
	import { Camera } from 'lucide-svelte';

	// Props
	let { 
		explorePosts = $bindable([]),
		loading = false, 
		onRefresh = () => {} 
	} = $props();
</script>

<div class="latest-section">
	<VirtualizedPostList
		bind:posts={explorePosts}
		title="Latest Posts"
		{loading}
		hasMore={false}
		emptyStateIcon={Camera}
		emptyStateTitle="No posts to explore yet"
		emptyStateDescription="Check back soon for fresh content!"
		showHeader={false}
		showRefreshButton={false}
		{onRefresh}
		virtualizationThreshold={25}
		containerHeight="calc(100vh-16rem)"
		containerClass="max-h-[calc(100vh-16rem)]"
	/>
</div>