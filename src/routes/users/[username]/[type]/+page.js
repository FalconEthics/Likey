import { supabase } from '$lib/supabase.js';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	const { username, type } = params;

	// Validate type
	if (type !== 'followers' && type !== 'following') {
		throw error(404, 'Page not found');
	}

	// Get the user profile
	const { data: profile, error: profileError } = await supabase
		.from('profiles')
		.select('id, username, display_name, profile_pic_url, followers_count, following_count')
		.eq('username', username)
		.single();

	if (profileError || !profile) {
		throw error(404, 'User not found');
	}

	// Get current user info if authenticated
	const { data: { user: currentUser } } = await supabase.auth.getUser();
	let currentUserProfile = null;

	if (currentUser) {
		const { data: currentProfile } = await supabase
			.from('profiles')
			.select('*')
			.eq('id', currentUser.id)
			.single();
		currentUserProfile = currentProfile;
	}

	return {
		profile,
		type,
		currentUser: currentUserProfile
	};
}