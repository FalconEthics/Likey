import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	initializeNotifications,
	cleanupNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	createNotification,
	requestNotificationPermission
} from './notifications.js';

// Mock the dependencies
vi.mock('./supabase.js', () => ({
	supabase: {
		from: vi.fn(),
		channel: vi.fn()
	}
}));

vi.mock('./stores.js', () => ({
	user: { subscribe: vi.fn() },
	notifications: {
		set: vi.fn(),
		update: vi.fn()
	},
	unreadCount: {
		set: vi.fn(),
		update: vi.fn()
	}
}));

vi.mock('svelte/store', () => ({
	get: vi.fn()
}));

import { supabase } from './supabase.js';
import { user, notifications, unreadCount } from './stores.js';
import { get } from 'svelte/store';

// Mock global Notification API
global.Notification = vi.fn();
global.Notification.permission = 'default';
global.Notification.requestPermission = vi.fn();

describe('initializeNotifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should not initialize when user is not authenticated', () => {
		get.mockReturnValue(null);

		initializeNotifications();

		expect(supabase.from).not.toHaveBeenCalled();
	});

	it('should load notifications and set up subscription for authenticated user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockNotifications = [
			{
				id: 'notif-1',
				type: 'like',
				message: 'User liked your post',
				read: false,
				related_user: { username: 'testuser' }
			},
			{
				id: 'notif-2',
				type: 'follow',
				message: 'User started following you',
				read: true,
				related_user: { username: 'follower' }
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: mockNotifications,
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const mockChannel = {
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn()
		};

		supabase.channel.mockReturnValue(mockChannel);

		// Wait for async operations to complete
		await new Promise(resolve => setTimeout(resolve, 0));

		// Call the function
		initializeNotifications();

		// Wait for loadNotifications to complete
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(supabase.from).toHaveBeenCalledWith('notifications');
		expect(notifications.set).toHaveBeenCalledWith(mockNotifications);
		expect(unreadCount.set).toHaveBeenCalledWith(1); // One unread notification
		expect(supabase.channel).toHaveBeenCalledWith('notifications');
	});

	it('should handle errors when loading notifications', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Database error' }
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		initializeNotifications();

		// Wait for loadNotifications to complete
		await new Promise(resolve => setTimeout(resolve, 0));

		expect(consoleSpy).toHaveBeenCalledWith('Error loading notifications:', expect.any(Error));

		consoleSpy.mockRestore();
	});
});

describe('cleanupNotifications', () => {
	it('should unsubscribe from notification channel', () => {
		// First initialize notifications to create a subscription
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockChannel = {
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn(),
			unsubscribe: vi.fn()
		};

		supabase.channel.mockReturnValue(mockChannel);
		supabase.from.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					order: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				})
			})
		});

		initializeNotifications();

		// Now cleanup
		cleanupNotifications();

		expect(mockChannel.unsubscribe).toHaveBeenCalled();
	});
});

describe('markNotificationAsRead', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should mark notification as read successfully', async () => {
		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({
				error: null
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		await markNotificationAsRead('notif-123');

		expect(supabase.from).toHaveBeenCalledWith('notifications');
		expect(updateMock).toHaveBeenCalledWith({ read: true });
		expect(notifications.update).toHaveBeenCalled();
		expect(unreadCount.update).toHaveBeenCalled();
	});

	it('should handle database errors', async () => {
		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({
				error: { message: 'Update failed' }
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await markNotificationAsRead('notif-123');

		expect(consoleSpy).toHaveBeenCalledWith('Error marking notification as read:', expect.any(Error));

		consoleSpy.mockRestore();
	});

	it('should update local store correctly', async () => {
		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({ error: null })
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		await markNotificationAsRead('notif-123');

		// Test the update function behavior
		const updateFunction = notifications.update.mock.calls[0][0];
		const mockNotifications = [
			{ id: 'notif-123', read: false },
			{ id: 'notif-456', read: false }
		];

		const result = updateFunction(mockNotifications);
		expect(result[0].read).toBe(true);
		expect(result[1].read).toBe(false);

		// Test unread count update
		const countUpdateFunction = unreadCount.update.mock.calls[0][0];
		expect(countUpdateFunction(5)).toBe(4);
		expect(countUpdateFunction(0)).toBe(0); // Should not go below 0
	});
});

describe('markAllNotificationsAsRead', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return early when not authenticated', async () => {
		get.mockReturnValue(null);

		await markAllNotificationsAsRead();

		expect(supabase.from).not.toHaveBeenCalled();
	});

	it('should mark all notifications as read successfully', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnThis().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		await markAllNotificationsAsRead();

		expect(supabase.from).toHaveBeenCalledWith('notifications');
		expect(updateMock).toHaveBeenCalledWith({ read: true });
		expect(notifications.update).toHaveBeenCalled();
		expect(unreadCount.set).toHaveBeenCalledWith(0);
	});

	it('should handle database errors', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnThis().mockReturnValue({
				eq: vi.fn().mockResolvedValue({
					error: { message: 'Bulk update failed' }
				})
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await markAllNotificationsAsRead();

		expect(consoleSpy).toHaveBeenCalledWith('Error marking all notifications as read:', expect.any(Error));

		consoleSpy.mockRestore();
	});

	it('should update local store to mark all as read', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnThis().mockReturnValue({
				eq: vi.fn().mockResolvedValue({ error: null })
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		await markAllNotificationsAsRead();

		// Test the update function behavior
		const updateFunction = notifications.update.mock.calls[0][0];
		const mockNotifications = [
			{ id: 'notif-123', read: false },
			{ id: 'notif-456', read: true }
		];

		const result = updateFunction(mockNotifications);
		expect(result[0].read).toBe(true);
		expect(result[1].read).toBe(true);
	});
});

describe('createNotification', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should not create notification for self-actions', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		await createNotification(
			'user-123', // Same as current user
			'like',
			'You liked your own post',
			'user-123'
		);

		expect(supabase.from).not.toHaveBeenCalled();
	});

	it('should create notification successfully', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const insertMock = vi.fn().mockResolvedValue({
			error: null
		});

		supabase.from.mockReturnValue({
			insert: insertMock
		});

		await createNotification(
			'user-456',
			'like',
			'User liked your post',
			'user-123',
			'post-789'
		);

		expect(supabase.from).toHaveBeenCalledWith('notifications');
		expect(insertMock).toHaveBeenCalledWith({
			user_id: 'user-456',
			type: 'like',
			message: 'User liked your post',
			related_user_id: 'user-123',
			related_post_id: 'post-789'
		});
	});

	it('should create notification without related post', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const insertMock = vi.fn().mockResolvedValue({
			error: null
		});

		supabase.from.mockReturnValue({
			insert: insertMock
		});

		await createNotification(
			'user-456',
			'follow',
			'User started following you',
			'user-123'
		);

		expect(insertMock).toHaveBeenCalledWith({
			user_id: 'user-456',
			type: 'follow',
			message: 'User started following you',
			related_user_id: 'user-123',
			related_post_id: null
		});
	});

	it('should handle database errors', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const insertMock = vi.fn().mockResolvedValue({
			error: { message: 'Insert failed' }
		});

		supabase.from.mockReturnValue({
			insert: insertMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await createNotification(
			'user-456',
			'like',
			'User liked your post',
			'user-123'
		);

		expect(consoleSpy).toHaveBeenCalledWith('Error creating notification:', expect.any(Error));

		consoleSpy.mockRestore();
	});

	it('should work when current user is null', async () => {
		get.mockReturnValue(null);

		const insertMock = vi.fn().mockResolvedValue({
			error: null
		});

		supabase.from.mockReturnValue({
			insert: insertMock
		});

		await createNotification(
			'user-456',
			'like',
			'Someone liked your post',
			'user-123'
		);

		expect(insertMock).toHaveBeenCalled();
	});
});

describe('requestNotificationPermission', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset global Notification mock
		global.Notification = vi.fn();
		global.Notification.permission = 'default';
		global.Notification.requestPermission = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should request permission when default', async () => {
		global.Notification.permission = 'default';
		global.Notification.requestPermission.mockResolvedValue('granted');

		const result = await requestNotificationPermission();

		expect(global.Notification.requestPermission).toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should return true when already granted', async () => {
		global.Notification.permission = 'granted';

		const result = await requestNotificationPermission();

		expect(global.Notification.requestPermission).not.toHaveBeenCalled();
		expect(result).toBe(true);
	});

	it('should return false when permission denied', async () => {
		global.Notification.permission = 'default';
		global.Notification.requestPermission.mockResolvedValue('denied');

		const result = await requestNotificationPermission();

		expect(result).toBe(false);
	});

	it('should return false when Notification API not available', async () => {
		// Temporarily remove Notification from global
		const originalNotification = global.Notification;
		delete global.Notification;

		const result = await requestNotificationPermission();

		expect(result).toBe(false);

		// Restore Notification
		global.Notification = originalNotification;
	});

	it('should return current permission status when already granted', async () => {
		global.Notification.permission = 'granted';

		const result = await requestNotificationPermission();

		expect(result).toBe(true);
	});

	it('should return current permission status when denied', async () => {
		global.Notification.permission = 'denied';

		const result = await requestNotificationPermission();

		expect(result).toBe(false);
	});
});

describe('browser notification display', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.Notification = vi.fn();
		global.Notification.permission = 'granted';
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should show browser notification when permission granted', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockNotification = {
			id: 'notif-123',
			type: 'like',
			message: 'User liked your post',
			related_user: { username: 'testuser' }
		};

		const mockChannel = {
			on: vi.fn().mockImplementation((event, config, callback) => {
				// Simulate a real-time notification
				const payload = { new: { id: 'notif-123' } };
				
				// Mock the supabase fetch for full notification data
				const selectMock = vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: mockNotification,
							error: null
						})
					})
				});

				supabase.from.mockReturnValue({
					select: selectMock
				});

				// Call the callback to simulate real-time event
				setTimeout(() => callback(payload), 0);

				return mockChannel;
			}),
			subscribe: vi.fn()
		};

		supabase.channel.mockReturnValue(mockChannel);
		supabase.from.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					order: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				})
			})
		});

		initializeNotifications();

		// Wait for async operations
		await new Promise(resolve => setTimeout(resolve, 10));

		expect(global.Notification).toHaveBeenCalledWith('Likey', {
			body: 'User liked your post',
			icon: '/favicon.ico',
			tag: 'notif-123'
		});
	});

	it('should not show browser notification when permission not granted', async () => {
		global.Notification.permission = 'denied';

		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockNotification = {
			id: 'notif-123',
			message: 'Test notification'
		};

		const mockChannel = {
			on: vi.fn().mockImplementation((event, config, callback) => {
				const payload = { new: { id: 'notif-123' } };
				
				const selectMock = vi.fn().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: mockNotification,
							error: null
						})
					})
				});

				supabase.from.mockReturnValue({
					select: selectMock
				});

				setTimeout(() => callback(payload), 0);
				return mockChannel;
			}),
			subscribe: vi.fn()
		};

		supabase.channel.mockReturnValue(mockChannel);
		supabase.from.mockReturnValue({
			select: vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					order: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue({
							data: [],
							error: null
						})
					})
				})
			})
		});

		initializeNotifications();

		// Wait for async operations
		await new Promise(resolve => setTimeout(resolve, 10));

		expect(global.Notification).not.toHaveBeenCalled();
	});
});