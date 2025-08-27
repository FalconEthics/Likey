<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	import { user } from '$lib/stores.js';
	import { forwardMessage } from '$lib/messages.js';
	import { goto } from '$app/navigation';

	/** @type {boolean} */
	let { show = $bindable(false), messageId, messageContent } = $props();

	/** @type {Array<{id: string, username: string, avatar_url?: string, last_message_time?: string}>} */
	let conversations = $state([]);
	let loading = $state(true);
	let forwarding = $state(false);

	onMount(() => {
		if (show) {
			loadConversations();
		}
	});

	$effect(() => {
		if (show) {
			loadConversations();
		}
	});

	async function loadConversations() {
		if (!$user) return;

		try {
			loading = true;

			// Get all conversations ordered by last message time
			const { data: conversationData, error: convError } = await supabase
				.from('conversations')
				.select(
					`
          id,
          user1_id,
          user2_id,
          updated_at,
          user1:profiles!conversations_user1_id_fkey(id, username, display_name, avatar_url),
          user2:profiles!conversations_user2_id_fkey(id, username, display_name, avatar_url)
        `
				)
				.or(`user1_id.eq.${$user.id},user2_id.eq.${$user.id}`)
				.order('updated_at', { ascending: false });

			if (convError) throw convError;

			// Transform conversations to get the other user's info
			conversations = conversationData.map((conv) => {
				const otherUser = conv.user1_id === $user.id ? conv.user2 : conv.user1;

				return {
					id: conv.id,
					username: otherUser.username,
					display_name: otherUser.display_name,
					avatar_url: otherUser.avatar_url,
					last_message_time: conv.updated_at
				};
			});
		} catch (error) {
			console.error('Error loading conversations:', error);
		} finally {
			loading = false;
		}
	}

	async function handleForward(conversationId) {
		if (!messageId || forwarding) return;

		try {
			forwarding = true;

			const result = await forwardMessage(messageId, conversationId);

			if (result.success) {
				// Navigate to the conversation
				goto(`/messages/${conversationId}`);
				show = false;
			} else {
				alert(result.error || 'Failed to forward message');
			}
		} catch (error) {
			console.error('Error forwarding message:', error);
			alert('Failed to forward message');
		} finally {
			forwarding = false;
		}
	}

	function closeModal() {
		show = false;
	}

	// Close modal on escape key
	function handleKeydown(event) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
		onclick={closeModal}
		onkeydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-labelledby="forward-modal-title"
		tabindex="-1"
	>
		<div
			class="flex max-h-[80vh] w-full max-w-md flex-col rounded-lg bg-base-100"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.stopPropagation()}
			role="document"
		>
			<!-- Header -->
			<div class="border-b border-base-200 p-4">
				<h2 id="forward-modal-title" class="text-lg font-semibold">Forward Message</h2>
				<p class="mt-1 text-sm text-base-content/60">Choose a conversation to forward to</p>
			</div>

			<!-- Message Preview -->
			<div class="bg-base-50 border-b border-base-200 p-4">
				<p class="text-sm text-base-content/80 italic">"{messageContent}"</p>
			</div>

			<!-- Conversation List -->
			<div class="flex-1 overflow-y-auto">
				{#if loading}
					<div class="p-8 text-center">
						<div class="loading loading-md loading-spinner"></div>
						<p class="mt-2 text-sm text-base-content/60">Loading conversations...</p>
					</div>
				{:else if conversations.length === 0}
					<div class="p-8 text-center">
						<p class="text-base-content/60">No conversations found</p>
						<p class="mt-2 text-sm text-base-content/40">
							Start a conversation first to forward messages
						</p>
					</div>
				{:else}
					<div class="divide-y divide-base-200">
						{#each conversations as conversation}
							<button
								class="flex w-full items-center gap-3 p-4 transition-colors hover:bg-base-200 disabled:opacity-50"
								onclick={() => handleForward(conversation.id)}
								disabled={forwarding}
							>
								<!-- Avatar -->
								<div class="avatar">
									<div class="h-10 w-10 rounded-full">
										{#if conversation.avatar_url}
											<img
												src={conversation.avatar_url}
												alt="{conversation.display_name}'s avatar"
												class="h-full w-full object-cover"
											/>
										{:else}
											<div
												class="flex h-full w-full items-center justify-center bg-primary text-lg font-semibold text-primary-content"
											>
												{conversation.display_name?.charAt(0).toUpperCase() ||
													conversation.username.charAt(0).toUpperCase()}
											</div>
										{/if}
									</div>
								</div>

								<!-- User Info -->
								<div class="flex-1 text-left">
									<p class="font-medium">{conversation.display_name || conversation.username}</p>
									<p class="text-sm text-base-content/60">@{conversation.username}</p>
									{#if conversation.last_message_time}
										<p class="text-xs text-base-content/40">
											Last active: {new Date(conversation.last_message_time).toLocaleDateString()}
										</p>
									{/if}
								</div>

								{#if forwarding}
									<div class="loading loading-sm loading-spinner"></div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer -->
			<div class="border-t border-base-200 p-4">
				<button class="btn w-full btn-outline" onclick={closeModal} disabled={forwarding}>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
