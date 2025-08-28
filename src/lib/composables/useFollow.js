import { user } from '../stores.js';
import { supabase } from '../supabase.js';
import { createNotification } from '../notifications.js';
import { get } from 'svelte/store';

/**
 * Composable for managing follow/unfollow functionality
 * @param {Object} options - Configuration options
 * @param {Function} [options.onFollowChange] - Callback when follow status changes
 * @param {Function} [options.onCountUpdate] - Callback to update follower count
 * @param {boolean} [options.createNotifications=true] - Whether to create notifications
 * @returns {Object} Follow management functions and state
 */
export function useFollow(options = {}) {
	const { onFollowChange, onCountUpdate, createNotifications = true } = options;

	/**
	 * Check if current user is following a target user
	 * @param {string} targetUserId - ID of user to check follow status for
	 * @returns {Promise<boolean>} - Whether current user is following target user
	 */
	async function checkFollowStatus(targetUserId) {
		const currentUser = get(user);
		// Can't follow yourself or check status when not logged in
		if (!currentUser || currentUser.id === targetUserId) {
			return false;
		}

		try {
			const { data, error } = await supabase
				.from('follows')
				.select('id') // We just need to know if the record exists
				.eq('follower_id', currentUser.id)
				.eq('following_id', targetUserId)
				.single();

			// Convert to boolean - data exists means we're following
			return !!data;
		} catch (error) {
			// Usually means no follow record exists, which is fine
			return false;
		}
	}

	/**
	 * Follow a user
	 * @param {string} targetUserId - ID of user to follow
	 * @param {string} [targetUserDisplayName] - Display name for notification
	 * @returns {Promise<{success: boolean, error?: string}>}
	 */
	async function followUser(targetUserId, targetUserDisplayName = '') {
		const currentUser = get(user);
		if (!currentUser || currentUser.id === targetUserId) {
			return { success: false, error: 'Cannot follow yourself' };
		}

		try {
			const { error } = await supabase.from('follows').insert({
				follower_id: currentUser.id,
				following_id: targetUserId
			});

			if (error) throw error;

			// Create notification if enabled
			if (createNotifications) {
				await createNotification(
					targetUserId,
					'follow',
					`${currentUser.display_name} started following you`,
					currentUser.id
				);
			}

			// Trigger callbacks
			if (onFollowChange) onFollowChange(true);
			if (onCountUpdate) onCountUpdate(1);

			return { success: true };
		} catch (error) {
			console.error('Error following user:', error);
			return { success: false, error: error.message };
		}
	}

	/**
	 * Unfollow a user
	 * @param {string} targetUserId - ID of user to unfollow
	 * @returns {Promise<{success: boolean, error?: string}>}
	 */
	async function unfollowUser(targetUserId) {
		const currentUser = get(user);
		if (!currentUser || currentUser.id === targetUserId) {
			return { success: false, error: 'Cannot unfollow yourself' };
		}

		try {
			const { error } = await supabase
				.from('follows')
				.delete()
				.eq('follower_id', currentUser.id)
				.eq('following_id', targetUserId);

			if (error) throw error;

			// Trigger callbacks
			if (onFollowChange) onFollowChange(false);
			if (onCountUpdate) onCountUpdate(-1);

			return { success: true };
		} catch (error) {
			console.error('Error unfollowing user:', error);
			return { success: false, error: error.message };
		}
	}

	/**
	 * Toggle follow status for a user
	 * @param {string} targetUserId - ID of user to toggle follow for
	 * @param {boolean} currentFollowState - Current follow state
	 * @param {string} [targetUserDisplayName] - Display name for notification
	 * @returns {Promise<{success: boolean, newState: boolean, error?: string}>}
	 */
	async function toggleFollow(targetUserId, currentFollowState, targetUserDisplayName = '') {
		if (currentFollowState) {
			const result = await unfollowUser(targetUserId);
			return {
				success: result.success,
				newState: false,
				error: result.error
			};
		} else {
			const result = await followUser(targetUserId, targetUserDisplayName);
			return {
				success: result.success,
				newState: true,
				error: result.error
			};
		}
	}

	/**
	 * Batch check follow status for multiple users
	 * @param {string[]} userIds - Array of user IDs to check
	 * @returns {Promise<{[userId: string]: boolean}>} - Map of user ID to follow status
	 */
	async function checkMultipleFollowStatus(userIds) {
		const currentUser = get(user);
		if (!currentUser || userIds.length === 0) {
			return {};
		}

		try {
			const { data, error } = await supabase
				.from('follows')
				.select('following_id')
				.eq('follower_id', currentUser.id)
				.in('following_id', userIds);

			if (error) throw error;

			const followStates = {};
			userIds.forEach(id => {
				followStates[id] = false;
			});

			data?.forEach(follow => {
				followStates[follow.following_id] = true;
			});

			return followStates;
		} catch (error) {
			console.error('Error checking multiple follow status:', error);
			return {};
		}
	}

	return {
		checkFollowStatus,
		followUser,
		unfollowUser,
		toggleFollow,
		checkMultipleFollowStatus
	};
}