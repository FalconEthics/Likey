import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	getOrCreateConversation,
	getUserConversations,
	getConversationMessages,
	sendMessage,
	markMessagesAsRead,
	subscribeToMessages,
	getUnreadMessageCount,
	deleteMessage,
	editMessage,
	forwardMessage,
	canModifyMessage
} from './messages.js';

// Mock the dependencies
vi.mock('./supabase.js', () => ({
	supabase: {
		from: vi.fn(),
		channel: vi.fn()
	}
}));

vi.mock('./stores.js', () => ({
	user: { subscribe: vi.fn() }
}));

vi.mock('svelte/store', () => ({
	get: vi.fn()
}));

import { supabase } from './supabase.js';
import { get } from 'svelte/store';

describe('getOrCreateConversation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return error when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await getOrCreateConversation('user-456');

		expect(result).toEqual({
			data: null,
			error: 'Not authenticated'
		});
	});

	it('should return existing conversation when found', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const existingConversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456',
			user1: { id: 'user-123', username: 'current' },
			user2: { id: 'user-456', username: 'other' }
		};

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: existingConversation,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getOrCreateConversation('user-456');

		expect(result.data.other_user.username).toBe('other');
		expect(result.error).toBeNull();
	});

	it('should create new conversation when none exists', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		// Mock existing conversation check - returns PGRST116 error (no rows found)
		const existingSelectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: null,
					error: { code: 'PGRST116' }
				})
			})
		});

		// Mock new conversation creation
		const newConversation = {
			id: 'conv-456',
			user1_id: 'user-123',
			user2_id: 'user-456',
			user1: { id: 'user-123', username: 'current' },
			user2: { id: 'user-456', username: 'other' }
		};

		const insertMock = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: newConversation,
					error: null
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: existingSelectMock })
			.mockReturnValueOnce({ insert: insertMock });

		const result = await getOrCreateConversation('user-456');

		expect(result.data.id).toBe('conv-456');
		expect(result.data.other_user.username).toBe('other');
		expect(result.error).toBeNull();
	});

	it('should handle database errors', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: null,
					error: { message: 'Database error' }
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getOrCreateConversation('user-456');

		expect(result).toEqual({
			data: null,
			error: 'Database error'
		});

		consoleSpy.mockRestore();
	});
});

describe('getUserConversations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return error when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await getUserConversations();

		expect(result).toEqual({
			data: [],
			error: 'Not authenticated'
		});
	});

	it('should return processed conversations with other_user and last_message', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockConversations = [
			{
				id: 'conv-1',
				user1_id: 'user-123',
				user2_id: 'user-456',
				user1: { id: 'user-123', username: 'current' },
				user2: { id: 'user-456', username: 'other1' },
				messages: [
					{
						id: 'msg-1',
						content: 'Hello',
						created_at: '2024-01-01T10:00:00Z',
						sender_id: 'user-456',
						read: false
					}
				]
			},
			{
				id: 'conv-2',
				user1_id: 'user-789',
				user2_id: 'user-123',
				user1: { id: 'user-789', username: 'other2' },
				user2: { id: 'user-123', username: 'current' },
				messages: []
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				order: vi.fn().mockResolvedValue({
					data: mockConversations,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getUserConversations();

		expect(result.data).toHaveLength(2);
		expect(result.data[0].other_user.username).toBe('other1');
		expect(result.data[0].last_message.content).toBe('Hello');
		expect(result.data[1].other_user.username).toBe('other2');
		expect(result.data[1].last_message).toBeNull();
		expect(result.error).toBeNull();
	});

	it('should handle database errors', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				order: vi.fn().mockResolvedValue({
					data: null,
					error: { message: 'Database connection failed' }
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getUserConversations();

		expect(result).toEqual({
			data: [],
			error: 'Database connection failed'
		});

		consoleSpy.mockRestore();
	});
});

describe('getConversationMessages', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return error when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await getConversationMessages('conv-123');

		expect(result).toEqual({
			data: [],
			error: 'Not authenticated'
		});
	});

	it('should return messages for authorized user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const messages = [
			{
				id: 'msg-1',
				content: 'Hello',
				sender: { username: 'user1' }
			}
		];

		const conversationSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		const messagesSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					range: vi.fn().mockResolvedValue({
						data: messages,
						error: null
					})
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: conversationSelectMock })
			.mockReturnValueOnce({ select: messagesSelectMock });

		const result = await getConversationMessages('conv-123', 50, 0);

		expect(result.data).toEqual(messages);
		expect(result.error).toBeNull();
	});

	it('should deny access to unauthorized user', async () => {
		const currentUser = { id: 'user-999' };
		get.mockReturnValue(currentUser);

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const result = await getConversationMessages('conv-123');

		expect(result).toEqual({
			data: [],
			error: 'Access denied'
		});

		consoleWarnSpy.mockRestore();
	});

	it('should handle conversation not found', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: null,
					error: { code: 'PGRST116' }
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getConversationMessages('conv-999');

		expect(result).toEqual({
			data: [],
			error: 'Conversation not found'
		});

		consoleErrorSpy.mockRestore();
	});
});

describe('sendMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T10:00:00Z');
	});

	it('should return error when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await sendMessage('conv-123', 'Hello');

		expect(result).toEqual({
			data: null,
			error: 'Not authenticated'
		});
	});

	it('should send message successfully for authorized user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const newMessage = {
			id: 'msg-123',
			content: 'Hello',
			sender: { username: 'current' }
		};

		const conversationSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		const insertMock = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: newMessage,
					error: null
				})
			})
		});

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({ error: null })
		});

		supabase.from
			.mockReturnValueOnce({ select: conversationSelectMock })
			.mockReturnValueOnce({ insert: insertMock })
			.mockReturnValueOnce({ update: updateMock });

		const result = await sendMessage('conv-123', '  Hello  ');

		expect(insertMock).toHaveBeenCalledWith({
			conversation_id: 'conv-123',
			sender_id: 'user-123',
			content: 'Hello'
		});
		expect(result.data).toEqual(newMessage);
		expect(result.error).toBeNull();
	});

	it('should deny access to unauthorized user', async () => {
		const currentUser = { id: 'user-999' };
		get.mockReturnValue(currentUser);

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const result = await sendMessage('conv-123', 'Hello');

		expect(result).toEqual({
			data: null,
			error: 'Access denied'
		});

		consoleWarnSpy.mockRestore();
	});
});

describe('markMessagesAsRead', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return error when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await markMessagesAsRead('conv-123');

		expect(result).toEqual({
			success: false,
			error: 'Not authenticated'
		});
	});

	it('should mark messages as read for authorized user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const conversationSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnThis().mockReturnValue({
				neq: vi.fn().mockReturnValue({
					eq: vi.fn().mockResolvedValue({
						error: null
					})
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: conversationSelectMock })
			.mockReturnValueOnce({ update: updateMock });

		const result = await markMessagesAsRead('conv-123');

		expect(result).toEqual({
			success: true,
			error: null
		});
	});
});

describe('deleteMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock current time for testing time-based logic
		vi.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-01T10:05:00Z').getTime());
	});

	it('should return error when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await deleteMessage('msg-123');

		expect(result).toEqual({
			success: false,
			error: 'Not authenticated'
		});
	});

	it('should delete message successfully within time limit', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			sender_id: 'user-123',
			created_at: '2024-01-01T10:02:00Z', // 3 minutes ago
			conversation_id: 'conv-123'
		};

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const messageSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		const conversationSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		const deleteMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					error: null
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: messageSelectMock })
			.mockReturnValueOnce({ select: conversationSelectMock })
			.mockReturnValueOnce({ delete: deleteMock });

		const result = await deleteMessage('msg-123');

		expect(result).toEqual({
			success: true,
			error: null
		});
	});

	it('should reject deletion after time limit', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			sender_id: 'user-123',
			created_at: '2024-01-01T09:00:00Z', // Over 5 minutes ago
			conversation_id: 'conv-123'
		};

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await deleteMessage('msg-123');

		expect(result).toEqual({
			success: false,
			error: 'You can only delete messages within 5 minutes of sending'
		});
	});

	it('should reject deletion of other users messages', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			sender_id: 'user-456', // Different user
			created_at: '2024-01-01T10:02:00Z',
			conversation_id: 'conv-123'
		};

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const result = await deleteMessage('msg-123');

		expect(result).toEqual({
			success: false,
			error: 'You can only delete your own messages'
		});

		consoleWarnSpy.mockRestore();
	});
});

describe('editMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-01T10:05:00Z').getTime());
		vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T10:05:00Z');
	});

	it('should edit message successfully within time limit', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			sender_id: 'user-123',
			created_at: '2024-01-01T10:02:00Z',
			conversation_id: 'conv-123'
		};

		const conversation = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const updatedMessage = {
			id: 'msg-123',
			content: 'Updated content',
			sender: { username: 'current' }
		};

		const messageSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		const conversationSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: conversation,
					error: null
				})
			})
		});

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnThis().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					select: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: updatedMessage,
							error: null
						})
					})
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: messageSelectMock })
			.mockReturnValueOnce({ select: conversationSelectMock })
			.mockReturnValueOnce({ update: updateMock });

		const result = await editMessage('msg-123', '  Updated content  ');

		expect(updateMock).toHaveBeenCalledWith({
			content: 'Updated content',
			edited_at: '2024-01-01T10:05:00Z'
		});
		expect(result.data).toEqual(updatedMessage);
		expect(result.error).toBeNull();
	});

	it('should reject editing after time limit', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			sender_id: 'user-123',
			created_at: '2024-01-01T09:00:00Z', // Over 5 minutes ago
			conversation_id: 'conv-123'
		};

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await editMessage('msg-123', 'New content');

		expect(result).toEqual({
			data: null,
			error: 'You can only edit messages within 5 minutes of sending'
		});
	});
});

describe('forwardMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T10:00:00Z');
	});

	it('should forward message successfully', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			content: 'Original message',
			conversation_id: 'conv-123'
		};

		const sourceConv = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const targetConv = {
			id: 'conv-456',
			user1_id: 'user-123',
			user2_id: 'user-789'
		};

		const forwardedMessage = {
			id: 'msg-456',
			content: 'Original message',
			forwarded_from: 'msg-123',
			sender: { username: 'current' }
		};

		const messageSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		const sourceConvSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: sourceConv,
					error: null
				})
			})
		});

		const targetConvSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: targetConv,
					error: null
				})
			})
		});

		const insertMock = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: forwardedMessage,
					error: null
				})
			})
		});

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({ error: null })
		});

		supabase.from
			.mockReturnValueOnce({ select: messageSelectMock })
			.mockReturnValueOnce({ select: sourceConvSelectMock })
			.mockReturnValueOnce({ select: targetConvSelectMock })
			.mockReturnValueOnce({ insert: insertMock })
			.mockReturnValueOnce({ update: updateMock });

		const result = await forwardMessage('msg-123', 'conv-456');

		expect(insertMock).toHaveBeenCalledWith({
			conversation_id: 'conv-456',
			sender_id: 'user-123',
			content: 'Original message',
			forwarded_from: 'msg-123'
		});
		expect(result.data).toEqual(forwardedMessage);
		expect(result.error).toBeNull();
	});

	it('should deny forwarding without access to source conversation', async () => {
		const currentUser = { id: 'user-999' };
		get.mockReturnValue(currentUser);

		const message = {
			id: 'msg-123',
			content: 'Original message',
			conversation_id: 'conv-123'
		};

		const sourceConv = {
			id: 'conv-123',
			user1_id: 'user-123',
			user2_id: 'user-456'
		};

		const messageSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: message,
					error: null
				})
			})
		});

		const sourceConvSelectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: sourceConv,
					error: null
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: messageSelectMock })
			.mockReturnValueOnce({ select: sourceConvSelectMock });

		const result = await forwardMessage('msg-123', 'conv-456');

		expect(result).toEqual({
			data: null,
			error: 'Access denied to source conversation'
		});
	});
});

describe('canModifyMessage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(Date, 'now').mockReturnValue(new Date('2024-01-01T10:05:00Z').getTime());
	});

	it('should return true for messages within 5 minutes', () => {
		const recentTime = '2024-01-01T10:02:00Z'; // 3 minutes ago
		expect(canModifyMessage(recentTime)).toBe(true);
	});

	it('should return false for messages older than 5 minutes', () => {
		const oldTime = '2024-01-01T09:00:00Z'; // Over 5 minutes ago
		expect(canModifyMessage(oldTime)).toBe(false);
	});

	it('should return true for messages exactly at 5 minute mark', () => {
		const exactTime = '2024-01-01T10:00:00Z'; // Exactly 5 minutes ago
		expect(canModifyMessage(exactTime)).toBe(true);
	});
});

describe('subscribeToMessages', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should set up message subscription', () => {
		const mockChannel = {
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn()
		};

		supabase.channel.mockReturnValue(mockChannel);

		const onMessage = vi.fn();
		const result = subscribeToMessages('conv-123', onMessage);

		expect(supabase.channel).toHaveBeenCalledWith('messages:conv-123');
		expect(mockChannel.on).toHaveBeenCalledWith(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'messages',
				filter: 'conversation_id=eq.conv-123'
			},
			expect.any(Function)
		);
		expect(mockChannel.subscribe).toHaveBeenCalled();
		expect(result).toBe(mockChannel);
	});
});

describe('getUnreadMessageCount', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return 0 when not authenticated', async () => {
		get.mockReturnValue(null);

		const result = await getUnreadMessageCount();

		expect(result).toEqual({
			count: 0,
			error: 'Not authenticated'
		});
	});

	it('should return unread count for user with conversations', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const conversations = [
			{ id: 'conv-1' },
			{ id: 'conv-2' }
		];

		const conversationSelectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockResolvedValue({
				data: conversations,
				error: null
			})
		});

		const messageSelectMock = vi.fn().mockReturnValue({
			neq: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					in: vi.fn().mockResolvedValue({
						data: 5,
						error: null
					})
				})
			})
		});

		supabase.from
			.mockReturnValueOnce({ select: conversationSelectMock })
			.mockReturnValueOnce({ select: messageSelectMock });

		const result = await getUnreadMessageCount();

		expect(result).toEqual({
			count: 5,
			error: null
		});
	});

	it('should return 0 for user with no conversations', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockResolvedValue({
				data: [],
				error: null
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getUnreadMessageCount();

		expect(result).toEqual({
			count: 0,
			error: null
		});
	});
});