import { supabase } from './supabase.js';
import { user } from './stores.js';
import { get } from 'svelte/store';

/**
 * @typedef {Object} Conversation
 * @property {string} id
 * @property {string} user1_id
 * @property {string} user2_id
 * @property {string} last_message_at
 * @property {Object} other_user
 * @property {Object} last_message
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} conversation_id
 * @property {string} sender_id
 * @property {string} content
 * @property {boolean} read
 * @property {string} created_at
 * @property {Object} sender
 */

/**
 * Get or create a conversation between current user and another user
 * @param {string} otherUserId - ID of the other user
 * @returns {Promise<{data: Conversation, error: any}>}
 */
export async function getOrCreateConversation(otherUserId) {
	const currentUser = get(user);
	if (!currentUser) {
		return { data: null, error: 'Not authenticated' };
	}

	try {
		// First try to find existing conversation
		const { data: existingConversation, error: findError } = await supabase
			.from('conversations')
			.select(`
				*,
				user1:user1_id (
					id,
					username,
					display_name,
					profile_pic_url
				),
				user2:user2_id (
					id,
					username,
					display_name,
					profile_pic_url
				)
			`)
			.or(`and(user1_id.eq.${currentUser.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUser.id})`)
			.single();

		if (existingConversation) {
			// Determine which user is the "other" user
			const otherUser = existingConversation.user1.id === currentUser.id 
				? existingConversation.user2 
				: existingConversation.user1;
			
			return { 
				data: { 
					...existingConversation, 
					other_user: otherUser 
				}, 
				error: null 
			};
		}

		// Create new conversation if none exists
		const { data: newConversation, error: createError } = await supabase
			.from('conversations')
			.insert({
				user1_id: currentUser.id,
				user2_id: otherUserId
			})
			.select(`
				*,
				user1:user1_id (
					id,
					username,
					display_name,
					profile_pic_url
				),
				user2:user2_id (
					id,
					username,
					display_name,
					profile_pic_url
				)
			`)
			.single();

		if (createError) throw createError;

		const otherUser = newConversation.user2;
		
		return { 
			data: { 
				...newConversation, 
				other_user: otherUser 
			}, 
			error: null 
		};
	} catch (error) {
		console.error('Error getting/creating conversation:', error);
		return { data: null, error: error.message };
	}
}

/**
 * Get all conversations for the current user
 * @returns {Promise<{data: Conversation[], error: any}>}
 */
export async function getUserConversations() {
	const currentUser = get(user);
	if (!currentUser) {
		return { data: [], error: 'Not authenticated' };
	}

	try {
		const { data, error } = await supabase
			.from('conversations')
			.select(`
				*,
				user1:user1_id (
					id,
					username,
					display_name,
					profile_pic_url
				),
				user2:user2_id (
					id,
					username,
					display_name,
					profile_pic_url
				),
				messages (
					id,
					content,
					created_at,
					sender_id,
					read
				)
			`)
			.or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
			.order('last_message_at', { ascending: false });

		if (error) throw error;

		// Process conversations to add other_user and last_message
		const processedConversations = data.map(conversation => {
			const otherUser = conversation.user1.id === currentUser.id 
				? conversation.user2 
				: conversation.user1;
			
			const lastMessage = conversation.messages.length > 0 
				? conversation.messages[conversation.messages.length - 1]
				: null;

			return {
				...conversation,
				other_user: otherUser,
				last_message: lastMessage
			};
		});

		return { data: processedConversations, error: null };
	} catch (error) {
		console.error('Error getting conversations:', error);
		return { data: [], error: error.message };
	}
}

/**
 * Get messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {number} limit - Number of messages to fetch
 * @param {number} offset - Offset for pagination
 * @returns {Promise<{data: Message[], error: any}>}
 */
export async function getConversationMessages(conversationId, limit = 50, offset = 0) {
	try {
		const { data, error } = await supabase
			.from('messages')
			.select(`
				*,
				sender:sender_id (
					id,
					username,
					display_name,
					profile_pic_url
				)
			`)
			.eq('conversation_id', conversationId)
			.order('created_at', { ascending: true })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		return { data: data || [], error: null };
	} catch (error) {
		console.error('Error getting messages:', error);
		return { data: [], error: error.message };
	}
}

/**
 * Send a message
 * @param {string} conversationId - Conversation ID
 * @param {string} content - Message content
 * @returns {Promise<{data: Message, error: any}>}
 */
export async function sendMessage(conversationId, content) {
	const currentUser = get(user);
	if (!currentUser) {
		return { data: null, error: 'Not authenticated' };
	}

	try {
		const { data, error } = await supabase
			.from('messages')
			.insert({
				conversation_id: conversationId,
				sender_id: currentUser.id,
				content: content.trim()
			})
			.select(`
				*,
				sender:sender_id (
					id,
					username,
					display_name,
					profile_pic_url
				)
			`)
			.single();

		if (error) throw error;

		return { data, error: null };
	} catch (error) {
		console.error('Error sending message:', error);
		return { data: null, error: error.message };
	}
}

/**
 * Mark messages as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function markMessagesAsRead(conversationId) {
	const currentUser = get(user);
	if (!currentUser) {
		return { success: false, error: 'Not authenticated' };
	}

	try {
		const { error } = await supabase
			.from('messages')
			.update({ read: true })
			.eq('conversation_id', conversationId)
			.neq('sender_id', currentUser.id)
			.eq('read', false);

		if (error) throw error;

		return { success: true, error: null };
	} catch (error) {
		console.error('Error marking messages as read:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Subscribe to real-time messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Function} onMessage - Callback for new messages
 * @returns {Object} Subscription object
 */
export function subscribeToMessages(conversationId, onMessage) {
	console.log('Setting up message subscription for conversation:', conversationId);
	
	const channel = supabase
		.channel(`messages:${conversationId}`)
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'messages',
				filter: `conversation_id=eq.${conversationId}`
			},
			async (payload) => {
				console.log('Real-time message received:', payload);
				
				if (!payload?.new?.id) {
					console.warn('Invalid payload structure:', payload);
					return;
				}
				
				try {
					// Fetch the full message with sender data
					const { data, error } = await supabase
						.from('messages')
						.select(`
							*,
							sender:sender_id (
								id,
								username,
								display_name,
								profile_pic_url
							)
						`)
						.eq('id', payload.new.id)
						.single();

					if (error) {
						console.error('Error fetching message for real-time update:', error);
						return;
					}
					
					if (data) {
						onMessage(data);
					}
				} catch (error) {
					console.error('Error in message subscription handler:', error);
				}
			}
		)
		.subscribe((status) => {
			console.log('Message subscription status:', status);
		});
	
	return channel;
}

/**
 * Get unread message count for current user
 * @returns {Promise<{count: number, error: any}>}
 */
export async function getUnreadMessageCount() {
	const currentUser = get(user);
	if (!currentUser) {
		return { count: 0, error: 'Not authenticated' };
	}

	try {
		// First, get the user's conversation IDs
		const { data: conversations, error: convError } = await supabase
			.from('conversations')
			.select('id')
			.or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`);

		if (convError) throw convError;

		// If no conversations, return 0
		if (!conversations || conversations.length === 0) {
			return { count: 0, error: null };
		}

		// Get conversation IDs as array
		const conversationIds = conversations.map(conv => conv.id);

		// Now get unread message count
		const { data, error } = await supabase
			.from('messages')
			.select('id', { count: 'exact', head: true })
			.neq('sender_id', currentUser.id)
			.eq('read', false)
			.in('conversation_id', conversationIds);

		if (error) throw error;

		return { count: data || 0, error: null };
	} catch (error) {
		console.error('Error getting unread count:', error);
		return { count: 0, error: error.message };
	}
}