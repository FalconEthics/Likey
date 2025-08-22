import { supabase } from '$lib/supabase.js';
import { error } from '@sveltejs/kit';

/**
 * Load user profile data
 * @param {Object} params
 * @returns {Promise<Object>}
 */
export async function load({ params }) {
	const { username } = params;

	try {
		// Get user profile
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('*')
			.eq('username', username)
			.single();

		if (profileError) {
			throw error(404, 'User not found');
		}

		// Get user's posts
		const { data: posts, error: postsError } = await supabase
			.from('posts')
			.select(
				`
				*,
				profiles:user_id (
					username,
					display_name,
					profile_pic_url
				),
				likes:likes!left (
					user_id
				)
			`
			)
			.eq('user_id', profile.id)
			.order('created_at', { ascending: false });

		if (postsError) throw postsError;

		// Add user data and like status to posts
		const postsWithUser = posts.map((post) => ({
			...post,
			user: post.profiles,
			liked_by_user: false // Will be updated on client side based on current user
		}));

		return {
			profile,
			posts: postsWithUser
		};
	} catch (err) {
		if (err.status) throw err;
		throw error(500, 'Failed to load profile');
	}
}
