import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFollow } from './useFollow.js';

// Mock the dependencies
vi.mock('../supabase.js', () => ({
	supabase: {
		from: vi.fn()
	}
}));

vi.mock('../stores.js', () => ({
	user: { subscribe: vi.fn() }
}));

vi.mock('svelte/store', () => ({
	get: vi.fn()
}));

vi.mock('../notifications.js', () => ({
	createNotification: vi.fn()
}));

import { supabase } from '../supabase.js';
import { get } from 'svelte/store';
import { createNotification } from '../notifications.js';

describe('useFollow', () => {
	let followComposable;
	let mockCallbacks;

	beforeEach(() => {
		vi.clearAllMocks();
		
		mockCallbacks = {
			onFollowChange: vi.fn(),
			onCountUpdate: vi.fn()
		};

		followComposable = useFollow(mockCallbacks);
	});

	describe('checkFollowStatus', () => {
		it('should return false when user is not authenticated', async () => {
			get.mockReturnValue(null);

			const result = await followComposable.checkFollowStatus('user-456');

			expect(result).toBe(false);
		});

		it('should return false when trying to check self follow status', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const result = await followComposable.checkFollowStatus('user-123');

			expect(result).toBe(false);
		});

		it('should return true when follow relationship exists', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const selectMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: { id: 'follow-123' },
							error: null
						})
					})
				})
			});

			supabase.from.mockReturnValue({
				select: selectMock
			});

			const result = await followComposable.checkFollowStatus('user-456');

			expect(supabase.from).toHaveBeenCalledWith('follows');
			expect(selectMock).toHaveBeenCalledWith('id');
			expect(result).toBe(true);
		});

		it('should return false when follow relationship does not exist', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const selectMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockResolvedValue({
							data: null,
							error: { code: 'PGRST116' }
						})
					})
				})
			});

			supabase.from.mockReturnValue({
				select: selectMock
			});

			const result = await followComposable.checkFollowStatus('user-456');

			expect(result).toBe(false);
		});

		it('should return false when database error occurs', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const selectMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockReturnValue({
						single: vi.fn().mockRejectedValue(new Error('Database error'))
					})
				})
			});

			supabase.from.mockReturnValue({
				select: selectMock
			});

			const result = await followComposable.checkFollowStatus('user-456');

			expect(result).toBe(false);
		});
	});

	describe('followUser', () => {
		it('should prevent following yourself', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const result = await followComposable.followUser('user-123');

			expect(result).toEqual({
				success: false,
				error: 'Cannot follow yourself'
			});
		});

		it('should prevent following when not authenticated', async () => {
			get.mockReturnValue(null);

			const result = await followComposable.followUser('user-456');

			expect(result).toEqual({
				success: false,
				error: 'Cannot follow yourself'
			});
		});

		it('should follow user successfully with notifications enabled', async () => {
			const currentUser = {
				id: 'user-123',
				display_name: 'Current User'
			};
			get.mockReturnValue(currentUser);

			const insertMock = vi.fn().mockResolvedValue({
				data: { id: 'follow-123' },
				error: null
			});

			supabase.from.mockReturnValue({
				insert: insertMock
			});

			createNotification.mockResolvedValue({ success: true });

			const result = await followComposable.followUser('user-456', 'Target User');

			expect(supabase.from).toHaveBeenCalledWith('follows');
			expect(insertMock).toHaveBeenCalledWith({
				follower_id: 'user-123',
				following_id: 'user-456'
			});

			expect(createNotification).toHaveBeenCalledWith(
				'user-456',
				'follow',
				'Current User started following you',
				'user-123'
			);

			expect(mockCallbacks.onFollowChange).toHaveBeenCalledWith(true);
			expect(mockCallbacks.onCountUpdate).toHaveBeenCalledWith(1);
			expect(result).toEqual({ success: true });
		});

		it('should follow user successfully with notifications disabled', async () => {
			const currentUser = { id: 'user-123', display_name: 'Current User' };
			get.mockReturnValue(currentUser);

			const noNotificationComposable = useFollow({ 
				...mockCallbacks, 
				createNotifications: false 
			});

			const insertMock = vi.fn().mockResolvedValue({
				data: { id: 'follow-123' },
				error: null
			});

			supabase.from.mockReturnValue({
				insert: insertMock
			});

			const result = await noNotificationComposable.followUser('user-456');

			expect(createNotification).not.toHaveBeenCalled();
			expect(result).toEqual({ success: true });
		});

		it('should handle follow errors', async () => {
			get.mockReturnValue({ id: 'user-123', display_name: 'Current User' });

			const insertMock = vi.fn().mockResolvedValue({
				data: null,
				error: { message: 'Unique constraint violation' }
			});

			supabase.from.mockReturnValue({
				insert: insertMock
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const result = await followComposable.followUser('user-456');

			expect(result).toEqual({
				success: false,
				error: 'Unique constraint violation'
			});

			consoleSpy.mockRestore();
		});

		it('should work without callbacks', async () => {
			const currentUser = { id: 'user-123', display_name: 'Current User' };
			get.mockReturnValue(currentUser);

			const noCallbackComposable = useFollow();

			const insertMock = vi.fn().mockResolvedValue({
				data: { id: 'follow-123' },
				error: null
			});

			supabase.from.mockReturnValue({
				insert: insertMock
			});

			const result = await noCallbackComposable.followUser('user-456');

			expect(result).toEqual({ success: true });
		});
	});

	describe('unfollowUser', () => {
		it('should prevent unfollowing yourself', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const result = await followComposable.unfollowUser('user-123');

			expect(result).toEqual({
				success: false,
				error: 'Cannot unfollow yourself'
			});
		});

		it('should prevent unfollowing when not authenticated', async () => {
			get.mockReturnValue(null);

			const result = await followComposable.unfollowUser('user-456');

			expect(result).toEqual({
				success: false,
				error: 'Cannot unfollow yourself'
			});
		});

		it('should unfollow user successfully', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const deleteMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockResolvedValue({
						data: null,
						error: null
					})
				})
			});

			supabase.from.mockReturnValue({
				delete: deleteMock
			});

			const result = await followComposable.unfollowUser('user-456');

			expect(supabase.from).toHaveBeenCalledWith('follows');
			expect(deleteMock).toHaveBeenCalled();
			expect(mockCallbacks.onFollowChange).toHaveBeenCalledWith(false);
			expect(mockCallbacks.onCountUpdate).toHaveBeenCalledWith(-1);
			expect(result).toEqual({ success: true });
		});

		it('should handle unfollow errors', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const deleteMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Database connection failed' }
					})
				})
			});

			supabase.from.mockReturnValue({
				delete: deleteMock
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const result = await followComposable.unfollowUser('user-456');

			expect(result).toEqual({
				success: false,
				error: 'Database connection failed'
			});

			consoleSpy.mockRestore();
		});
	});

	describe('toggleFollow', () => {
		it('should unfollow when currently following', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const deleteMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockResolvedValue({
						data: null,
						error: null
					})
				})
			});

			supabase.from.mockReturnValue({
				delete: deleteMock
			});

			const result = await followComposable.toggleFollow('user-456', true);

			expect(result).toEqual({
				success: true,
				newState: false,
				error: undefined
			});
		});

		it('should follow when currently not following', async () => {
			get.mockReturnValue({ id: 'user-123', display_name: 'Current User' });

			const insertMock = vi.fn().mockResolvedValue({
				data: { id: 'follow-123' },
				error: null
			});

			supabase.from.mockReturnValue({
				insert: insertMock
			});

			const result = await followComposable.toggleFollow('user-456', false, 'Target User');

			expect(result).toEqual({
				success: true,
				newState: true,
				error: undefined
			});
		});

		it('should handle toggle errors correctly', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const deleteMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnThis().mockReturnValue({
					eq: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Delete failed' }
					})
				})
			});

			supabase.from.mockReturnValue({
				delete: deleteMock
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const result = await followComposable.toggleFollow('user-456', true);

			expect(result).toEqual({
				success: false,
				newState: false,
				error: 'Delete failed'
			});

			consoleSpy.mockRestore();
		});
	});

	describe('checkMultipleFollowStatus', () => {
		it('should return empty object when not authenticated', async () => {
			get.mockReturnValue(null);

			const result = await followComposable.checkMultipleFollowStatus(['user-456', 'user-789']);

			expect(result).toEqual({});
		});

		it('should return empty object for empty user list', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const result = await followComposable.checkMultipleFollowStatus([]);

			expect(result).toEqual({});
		});

		it('should return follow status for multiple users', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const selectMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					in: vi.fn().mockResolvedValue({
						data: [
							{ following_id: 'user-456' },
							{ following_id: 'user-101' }
						],
						error: null
					})
				})
			});

			supabase.from.mockReturnValue({
				select: selectMock
			});

			const userIds = ['user-456', 'user-789', 'user-101'];
			const result = await followComposable.checkMultipleFollowStatus(userIds);

			expect(supabase.from).toHaveBeenCalledWith('follows');
			expect(selectMock).toHaveBeenCalledWith('following_id');
			expect(result).toEqual({
				'user-456': true,
				'user-789': false,
				'user-101': true
			});
		});

		it('should handle errors and return empty object', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const selectMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					in: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Database query failed' }
					})
				})
			});

			supabase.from.mockReturnValue({
				select: selectMock
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const result = await followComposable.checkMultipleFollowStatus(['user-456']);

			expect(result).toEqual({});
			expect(consoleSpy).toHaveBeenCalledWith('Error checking multiple follow status:', expect.any(Error));

			consoleSpy.mockRestore();
		});

		it('should handle null data response', async () => {
			get.mockReturnValue({ id: 'user-123' });

			const selectMock = vi.fn().mockReturnValue({
				eq: vi.fn().mockReturnValue({
					in: vi.fn().mockResolvedValue({
						data: null,
						error: null
					})
				})
			});

			supabase.from.mockReturnValue({
				select: selectMock
			});

			const result = await followComposable.checkMultipleFollowStatus(['user-456', 'user-789']);

			expect(result).toEqual({
				'user-456': false,
				'user-789': false
			});
		});
	});

	describe('composable configuration', () => {
		it('should work with default configuration', () => {
			const defaultComposable = useFollow();
			
			expect(defaultComposable.checkFollowStatus).toBeDefined();
			expect(defaultComposable.followUser).toBeDefined();
			expect(defaultComposable.unfollowUser).toBeDefined();
			expect(defaultComposable.toggleFollow).toBeDefined();
			expect(defaultComposable.checkMultipleFollowStatus).toBeDefined();
		});

		it('should respect createNotifications setting', async () => {
			const disableNotificationsComposable = useFollow({ createNotifications: false });
			
			get.mockReturnValue({ id: 'user-123', display_name: 'Current User' });

			const insertMock = vi.fn().mockResolvedValue({
				data: { id: 'follow-123' },
				error: null
			});

			supabase.from.mockReturnValue({
				insert: insertMock
			});

			await disableNotificationsComposable.followUser('user-456');

			expect(createNotification).not.toHaveBeenCalled();
		});
	});
});