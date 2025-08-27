<script>
	import { onMount } from 'svelte';
	import { user, showLogin } from '$lib/stores.js';
	import Feed from '$lib/components/Feed.svelte';
	import WelcomeHero from '$lib/components/WelcomeHero.svelte';
</script>

{#if $user}
	<Feed />
{:else}
	<WelcomeHero />
{/if}
