import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	searchUsers,
	getTrendingPosts,
	getUserRecommendations,
	getTrendingUsers,
	refreshTrendingPosts,
	getExplorePosts
} from './search.js';

// Mock the dependencies
vi.mock('./supabase.js', () => ({
	supabase: {
		from: vi.fn(),
		rpc: vi.fn()
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

describe('searchUsers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return empty results for queries shorter than 2 characters', async () => {
		const result = await searchUsers('a');
		expect(result).toEqual({ data: [], error: null });

		const emptyResult = await searchUsers('');
		expect(emptyResult).toEqual({ data: [], error: null });

		const whitespaceResult = await searchUsers('  ');
		expect(whitespaceResult).toEqual({ data: [], error: null });
	});

	it('should search users successfully with follow status for authenticated user', async () => {
		const currentUser = { id: 'user-123', username: 'currentuser' };
		get.mockReturnValue(currentUser);

		const mockResults = [
			{
				id: 'user-456',
				username: 'testuser',
				display_name: 'Test User',
				bio: 'Test bio',
				profile_pic_url: null,
				followers_count: 10,
				follows: [{ follower_id: 'user-123' }] // Current user follows this user
			},
			{
				id: 'user-789',
				username: 'anotheruser',
				display_name: 'Another User',
				bio: 'Another bio',
				profile_pic_url: null,
				followers_count: 5,
				follows: [] // Not followed by current user
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: mockResults,
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await searchUsers('test', 20);

		expect(supabase.from).toHaveBeenCalledWith('profiles');
		expect(selectMock).toHaveBeenCalledWith(expect.stringContaining('id,'));
		expect(result.data).toHaveLength(2);
		expect(result.data[0].is_following).toBe(true);
		expect(result.data[1].is_following).toBe(false);
		expect(result.error).toBeNull();
	});

	it('should search users successfully for unauthenticated user', async () => {
		get.mockReturnValue(null); // No current user

		const mockResults = [
			{
				id: 'user-456',
				username: 'testuser',
				display_name: 'Test User',
				bio: 'Test bio',
				profile_pic_url: null,
				followers_count: 10,
				follows: []
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: mockResults,
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await searchUsers('test');

		expect(result.data[0].is_following).toBe(false);
		expect(result.error).toBeNull();
	});

	it('should handle search errors gracefully', async () => {
		get.mockReturnValue({ id: 'user-123' });

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Database connection failed' }
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await searchUsers('test');

		expect(result).toEqual({
			data: [],
			error: 'Database connection failed'
		});
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it('should properly trim search query', async () => {
		get.mockReturnValue(null);

		const selectMock = vi.fn().mockReturnValue({
			or: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: [],
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		await searchUsers('  test query  ');

		// Check that the or method was called with the trimmed query
		const orCall = selectMock().or;
		expect(orCall).toHaveBeenCalledWith('username.ilike.%test query%,display_name.ilike.%test query%');
	});
});

describe('getTrendingPosts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get trending posts successfully for authenticated user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockTrendingData = [
			{
				post_id: 'post-1',
				score: 95.5,
				posts: {
					id: 'post-1',
					content: 'Trending post 1',
					user_id: 'user-456',
					profiles: {
						username: 'trendinguser',
						display_name: 'Trending User',
						profile_pic_url: null
					},
					likes: [{ user_id: 'user-123' }, { user_id: 'user-789' }]
				}
			},
			{
				post_id: 'post-2',
				score: 87.3,
				posts: {
					id: 'post-2',
					content: 'Trending post 2',
					user_id: 'user-789',
					profiles: {
						username: 'anotheruser',
						display_name: 'Another User',
						profile_pic_url: null
					},
					likes: [{ user_id: 'user-789' }]
				}
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue({
					data: mockTrendingData,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getTrendingPosts(20);

		expect(supabase.from).toHaveBeenCalledWith('trending_posts');
		expect(result.data).toHaveLength(2);
		expect(result.data[0].liked_by_user).toBe(true);
		expect(result.data[1].liked_by_user).toBe(false);
		expect(result.data[0].user.username).toBe('trendinguser');
		expect(result.error).toBeNull();
	});

	it('should filter out posts with no data (deleted posts)', async () => {
		get.mockReturnValue({ id: 'user-123' });

		const mockTrendingData = [
			{
				post_id: 'post-1',
				score: 95.5,
				posts: {
					id: 'post-1',
					content: 'Valid post',
					profiles: { username: 'user1' },
					likes: []
				}
			},
			{
				post_id: 'post-2',
				score: 87.3,
				posts: null // Deleted post
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue({
					data: mockTrendingData,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getTrendingPosts();

		expect(result.data).toHaveLength(1);
		expect(result.data[0].id).toBe('post-1');
	});

	it('should handle trending posts errors', async () => {
		get.mockReturnValue(null);

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue({
					data: null,
					error: { message: 'Failed to fetch trending posts' }
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getTrendingPosts();

		expect(result).toEqual({
			data: [],
			error: 'Failed to fetch trending posts'
		});

		consoleSpy.mockRestore();
	});
});

describe('getUserRecommendations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return error for unauthenticated user', async () => {
		get.mockReturnValue(null);

		const result = await getUserRecommendations();

		expect(result).toEqual({
			data: [],
			error: 'Not authenticated'
		});
	});

	it('should get user recommendations successfully', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		// Mock RPC call for generating recommendations
		supabase.rpc.mockResolvedValue({ data: null, error: null });

		const mockRecommendations = [
			{
				user_id: 'user-123',
				recommended_user_id: 'user-456',
				reason: 'mutual_followers',
				score: 0.8,
				recommended_user: {
					id: 'user-456',
					username: 'recommendeduser',
					display_name: 'Recommended User',
					bio: 'A great user to follow',
					profile_pic_url: null,
					followers_count: 150
				}
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: mockRecommendations,
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getUserRecommendations(10);

		expect(supabase.rpc).toHaveBeenCalledWith('generate_mutual_follow_recommendations', {
			target_user_id: 'user-123'
		});
		expect(result.data).toHaveLength(1);
		expect(result.data[0].username).toBe('recommendeduser');
		expect(result.data[0].recommendation_reason).toBe('mutual_followers');
		expect(result.data[0].recommendation_score).toBe(0.8);
		expect(result.error).toBeNull();
	});

	it('should handle recommendation generation errors', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		supabase.rpc.mockResolvedValue({
			data: null,
			error: { message: 'RPC function failed' }
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getUserRecommendations();

		expect(result).toEqual({
			data: [],
			error: 'RPC function failed'
		});

		consoleSpy.mockRestore();
	});
});

describe('getTrendingUsers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get trending users successfully and filter current user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockUsers = [
			{
				id: 'user-123', // Current user - should be filtered
				username: 'currentuser',
				display_name: 'Current User',
				followers_count: 100,
				follows: []
			},
			{
				id: 'user-456',
				username: 'trendinguser1',
				display_name: 'Trending User 1',
				followers_count: 200,
				follows: [] // Not followed by current user
			},
			{
				id: 'user-789',
				username: 'trendinguser2',
				display_name: 'Trending User 2',
				followers_count: 150,
				follows: [{ follower_id: 'user-123' }] // Followed by current user - should be filtered
			},
			{
				id: 'user-101',
				username: 'trendinguser3',
				display_name: 'Trending User 3',
				followers_count: 120,
				follows: []
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue({
					data: mockUsers,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getTrendingUsers(15);

		expect(result.data).toHaveLength(2); // Current user and followed user filtered out
		expect(result.data[0].username).toBe('trendinguser1');
		expect(result.data[1].username).toBe('trendinguser3');
		expect(result.data[0].is_following).toBe(false);
		expect(result.error).toBeNull();
	});

	it('should work for unauthenticated user', async () => {
		get.mockReturnValue(null);

		const mockUsers = [
			{
				id: 'user-456',
				username: 'trendinguser1',
				display_name: 'Trending User 1',
				followers_count: 200,
				follows: []
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue({
					data: mockUsers,
					error: null
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getTrendingUsers();

		expect(result.data).toHaveLength(1);
		expect(result.data[0].is_following).toBe(false);
	});

	it('should handle trending users errors', async () => {
		get.mockReturnValue({ id: 'user-123' });

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue({
					data: null,
					error: { message: 'Database error' }
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getTrendingUsers();

		expect(result).toEqual({
			data: [],
			error: 'Database error'
		});

		consoleSpy.mockRestore();
	});
});

describe('refreshTrendingPosts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should refresh trending posts successfully', async () => {
		supabase.rpc.mockResolvedValue({ data: null, error: null });

		const result = await refreshTrendingPosts();

		expect(supabase.rpc).toHaveBeenCalledWith('refresh_trending_posts');
		expect(result).toEqual({ success: true, error: null });
	});

	it('should handle refresh errors', async () => {
		supabase.rpc.mockResolvedValue({
			data: null,
			error: { message: 'Refresh function failed' }
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await refreshTrendingPosts();

		expect(result).toEqual({
			success: false,
			error: 'Refresh function failed'
		});

		consoleSpy.mockRestore();
	});
});

describe('getExplorePosts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should get explore posts successfully for authenticated user', async () => {
		const currentUser = { id: 'user-123' };
		get.mockReturnValue(currentUser);

		const mockPosts = [
			{
				id: 'post-1',
				content: 'Explore post 1',
				user_id: 'user-456',
				like_count: 25,
				created_at: '2024-01-15T10:00:00Z',
				profiles: {
					username: 'exploreuser',
					display_name: 'Explore User',
					profile_pic_url: null
				},
				likes: [{ user_id: 'user-123' }]
			},
			{
				id: 'post-2',
				content: 'Explore post 2',
				user_id: 'user-789',
				like_count: 15,
				created_at: '2024-01-14T10:00:00Z',
				profiles: {
					username: 'anotheruser',
					display_name: 'Another User',
					profile_pic_url: null
				},
				likes: []
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnThis().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: mockPosts,
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getExplorePosts(30);

		expect(supabase.from).toHaveBeenCalledWith('posts');
		expect(result.data).toHaveLength(2);
		expect(result.data[0].liked_by_user).toBe(true);
		expect(result.data[1].liked_by_user).toBe(false);
		expect(result.data[0].user.username).toBe('exploreuser');
		expect(result.error).toBeNull();
	});

	it('should work for unauthenticated user', async () => {
		get.mockReturnValue(null);

		const mockPosts = [
			{
				id: 'post-1',
				content: 'Explore post 1',
				profiles: { username: 'user1' },
				likes: []
			}
		];

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnThis().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: mockPosts,
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const result = await getExplorePosts();

		expect(result.data[0].liked_by_user).toBe(false);
	});

	it('should handle explore posts errors', async () => {
		get.mockReturnValue({ id: 'user-123' });

		const selectMock = vi.fn().mockReturnValue({
			order: vi.fn().mockReturnThis().mockReturnValue({
				order: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Database query failed' }
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			select: selectMock
		});

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = await getExplorePosts();

		expect(result).toEqual({
			data: [],
			error: 'Database query failed'
		});

		consoleSpy.mockRestore();
	});
});