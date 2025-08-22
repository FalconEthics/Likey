import { writable } from 'svelte/store';

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} username
 * @property {string} display_name
 * @property {string} bio
 * @property {string} profile_pic_url
 * @property {Date} created_at
 */

/**
 * @typedef {Object} Post
 * @property {string} id
 * @property {string} user_id
 * @property {string} caption
 * @property {string[]} image_urls
 * @property {number} like_count
 * @property {number} comment_count
 * @property {Date} created_at
 * @property {User} user
 * @property {boolean} liked_by_user
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {string} user_id
 * @property {string} type - 'like' | 'comment' | 'follow'
 * @property {string} message
 * @property {boolean} read
 * @property {Date} created_at
 */

// Authentication state
/** @type {import('svelte/store').Writable<User | null>} */
export const user = writable(null);

/** @type {import('svelte/store').Writable<boolean>} */
export const loading = writable(true);

// Posts and feed
/** @type {import('svelte/store').Writable<Post[]>} */
export const posts = writable([]);

/** @type {import('svelte/store').Writable<boolean>} */
export const feedLoading = writable(false);

// Notifications
/** @type {import('svelte/store').Writable<Notification[]>} */
export const notifications = writable([]);

/** @type {import('svelte/store').Writable<number>} */
export const unreadCount = writable(0);

// Theme
/** @type {import('svelte/store').Writable<string>} */
export const theme = writable('light');

// Modal states
/** @type {import('svelte/store').Writable<boolean>} */
export const showCreatePost = writable(false);

/** @type {import('svelte/store').Writable<boolean>} */
export const showLogin = writable(false);

/** @type {import('svelte/store').Writable<boolean>} */
export const showSignup = writable(false);

// Messages and conversations
/** @type {import('svelte/store').Writable<any[]>} */
export const conversations = writable([]);

/** @type {import('svelte/store').Writable<number>} */
export const unreadMessageCount = writable(0);

/** @type {import('svelte/store').Writable<any[]>} */
export const currentMessages = writable([]);

/** @type {import('svelte/store').Writable<string | null>} */
export const currentConversationId = writable(null);

// Search and explore
/** @type {import('svelte/store').Writable<any[]>} */
export const searchResults = writable([]);

/** @type {import('svelte/store').Writable<boolean>} */
export const searchLoading = writable(false);

/** @type {import('svelte/store').Writable<string>} */
export const searchQuery = writable('');

/** @type {import('svelte/store').Writable<any[]>} */
export const trendingPosts = writable([]);

/** @type {import('svelte/store').Writable<any[]>} */
export const recommendedUsers = writable([]);

/** @type {import('svelte/store').Writable<any[]>} */
export const trendingUsers = writable([]);
