<script>
	import { user } from '../stores.js';
	import Feed from './Feed.svelte';
	import VirtualizedFeed from './VirtualizedFeed.svelte';

	let useVirtualized = true;
</script>

{#if $user}
	<div class="mx-auto mb-4 max-w-2xl">
		<div class="flex items-center justify-center gap-4 rounded-lg bg-base-200 p-4">
			<span class="text-sm font-medium">Feed Type:</span>
			<div class="join">
				<button
					class="btn join-item btn-sm"
					class:btn-primary={!useVirtualized}
					class:btn-outline={useVirtualized}
					onclick={() => (useVirtualized = false)}
				>
					Standard Feed
				</button>
				<button
					class="btn join-item btn-sm"
					class:btn-primary={useVirtualized}
					class:btn-outline={!useVirtualized}
					onclick={() => (useVirtualized = true)}
				>
					Virtualized Feed
				</button>
			</div>
		</div>

		{#if useVirtualized}
			<div class="mb-4 text-center text-sm text-success">
				✅ Using virtualized scrolling - Better performance for large feeds
			</div>
		{:else}
			<div class="mb-4 text-center text-sm text-warning">
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
