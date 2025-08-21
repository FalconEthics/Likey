import { supabase } from '$lib/supabase.js';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const postId = params.id;

	if (!postId) {
		throw error(404, 'Post not found');
	}

	try {
		// Fetch the post with user data and engagement counts
		const { data: post, error: postError } = await supabase
			.from('posts')
			.select(`
				*,
				profiles:user_id (
					id,
					username,
					display_name,
					profile_pic_url
				),
				like_count:likes(count),
				comment_count:comments(count)
			`)
			.eq('id', postId)
			.single();

		if (postError || !post) {
			console.error('Post fetch error:', postError);
			throw error(404, 'Post not found');
		}

		// Check if current user liked this post (if authenticated)
		const { data: { user } } = await supabase.auth.getUser();
		let liked_by_user = false;

		if (user) {
			const { data: likeData } = await supabase
				.from('likes')
				.select('id')
				.eq('post_id', postId)
				.eq('user_id', user.id)
				.single();
			
			liked_by_user = !!likeData;
		}

		// Format the post data to match the expected structure
		const formattedPost = {
			...post,
			user: post.profiles,
			like_count: post.like_count[0]?.count || 0,
			comment_count: post.comment_count[0]?.count || 0,
			liked_by_user
		};

		return {
			post: formattedPost
		};
	} catch (err) {
		console.error('Error loading post:', err);
		throw error(500, 'Failed to load post');
	}
}