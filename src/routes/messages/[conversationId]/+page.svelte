<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user, currentMessages, currentConversationId } from '$lib/stores.js';
	import {
		getConversationMessages,
		sendMessage,
		markMessagesAsRead,
		subscribeToMessages,
		deleteMessage,
		editMessage,
		canModifyMessage
	} from '$lib/messages.js';
	import { formatRelativeTime } from '$lib/utils.js';
	import ForwardMessageModal from '$lib/components/ForwardMessageModal.svelte';

	// Lucide Icons
	import {
		ArrowLeft,
		Send,
		MessageCircle,
		MoreVertical,
		Edit,
		Trash2,
		Forward
	} from 'lucide-svelte';

	let conversationId = $page.params.conversationId;
	let messageInput = $state('');
	let sending = $state(false);
	let loading = $state(true);
	let messagesContainer = $state();
	let messageSubscription = null;
	let otherUser = $state(null);

	// Message management state
	let editingMessageId = $state(null);
	let editingContent = $state('');
	let showContextMenu = $state(null); // messageId or null
	let deletingMessageId = $state(null);
	let forwardingMessageId = $state(null);

	// Forward modal state
	let showForwardModal = $state(false);
	let forwardMessage = $state(null);

	$effect(() => {
		if (!$user) {
			goto('/');
		}
	});

	$effect(() => {
		currentConversationId.set(conversationId);
	});

	/**
	 * Load messages for the conversation
	 */
	async function loadMessages() {
		loading = true;

		const { data, error } = await getConversationMessages(conversationId);

		if (error) {
			// Handle access denied or conversation not found
			if (error === 'Access denied' || error === 'Conversation not found') {
				console.error('Unauthorized access to conversation:', conversationId);
				goto('/messages'); // Redirect to messages list
				return;
			}
			console.error('Error loading messages:', error);
			loading = false;
			return;
		}

		if (data) {
			currentMessages.set(data);

			// Get other user info from first message
			if (data.length > 0) {
				const firstMessage = data[0];
				if (firstMessage.sender.id !== $user.id) {
					otherUser = firstMessage.sender;
				} else {
					// Find a message from the other user
					const otherMessage = data.find((msg) => msg.sender.id !== $user.id);
					otherUser = otherMessage ? otherMessage.sender : null;
				}
			}

			// Mark messages as read
			await markMessagesAsRead(conversationId);
		}

		loading = false;

		// Wait for loading to finish and DOM to update, then scroll to bottom
		if (data && data.length > 0) {
			await tick(); // Wait for DOM updates
			setTimeout(() => {
				forceScrollToBottom();
			}, 100); // Additional delay to ensure all messages are rendered
		}
	}

	/**
	 * Send a new message
	 * @param {Event} event
	 */
	async function handleSendMessage(event) {
		event.preventDefault();

		if (!messageInput.trim() || sending) return;

		sending = true;
		const content = messageInput.trim();
		messageInput = '';

		// Optimistically add message to local state
		const tempMessage = {
			id: 'temp-' + Date.now(),
			content,
			created_at: new Date().toISOString(),
			sender: {
				id: $user.id,
				username: $user.username,
				display_name: $user.display_name,
				profile_pic_url: $user.profile_pic_url
			},
			conversation_id: conversationId,
			sending: true // Mark as optimistic
		};

		currentMessages.update((messages) => [...messages, tempMessage]);
		await tick();
		scrollToBottom();

		const { data, error } = await sendMessage(conversationId, content);

		if (!error && data) {
			// Replace temp message with real message
			currentMessages.update((messages) =>
				messages.map((msg) => (msg.id === tempMessage.id ? data : msg))
			);
		} else {
			// Handle access denied errors
			if (error === 'Access denied' || error === 'Conversation not found') {
				console.error('Unauthorized send attempt:', error);
				goto('/messages'); // Redirect to messages list
				return;
			}

			// Remove temp message and restore input on error
			currentMessages.update((messages) => messages.filter((msg) => msg.id !== tempMessage.id));
			messageInput = content;
			console.error('Failed to send message:', error);
		}

		sending = false;
	}

	/**
	 * Handle new message from subscription
	 * @param {Object} message
	 */
	function handleNewMessage(message) {
		console.log('Received real-time message:', message);

		// Check if this message already exists (avoid duplicates)
		const messageExists = $currentMessages.some((msg) => msg.id === message.id);
		if (messageExists) {
			console.log('Message already exists, skipping');
			return;
		}

		// Remove any temp messages from the sender (if it was us)
		if (message.sender.id === $user.id) {
			currentMessages.update((messages) => messages.filter((msg) => !msg.sending));
		}

		currentMessages.update((messages) => [...messages, message]);

		// Mark as read if not from current user
		if (message.sender.id !== $user.id) {
			markMessagesAsRead(conversationId);
		}

		tick().then(() => scrollToBottom());
	}

	/**
	 * Scroll to bottom of messages with better timing
	 */
	function scrollToBottom() {
		if (messagesContainer) {
			// Use requestAnimationFrame for better timing
			requestAnimationFrame(() => {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			});
		}
	}

	/**
	 * Force scroll to bottom with multiple attempts (for initial load)
	 */
	async function forceScrollToBottom() {
		await tick();
		
		// Immediate scroll
		scrollToBottom();

		// Multiple attempts to ensure we scroll to bottom after all content loads
		const scrollAttempts = [50, 150, 300, 500];
		
		scrollAttempts.forEach(delay => {
			setTimeout(() => {
				if (messagesContainer) {
					messagesContainer.scrollTop = messagesContainer.scrollHeight;
				}
			}, delay);
		});
	}

	/**
	 * Format message time
	 * @param {string} timestamp
	 * @returns {string}
	 */
	function formatMessageTime(timestamp) {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now - date;
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else if (diffDays === 1) {
			return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else {
			return date.toLocaleDateString();
		}
	}

	/**
	 * Start editing a message
	 * @param {Object} message
	 */
	function startEditMessage(message) {
		editingMessageId = message.id;
		editingContent = message.content;
		showContextMenu = null;
	}

	/**
	 * Save edited message
	 * @param {Event} event
	 */
	async function saveEditMessage(event) {
		event.preventDefault();

		if (!editingContent.trim() || !editingMessageId) return;

		const { data, error } = await editMessage(editingMessageId, editingContent);

		if (!error && data) {
			// Update message in local state
			currentMessages.update((messages) =>
				messages.map((msg) => (msg.id === editingMessageId ? data : msg))
			);
			cancelEdit();
		} else {
			console.error('Failed to edit message:', error);
			alert(error || 'Failed to edit message');
		}
	}

	/**
	 * Cancel editing
	 */
	function cancelEdit() {
		editingMessageId = null;
		editingContent = '';
	}

	/**
	 * Delete a message
	 * @param {string} messageId
	 */
	async function handleDeleteMessage(messageId) {
		const confirmed = confirm('Delete this message? This action cannot be undone.');
		if (!confirmed) return;

		deletingMessageId = messageId;
		showContextMenu = null;

		const { success, error } = await deleteMessage(messageId);

		if (success) {
			// Remove message from local state
			currentMessages.update((messages) => messages.filter((msg) => msg.id !== messageId));
		} else {
			console.error('Failed to delete message:', error);
			alert(error || 'Failed to delete message');
		}

		deletingMessageId = null;
	}

	/**
	 * Start forwarding a message
	 * @param {Object} message
	 */
	function startForwardMessage(message) {
		forwardMessage = message;
		showForwardModal = true;
		showContextMenu = null;
	}

	/**
	 * Toggle context menu for a message
	 * @param {string} messageId
	 */
	function toggleContextMenu(messageId) {
		showContextMenu = showContextMenu === messageId ? null : messageId;
	}

	/**
	 * Handle long press / right click for context menu
	 * @param {Event} event
	 * @param {string} messageId
	 */
	function handleContextMenu(event, messageId) {
		event.preventDefault();
		toggleContextMenu(messageId);
	}

	/**
	 * Handle touch start for long press detection
	 * @param {TouchEvent} event
	 * @param {string} messageId
	 */
	let longPressTimer = null;
	function handleTouchStart(event, messageId) {
		longPressTimer = setTimeout(() => {
			// Trigger haptic feedback if available
			if (navigator.vibrate) {
				navigator.vibrate(50);
			}
			toggleContextMenu(messageId);
		}, 500); // 500ms long press
	}

	/**
	 * Handle touch end - cancel long press if needed
	 */
	function handleTouchEnd() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	/**
	 * Handle touch move - cancel long press if finger moves
	 */
	function handleTouchMove() {
		if (longPressTimer) {
			clearTimeout(longPressTimer);
			longPressTimer = null;
		}
	}

	/**
	 * Close context menu when clicking elsewhere
	 * @param {Event} event
	 */
	function handleClickOutside(event) {
		if (!event.target.closest('.context-menu-container')) {
			showContextMenu = null;
		}
	}

	// Effect to scroll to bottom when messages change
	$effect(() => {
		if ($currentMessages.length > 0 && messagesContainer && !loading) {
			// For initial load, always scroll to bottom
			// For subsequent messages, only scroll if user is near bottom
			const isInitialLoad = messagesContainer.scrollTop === 0 && messagesContainer.scrollHeight > messagesContainer.clientHeight;
			const isNearBottom =
				messagesContainer.scrollTop + messagesContainer.clientHeight >=
				messagesContainer.scrollHeight - 100;
			
			if (isInitialLoad || isNearBottom) {
				// Use a small delay to ensure DOM is fully updated
				setTimeout(() => {
					scrollToBottom();
				}, 50);
			}
		}
	});

	onMount(() => {
		if ($user && conversationId) {
			loadMessages();

			// Subscribe to real-time messages
			messageSubscription = subscribeToMessages(conversationId, handleNewMessage);
		}
	});

	onDestroy(() => {
		if (messageSubscription) {
			messageSubscription.unsubscribe();
		}
		currentConversationId.set(null);
		currentMessages.set([]);
	});
</script>

<svelte:head>
	<title>{otherUser ? `${otherUser.display_name} - Messages` : 'Messages'} - Likey</title>
</svelte:head>

{#if $user}
	<div
		class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-4xl flex-col"
		onclick={handleClickOutside}
		onkeydown={handleClickOutside}
		role="main"
	>
		<!-- Header -->
		<div
			class="sticky top-0 z-50 flex items-center gap-4 border-b border-base-300/50 bg-base-100/95 p-4 backdrop-blur-xl"
		>
			<button class="btn btn-circle btn-ghost" onclick={() => goto('/messages')}>
				<ArrowLeft size={20} />
			</button>

			{#if otherUser}
				<div class="avatar">
					<div class="w-10 rounded-full">
						{#if otherUser.profile_pic_url}
							<img src={otherUser.profile_pic_url} alt={otherUser.display_name} />
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-primary text-primary-content"
							>
								{otherUser.display_name?.charAt(0).toUpperCase() || 'U'}
							</div>
						{/if}
					</div>
				</div>

				<div>
					<h2 class="font-semibold">{otherUser.display_name}</h2>
					<p class="text-sm text-base-content/60">@{otherUser.username}</p>
				</div>
			{:else}
				<div class="h-10 w-10 skeleton rounded-full"></div>
				<div>
					<div class="mb-1 h-4 w-24 skeleton"></div>
					<div class="h-3 w-16 skeleton"></div>
				</div>
			{/if}
		</div>

		<!-- Messages -->
		<div 
			class="flex-1 space-y-4 p-4 overflow-y-auto scroll-smooth" 
			bind:this={messagesContainer}
		>
			{#if loading}
				<div class="flex justify-center py-8">
					<span class="loading loading-md loading-spinner"></span>
				</div>
			{:else if $currentMessages.length === 0}
				<div class="py-8 text-center">
					<MessageCircle size={48} class="mx-auto mb-4 text-base-content/40" />
					<p class="text-base-content/60">No messages yet. Start the conversation!</p>
				</div>
			{:else}
				{#each $currentMessages as message, index (message.id)}
					{@const isCurrentUser = message.sender.id === $user.id}
					{@const prevMessage = index > 0 ? $currentMessages[index - 1] : null}
					{@const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id}

					<div class="flex gap-3" class:justify-end={isCurrentUser}>
						{#if !isCurrentUser}
							<!-- Avatar for incoming messages -->
							<div class="flex-shrink-0">
								{#if showAvatar}
									<div class="avatar">
										<div class="w-8 rounded-full">
											{#if message.sender.profile_pic_url}
												<img
													src={message.sender.profile_pic_url}
													alt={message.sender.display_name}
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-content"
												>
													{message.sender.display_name?.charAt(0).toUpperCase() || 'U'}
												</div>
											{/if}
										</div>
									</div>
								{:else}
									<div class="w-8"></div>
								{/if}
							</div>
						{/if}

						<!-- Message Bubble -->
						<div
							class="relative max-w-xs lg:max-w-md"
							class:ml-auto={isCurrentUser}
							class:mr-3={isCurrentUser}
						>
							{#if editingMessageId === message.id}
								<!-- Edit Mode -->
								<form onsubmit={saveEditMessage} class="space-y-2">
									<textarea
										bind:value={editingContent}
										class="textarea-bordered textarea w-full resize-none textarea-sm"
										rows="2"
										required
									></textarea>
									<div class="flex justify-end gap-2">
										<button type="button" class="btn btn-ghost btn-xs" onclick={cancelEdit}>
											Cancel
										</button>
										<button
											type="submit"
											class="btn btn-xs btn-primary"
											disabled={!editingContent.trim()}
										>
											Save
										</button>
									</div>
								</form>
							{:else}
								<!-- Normal Message Display -->
								<div class="relative">
									<div
										class="context-menu-container modern-message-bubble relative cursor-pointer rounded-2xl px-4 py-3 select-none"
										class:current-user={isCurrentUser}
										class:other-user={!isCurrentUser}
										class:opacity-70={message.sending}
										oncontextmenu={(e) => !message.sending && handleContextMenu(e, message.id)}
										ontouchstart={(e) => !message.sending && handleTouchStart(e, message.id)}
										ontouchend={handleTouchEnd}
										ontouchmove={handleTouchMove}
										role="button"
										tabindex="0"
									>
										<p class="text-sm" class:opacity-70={message.sending}>
											{message.content}
											{#if message.edited_at}
												<span class="ml-2 text-xs opacity-60">(edited)</span>
											{/if}
											{#if message.forwarded_from}
												<span class="ml-2 text-xs opacity-60">↻ forwarded</span>
											{/if}
										</p>
										{#if message.sending}
											<div class="absolute -right-1 -bottom-1">
												<span class="loading loading-xs loading-spinner"></span>
											</div>
										{/if}
									</div>

									<!-- Context Menu (shows for all messages) -->
									{#if showContextMenu === message.id && !message.sending}
										<div class="absolute top-0 right-0 z-20">
											<div
												class="menu w-36 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg"
											>
												{#if isCurrentUser && canModifyMessage(message.created_at)}
													<li>
														<button
															onclick={() => startEditMessage(message)}
															class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-base-200"
														>
															<Edit size={14} />
															Edit
														</button>
													</li>
													<li>
														<button
															onclick={() => handleDeleteMessage(message.id)}
															class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm text-error hover:bg-base-200"
															class:loading={deletingMessageId === message.id}
															disabled={deletingMessageId === message.id}
														>
															{#if deletingMessageId !== message.id}
																<Trash2 size={14} />
																Delete
															{/if}
														</button>
													</li>
												{/if}
												<li>
													<button
														onclick={() => startForwardMessage(message)}
														class="flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm hover:bg-base-200"
													>
														<Forward size={14} />
														Forward
													</button>
												</li>
											</div>
										</div>
									{/if}
								</div>
							{/if}

							{#if showAvatar || index === $currentMessages.length - 1}
								<p class="mt-1 text-xs text-base-content/60" class:text-right={isCurrentUser}>
									{formatMessageTime(message.created_at)}
								</p>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Message Input -->
		<div
			class="sticky bottom-0 z-50 border-t border-base-300/50 bg-base-100/95 p-4 backdrop-blur-xl"
		>
			<form onsubmit={handleSendMessage} class="flex gap-2">
				<input
					type="text"
					placeholder="Type a message..."
					class="input-bordered input flex-1 bg-base-200/50 focus:bg-base-200/80"
					bind:value={messageInput}
					disabled={sending}
					autocomplete="off"
				/>
				<button
					type="submit"
					class="btn btn-primary disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-600 disabled:opacity-50"
					class:loading={sending}
					disabled={sending || !messageInput.trim()}
				>
					{#if sending}
						<span class="loading loading-sm loading-spinner"></span>
					{:else}
						<Send size={20} />
					{/if}
				</button>
			</form>
		</div>
	</div>

	<!-- Forward Message Modal -->
	{#if forwardMessage}
		<ForwardMessageModal
			bind:show={showForwardModal}
			messageId={forwardMessage.id}
			messageContent={forwardMessage.content}
		/>
	{/if}
{/if}

<style>
	/* Messages container scroll styling */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
		scroll-behavior: smooth;
	}

	.overflow-y-auto::-webkit-scrollbar {
		width: 6px;
	}

	.overflow-y-auto::-webkit-scrollbar-track {
		background: transparent;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
		transition: background-color 0.2s ease;
	}

	.overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(0, 0, 0, 0.3);
	}

	/* Dark theme scrollbar */
	[data-theme='dark'] .overflow-y-auto {
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}

	[data-theme='dark'] .overflow-y-auto::-webkit-scrollbar-thumb {
		background-color: rgba(255, 255, 255, 0.2);
	}

	[data-theme='dark'] .overflow-y-auto::-webkit-scrollbar-thumb:hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	/* Modern Message Bubbles */
	.modern-message-bubble {
		transition: all 0.2s ease;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
		border: 1px solid transparent;
	}

	.modern-message-bubble.current-user {
		background: linear-gradient(135deg, hsl(346 77% 49%) 0%, hsl(340 70% 65%) 100%);
		color: white;
		box-shadow: 0 4px 12px hsl(346 77% 49% / 0.3);
	}

	.modern-message-bubble.other-user {
		background: hsl(var(--base-200) / 0.8);
		color: hsl(var(--base-content));
		border: 1px solid hsl(var(--base-300) / 0.5);
	}

	.modern-message-bubble:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
	}

	.modern-message-bubble.current-user:hover {
		box-shadow: 0 6px 20px hsl(346 77% 49% / 0.4);
	}

	/* Dark theme adjustments */
	[data-theme='dark'] .modern-message-bubble.other-user {
		background: hsl(var(--base-300) / 0.6);
		border: 1px solid hsl(var(--base-300) / 0.3);
	}

	[data-theme='dark'] .modern-message-bubble:hover {
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
	}

	/* Enhanced message input styling for dark theme */
	[data-theme='dark'] .input:focus {
		background: hsl(var(--base-200) / 0.9);
		border-color: hsl(346 77% 65% / 0.5);
	}
</style>
