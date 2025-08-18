<script>
	import { user } from '../stores.js';
	import Feed from './Feed.svelte';
	import VirtualizedFeed from './VirtualizedFeed.svelte';
	
	let useVirtualized = true;
</script>

{#if $user}
	<div class="max-w-2xl mx-auto mb-4">
		<div class="flex items-center justify-center gap-4 p-4 bg-base-200 rounded-lg">
			<span class="text-sm font-medium">Feed Type:</span>
			<div class="join">
				<button 
					class="btn btn-sm join-item"
					class:btn-primary={!useVirtualized}
					class:btn-outline={useVirtualized}
					onclick={() => useVirtualized = false}
				>
					Standard Feed
				</button>
				<button 
					class="btn btn-sm join-item"
					class:btn-primary={useVirtualized}
					class:btn-outline={!useVirtualized}
					onclick={() => useVirtualized = true}
				>
					Virtualized Feed
				</button>
			</div>
		</div>
		
		{#if useVirtualized}
			<div class="text-center text-sm text-success mb-4">
				✅ Using virtualized scrolling - Better performance for large feeds
			</div>
		{:else}
			<div class="text-center text-sm text-warning mb-4">
				⚠️ Using standard scrolling - May slow down with many posts
			</div>
		{/if}
	</div>
{/if}

{#if useVirtualized}
	<VirtualizedFeed />
{:else}
	<Feed />
{/if}