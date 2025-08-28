import { supabase } from './supabase.js';
import { notifications, unreadCount, user } from './stores.js';
import { get } from 'svelte/store';

let notificationSubscription = null;

/**
 * Initialize real-time notifications
 */
export function initializeNotifications() {
	const currentUser = get(user);
	if (!currentUser) return;

	// Load existing notifications
	loadNotifications();

	// Subscribe to real-time updates
	subscribeToNotifications(currentUser.id);
}

/**
 * Load existing notifications from database
 */
async function loadNotifications() {
	const currentUser = get(user);
	if (!currentUser) return;

	try {
		const { data, error } = await supabase
			.from('notifications')
			.select(
				`
				*,
				related_user:related_user_id (
					username,
					display_name,
					profile_pic_url
				)
			`
			)
			.eq('user_id', currentUser.id)
			.order('created_at', { ascending: false })
			.limit(50);

		if (error) throw error;

		notifications.set(data || []);

		// Count unread notifications
		const unread = data?.filter((n) => !n.read).length || 0;
		unreadCount.set(unread);
	} catch (error) {
		console.error('Error loading notifications:', error);
	}
}

/**
 * Subscribe to real-time notification updates
 * @param {string} userId - Current user ID
 */
function subscribeToNotifications(userId) {
	// Prevent memory leaks by cleaning up previous subscriptions
	if (notificationSubscription) {
		notificationSubscription.unsubscribe();
	}

	// Set up real-time listening for new notifications
	notificationSubscription = supabase
		.channel('notifications')
		.on(
			'postgres_changes',
			{
				event: 'INSERT', // Only listen for new notifications
				schema: 'public',
				table: 'notifications',
				filter: `user_id=eq.${userId}` // Only get notifications for this user
			},
			async (payload) => {
				// The webhook payload only has basic data, so we need to fetch the full record
				// This gets us the user profile data for the notification sender
				const { data, error } = await supabase
					.from('notifications')
					.select(
						`
						*,
						related_user:related_user_id (
							username,
							display_name,
							profile_pic_url
						)
					`
					)
					.eq('id', payload.new.id)
					.single();

				if (!error && data) {
					// Add to front of notifications list (newest first)
					notifications.update((current) => [data, ...current]);

					// Bump the unread counter
					unreadCount.update((count) => count + 1);

					// Show OS-level notification if user allowed it
					showBrowserNotification(data);
				}
			}
		)
		.subscribe();
}

/**
 * Clean up notification subscription
 */
export function cleanupNotifications() {
	if (notificationSubscription) {
		notificationSubscription.unsubscribe();
		notificationSubscription = null;
	}
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 */
export async function markNotificationAsRead(notificationId) {
	try {
		const { error } = await supabase
			.from('notifications')
			.update({ read: true })
			.eq('id', notificationId);

		if (error) throw error;

		// Update local store
		notifications.update((current) =>
			current.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
		);

		// Update unread count
		unreadCount.update((count) => Math.max(0, count - 1));
	} catch (error) {
		console.error('Error marking notification as read:', error);
	}
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
	const currentUser = get(user);
	if (!currentUser) return;

	try {
		const { error } = await supabase
			.from('notifications')
			.update({ read: true })
			.eq('user_id', currentUser.id)
			.eq('read', false);

		if (error) throw error;

		// Update local store
		notifications.update((current) => current.map((n) => ({ ...n, read: true })));

		// Reset unread count
		unreadCount.set(0);
	} catch (error) {
		console.error('Error marking all notifications as read:', error);
	}
}

/**
 * Create a notification
 * @param {string} userId - User ID to notify
 * @param {string} type - Notification type ('like', 'comment', 'follow')
 * @param {string} message - Notification message
 * @param {string} relatedUserId - ID of user who triggered the notification
 * @param {string} relatedPostId - ID of related post (optional)
 */
export async function createNotification(
	userId,
	type,
	message,
	relatedUserId,
	relatedPostId = null
) {
	// Don't notify users about their own actions
	const currentUser = get(user);
	if (currentUser?.id === userId) return;

	try {
		const { error } = await supabase.from('notifications').insert({
			user_id: userId,
			type,
			message,
			related_user_id: relatedUserId,
			related_post_id: relatedPostId
		});

		if (error) throw error;
	} catch (error) {
		console.error('Error creating notification:', error);
	}
}

/**
 * Request notification permission and show browser notification
 * @param {Object} notification - Notification data
 */
function showBrowserNotification(notification) {
	if ('Notification' in window && Notification.permission === 'granted') {
		new Notification('Likey', {
			body: notification.message,
			icon: '/favicon.ico',
			tag: notification.id
		});
	}
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission() {
	if ('Notification' in window && Notification.permission === 'default') {
		const permission = await Notification.requestPermission();
		return permission === 'granted';
	}
	return Notification.permission === 'granted';
}
