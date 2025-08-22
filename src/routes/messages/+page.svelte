<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user, conversations, unreadMessageCount } from '$lib/stores.js';
	import { getUserConversations, getUnreadMessageCount } from '$lib/messages.js';
	import { formatRelativeTime } from '$lib/utils.js';

	// Lucide Icons
	import { RefreshCw, MessageCircle } from 'lucide-svelte';

	let loading = $state(true);

	$effect(() => {
		if (!$user) {
			goto('/');
		}
	});

	/**
	 * Load conversations
	 */
	async function loadConversations() {
		loading = true;

		try {
			const { data, error } = await getUserConversations();

			if (error) throw error;

			if (data) {
				conversations.set(data);
			}
		} catch (error) {
			console.error('Error loading conversations:', error);
		} finally {
			loading = false;
		}
	}

	/**
	 * Load unread message count
	 */
	async function loadUnreadCount() {
		const { count } = await getUnreadMessageCount();
		unreadMessageCount.set(count);
	}

	/**
	 * Navigate to conversation
	 * @param {string} conversationId
	 */
	function openConversation(conversationId) {
		goto(`/messages/${conversationId}`);
	}

	onMount(() => {
		if ($user) {
			loadConversations();
			loadUnreadCount();
		}
	});
</script>

<svelte:head>
	<title>Messages - Likey</title>
</svelte:head>

{#if $user}
	<div class="mx-auto max-w-4xl">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Messages</h1>
			<button class="btn btn-outline btn-sm" onclick={loadConversations} disabled={loading}>
				{#if loading}
					<span class="loading loading-sm loading-spinner"></span>
				{:else}
					<RefreshCw size={16} />
				{/if}
				Refresh
			</button>
		</div>

		{#if loading}
			<div class="flex justify-center py-12">
				<span class="loading loading-lg loading-spinner"></span>
			</div>
		{:else if $conversations.length === 0}
			<div class="py-12 text-center">
				<MessageCircle size={64} class="mx-auto mb-4 text-base-content/40" />
				<h3 class="mb-2 text-xl font-semibold">No messages yet</h3>
				<p class="mb-4 text-base-content/60">
					Start a conversation by visiting someone's profile and clicking "Message"
				</p>
				<a href="/explore" class="btn btn-primary"> Explore Users </a>
			</div>
		{:else}
			<div class="space-y-2">
				{#each $conversations as conversation (conversation.id)}
					<button
						class="card w-full cursor-pointer bg-base-100 text-left shadow-sm transition-shadow hover:shadow-md"
						onclick={() => openConversation(conversation.id)}
					>
						<div class="card-body p-4">
							<div class="flex items-center gap-4">
								<!-- Other User Avatar -->
								<div class="avatar">
									<div class="w-12 rounded-full">
										{#if conversation.other_user.profile_pic_url}
											<img
												src={conversation.other_user.profile_pic_url}
												alt={conversation.other_user.display_name}
											/>
										{:else}
											<div
												class="flex h-full w-full items-center justify-center bg-primary text-primary-content"
											>
												{conversation.other_user.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>

								<!-- Conversation Info -->
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center justify-between">
										<h3 class="truncate font-semibold">
											{conversation.other_user.display_name}
										</h3>
										<time class="text-xs text-base-content/60">
											{formatRelativeTime(conversation.last_message_at)}
										</time>
									</div>

									<p class="text-sm text-base-content/60">@{conversation.other_user.username}</p>

									{#if conversation.last_message}
										<p class="mt-1 truncate text-sm text-base-content/80">
											{#if conversation.last_message.sender_id === $user.id}
												You: {conversation.last_message.content}
											{:else}
												{conversation.last_message.content}
											{/if}
										</p>
									{:else}
										<p class="text-sm text-base-content/60 italic">No messages yet</p>
									{/if}
								</div>

								<!-- Unread Indicator -->
								{#if conversation.last_message && !conversation.last_message.read && conversation.last_message.sender_id !== $user.id}
									<div class="h-3 w-3 rounded-full bg-primary"></div>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}
