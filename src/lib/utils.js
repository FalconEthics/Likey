import { debounce } from 'lodash';

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {Date | string} date - Date to format
 * @returns {string} Formatted relative time
 */
export function formatRelativeTime(date) {
  const now = new Date();
  const target = new Date(date);
  const diff = now - target;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 4) return `${weeks}w`;
  
  return target.toLocaleDateString();
}

/**
 * Extract hashtags from text
 * @param {string} text - Text to extract hashtags from
 * @returns {string[]} Array of hashtags
 */
export function extractHashtags(text) {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  return text.match(hashtagRegex) || [];
}

/**
 * Generate a unique filename for uploaded images
 * @param {string} userId - User ID
 * @param {string} originalName - Original filename
 * @returns {string} Unique filename
 */
export function generateImagePath(userId, originalName) {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${userId}/${timestamp}.${extension}`;
}

/**
 * Debounced search function
 */
export const debouncedSearch = debounce((searchTerm, callback) => {
  callback(searchTerm);
}, 300);

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUsername(username) {
  if (!username) return { valid: false, error: 'Username is required' };
  if (username.length < 3) return { valid: false, error: 'Username must be at least 3 characters' };
  if (username.length > 20) return { valid: false, error: 'Username must be less than 20 characters' };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email) return { valid: false, error: 'Email is required' };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return { valid: false, error: 'Invalid email format' };
  return { valid: true };
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 150) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}