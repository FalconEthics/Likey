<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { user, currentMessages, currentConversationId } from '$lib/stores.js';
	import { 
		getConversationMessages, 
		sendMessage, 
		markMessagesAsRead, 
		subscribeToMessages 
	} from '$lib/messages.js';
	import { formatRelativeTime } from '$lib/utils.js';
	
	// Lucide Icons
	import { ArrowLeft, Send, MessageCircle } from 'lucide-svelte';

	let conversationId = $page.params.conversationId;
	let messageInput = $state('');
	let sending = $state(false);
	let loading = $state(true);
	let messagesContainer = $state();
	let messageSubscription = null;
	let otherUser = $state(null);

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
					const otherMessage = data.find(msg => msg.sender.id !== $user.id);
					otherUser = otherMessage ? otherMessage.sender : null;
				}
			}
			
			// Mark messages as read
			await markMessagesAsRead(conversationId);
			
			// Force scroll to bottom on initial load
			await forceScrollToBottom();
		}
		
		loading = false;
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
		
		currentMessages.update(messages => [...messages, tempMessage]);
		await tick();
		scrollToBottom();
		
		const { data, error } = await sendMessage(conversationId, content);
		
		if (!error && data) {
			// Replace temp message with real message
			currentMessages.update(messages => 
				messages.map(msg => 
					msg.id === tempMessage.id ? data : msg
				)
			);
		} else {
			// Handle access denied errors
			if (error === 'Access denied' || error === 'Conversation not found') {
				console.error('Unauthorized send attempt:', error);
				goto('/messages'); // Redirect to messages list
				return;
			}
			
			// Remove temp message and restore input on error
			currentMessages.update(messages => 
				messages.filter(msg => msg.id !== tempMessage.id)
			);
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
		const messageExists = $currentMessages.some(msg => msg.id === message.id);
		if (messageExists) {
			console.log('Message already exists, skipping');
			return;
		}
		
		// Remove any temp messages from the sender (if it was us)
		if (message.sender.id === $user.id) {
			currentMessages.update(messages => 
				messages.filter(msg => !msg.sending)
			);
		}
		
		currentMessages.update(messages => [...messages, message]);
		
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
		scrollToBottom();
		
		// Fallback: try again after a short delay
		setTimeout(() => {
			scrollToBottom();
		}, 100);
		
		// Final fallback: try once more after DOM updates
		setTimeout(() => {
			scrollToBottom();
		}, 300);
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

	// Effect to scroll to bottom when messages change
	$effect(() => {
		if ($currentMessages.length > 0 && messagesContainer) {
			// Only auto-scroll if user is near the bottom (not scrolled up to read old messages)
			const isNearBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 100;
			if (isNearBottom || $currentMessages.length === 1) {
				scrollToBottom();
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
	<div class="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
		<!-- Header -->
		<div class="flex items-center gap-4 p-4 border-b border-base-300 bg-base-100">
			<button 
				class="btn btn-ghost btn-circle"
				onclick={() => goto('/messages')}
			>
				<ArrowLeft size={20} />
			</button>
			
			{#if otherUser}
				<div class="avatar">
					<div class="w-10 rounded-full">
						{#if otherUser.profile_pic_url}
							<img src={otherUser.profile_pic_url} alt={otherUser.display_name} />
						{:else}
							<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full">
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
				<div class="skeleton h-10 w-10 rounded-full"></div>
				<div>
					<div class="skeleton h-4 w-24 mb-1"></div>
					<div class="skeleton h-3 w-16"></div>
				</div>
			{/if}
		</div>

		<!-- Messages -->
		<div 
			class="flex-1 overflow-y-auto p-4 space-y-4" 
			bind:this={messagesContainer}
		>
			{#if loading}
				<div class="flex justify-center py-8">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			{:else if $currentMessages.length === 0}
				<div class="text-center py-8">
					<MessageCircle size={48} class="mx-auto mb-4 text-base-content/40" />
					<p class="text-base-content/60">No messages yet. Start the conversation!</p>
				</div>
			{:else}
				{#each $currentMessages as message, index (message.id)}
					{@const isCurrentUser = message.sender.id === $user.id}
					{@const prevMessage = index > 0 ? $currentMessages[index - 1] : null}
					{@const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id}
					
					<div class="flex gap-2" class:flex-row-reverse={isCurrentUser}>
						<!-- Avatar -->
						<div class="flex-shrink-0">
							{#if showAvatar && !isCurrentUser}
								<div class="avatar">
									<div class="w-8 rounded-full">
										{#if message.sender.profile_pic_url}
											<img src={message.sender.profile_pic_url} alt={message.sender.display_name} />
										{:else}
											<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
												{message.sender.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>
							{:else}
								<div class="w-8"></div>
							{/if}
						</div>
						
						<!-- Message Bubble -->
						<div class="max-w-xs lg:max-w-md">
							<div 
								class="px-4 py-2 rounded-2xl relative"
								class:bg-primary={isCurrentUser}
								class:opacity-70={message.sending}
								class:text-primary-content={isCurrentUser}
								class:bg-base-200={!isCurrentUser}
								class:text-base-content={!isCurrentUser}
							>
								<p class="text-sm" class:opacity-70={message.sending}>{message.content}</p>
								{#if message.sending}
									<div class="absolute -bottom-1 -right-1">
										<span class="loading loading-spinner loading-xs"></span>
									</div>
								{/if}
							</div>
							
							{#if showAvatar || index === $currentMessages.length - 1}
								<p class="text-xs text-base-content/60 mt-1" class:text-right={isCurrentUser}>
									{formatMessageTime(message.created_at)}
								</p>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Message Input -->
		<div class="p-4 border-t border-base-300 bg-base-100">
			<form onsubmit={handleSendMessage} class="flex gap-2">
				<input 
					type="text" 
					placeholder="Type a message..." 
					class="input input-bordered flex-1"
					bind:value={messageInput}
					disabled={sending}
					autocomplete="off"
				/>
				<button 
					type="submit" 
					class="btn btn-primary"
					class:loading={sending}
					disabled={sending || !messageInput.trim()}
				>
					{#if sending}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<Send size={20} />
					{/if}
				</button>
			</form>
		</div>
	</div>
{/if}

<style>
	/* Hide scrollbar but keep functionality */
	.overflow-y-auto {
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
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
	}
</style>