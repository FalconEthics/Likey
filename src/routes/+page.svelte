<script>
	import { onMount } from 'svelte';
	import { user, showLogin } from '$lib/stores.js';
	import VirtualizedFeed from '$lib/components/VirtualizedFeed.svelte';
	import WelcomeHero from '$lib/components/WelcomeHero.svelte';
</script>

{#if $user}
	<VirtualizedFeed />
{:else}
	<WelcomeHero />
{/if}
