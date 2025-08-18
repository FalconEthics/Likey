import { supabase } from './supabase.js';
import { user } from './stores.js';
import { get } from 'svelte/store';

/**
 * @typedef {Object} SearchResult
 * @property {string} id
 * @property {string} username
 * @property {string} display_name
 * @property {string} bio
 * @property {string} profile_pic_url
 * @property {number} followers_count
 * @property {boolean} is_following
 */

/**
 * Search for users by username or display name
 * @param {string} query - Search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<{data: SearchResult[], error: any}>}
 */
export async function searchUsers(query, limit = 20) {
	if (!query || query.trim().length < 2) {
		return { data: [], error: null };
	}

	const currentUser = get(user);
	const searchTerm = query.trim();

	try {
		// Use full-text search for better results
		const { data, error } = await supabase
			.from('profiles')
			.select(`
				id,
				username,
				display_name,
				bio,
				profile_pic_url,
				followers_count,
				follows:follows!following_id (
					follower_id
				)
			`)
			.or(`username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
			.order('followers_count', { ascending: false })
			.limit(limit);

		if (error) throw error;

		// Add is_following flag
		const results = data.map(profile => ({
			...profile,
			is_following: currentUser ? 
				profile.follows.some(follow => follow.follower_id === currentUser.id) : 
				false
		}));

		return { data: results, error: null };
	} catch (error) {
		console.error('Error searching users:', error);
		return { data: [], error: error.message };
	}
}

/**
 * Get trending posts
 * @param {number} limit - Number of posts to return
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getTrendingPosts(limit = 20) {
	try {
		const { data, error } = await supabase
			.from('trending_posts')
			.select(`
				post_id,
				score,
				posts:post_id (
					*,
					profiles:user_id (
						username,
						display_name,
						profile_pic_url
					),
					likes:likes!left (
						user_id
					)
				)
			`)
			.order('score', { ascending: false })
			.limit(limit);

		if (error) throw error;

		// Process posts to add user data and like status
		const currentUser = get(user);
		const posts = data
			.filter(item => item.posts) // Filter out null posts
			.map(item => ({
				...item.posts,
				user: item.posts.profiles,
				liked_by_user: currentUser ? 
					item.posts.likes.some(like => like.user_id === currentUser.id) : 
					false
			}));

		return { data: posts, error: null };
	} catch (error) {
		console.error('Error getting trending posts:', error);
		return { data: [], error: error.message };
	}
}

/**
 * Get user recommendations for current user
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getUserRecommendations(limit = 10) {
	const currentUser = get(user);
	if (!currentUser) {
		return { data: [], error: 'Not authenticated' };
	}

	try {
		// First, refresh recommendations for the current user
		await supabase.rpc('generate_mutual_follow_recommendations', {
			target_user_id: currentUser.id
		});

		// Get the recommendations
		const { data, error } = await supabase
			.from('user_recommendations')
			.select(`
				*,
				recommended_user:recommended_user_id (
					id,
					username,
					display_name,
					bio,
					profile_pic_url,
					followers_count
				)
			`)
			.eq('user_id', currentUser.id)
			.order('score', { ascending: false })
			.limit(limit);

		if (error) throw error;

		const recommendations = data.map(rec => ({
			...rec.recommended_user,
			recommendation_reason: rec.reason,
			recommendation_score: rec.score
		}));

		return { data: recommendations, error: null };
	} catch (error) {
		console.error('Error getting user recommendations:', error);
		return { data: [], error: error.message };
	}
}

/**
 * Get trending users (users with recent high engagement)
 * @param {number} limit - Number of users to return
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getTrendingUsers(limit = 15) {
	const currentUser = get(user);

	try {
		// Get users with highest recent engagement
		const { data, error } = await supabase
			.from('profiles')
			.select(`
				id,
				username,
				display_name,
				bio,
				profile_pic_url,
				followers_count,
				posts_count,
				follows:follows!following_id (
					follower_id
				)
			`)
			.order('followers_count', { ascending: false })
			.limit(limit * 2); // Get more than needed to filter out current user and followed users

		if (error) throw error;

		// Filter out current user and already followed users
		const filteredUsers = data
			.filter(profile => {
				if (currentUser && profile.id === currentUser.id) return false;
				if (currentUser && profile.follows.some(follow => follow.follower_id === currentUser.id)) return false;
				return true;
			})
			.slice(0, limit)
			.map(profile => ({
				...profile,
				is_following: false
			}));

		return { data: filteredUsers, error: null };
	} catch (error) {
		console.error('Error getting trending users:', error);
		return { data: [], error: error.message };
	}
}

/**
 * Refresh trending posts (should be called periodically)
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function refreshTrendingPosts() {
	try {
		const { error } = await supabase.rpc('refresh_trending_posts');
		
		if (error) throw error;

		return { success: true, error: null };
	} catch (error) {
		console.error('Error refreshing trending posts:', error);
		return { success: false, error: error.message };
	}
}

/**
 * Get recent posts for explore page
 * @param {number} limit - Number of posts to return
 * @returns {Promise<{data: any[], error: any}>}
 */
export async function getExplorePosts(limit = 30) {
	const currentUser = get(user);

	try {
		const { data, error } = await supabase
			.from('posts')
			.select(`
				*,
				profiles:user_id (
					username,
					display_name,
					profile_pic_url
				),
				likes:likes!left (
					user_id
				)
			`)
			.order('like_count', { ascending: false })
			.order('created_at', { ascending: false })
			.limit(limit);

		if (error) throw error;

		// Process posts
		const posts = data.map(post => ({
			...post,
			user: post.profiles,
			liked_by_user: currentUser ? 
				post.likes.some(like => like.user_id === currentUser.id) : 
				false
		}));

		return { data: posts, error: null };
	} catch (error) {
		console.error('Error getting explore posts:', error);
		return { data: [], error: error.message };
	}
}