import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	formatRelativeTime,
	extractHashtags,
	generateImagePath,
	validateUsername,
	validateEmail,
	truncateText
} from './utils.js';

describe('formatRelativeTime', () => {
	it('should return "just now" for recent dates', () => {
		const now = new Date();
		const fiveSecondsAgo = new Date(now.getTime() - 5000);
		
		expect(formatRelativeTime(fiveSecondsAgo)).toBe('just now');
	});

	it('should return minutes for dates within an hour', () => {
		const now = new Date();
		const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
		
		expect(formatRelativeTime(thirtyMinutesAgo)).toBe('30m');
	});

	it('should return hours for dates within a day', () => {
		const now = new Date();
		const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
		
		expect(formatRelativeTime(fiveHoursAgo)).toBe('5h');
	});

	it('should return days for dates within a week', () => {
		const now = new Date();
		const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
		
		expect(formatRelativeTime(threeDaysAgo)).toBe('3d');
	});

	it('should return weeks for dates within a month', () => {
		const now = new Date();
		const twoWeeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
		
		expect(formatRelativeTime(twoWeeksAgo)).toBe('2w');
	});

	it('should return localized date for dates older than 4 weeks', () => {
		const now = new Date();
		const twoMonthsAgo = new Date(now.getTime() - 2 * 30 * 24 * 60 * 60 * 1000);
		
		const result = formatRelativeTime(twoMonthsAgo);
		expect(result).toContain('/'); // Should be a formatted date
	});

	it('should handle string dates', () => {
		const now = new Date();
		const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
		
		expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('1h');
	});
});

describe('extractHashtags', () => {
	it('should extract single hashtag', () => {
		const text = 'This is a post with #javascript content';
		const hashtags = extractHashtags(text);
		
		expect(hashtags).toEqual(['#javascript']);
	});

	it('should extract multiple hashtags', () => {
		const text = 'Learning #javascript and #react today #coding';
		const hashtags = extractHashtags(text);
		
		expect(hashtags).toEqual(['#javascript', '#react', '#coding']);
	});

	it('should handle hashtags with numbers and underscores', () => {
		const text = 'Check out #web3_dev and #nextjs14 trends';
		const hashtags = extractHashtags(text);
		
		expect(hashtags).toEqual(['#web3_dev', '#nextjs14']);
	});

	it('should return empty array when no hashtags found', () => {
		const text = 'Just a regular post without any hashtags';
		const hashtags = extractHashtags(text);
		
		expect(hashtags).toEqual([]);
	});

	it('should ignore hashtags in middle of words', () => {
		const text = 'email@domain.com should not be tagged but #real_tag should';
		const hashtags = extractHashtags(text);
		
		expect(hashtags).toEqual(['#real_tag']);
	});
});

describe('generateImagePath', () => {
	beforeEach(() => {
		// Mock Date.now to return a consistent timestamp
		vi.spyOn(Date, 'now').mockReturnValue(1642785600000); // Jan 21, 2022
	});

	it('should generate path with user ID and timestamp', () => {
		const userId = 'user-123';
		const originalName = 'photo.jpg';
		
		const path = generateImagePath(userId, originalName);
		
		expect(path).toBe('user-123/1642785600000.jpg');
	});

	it('should preserve file extension', () => {
		const userId = 'user-456';
		const originalName = 'image.png';
		
		const path = generateImagePath(userId, originalName);
		
		expect(path).toBe('user-456/1642785600000.png');
	});

	it('should handle files with multiple dots', () => {
		const userId = 'user-789';
		const originalName = 'my.photo.backup.jpeg';
		
		const path = generateImagePath(userId, originalName);
		
		expect(path).toBe('user-789/1642785600000.jpeg');
	});

	it('should handle files without extension', () => {
		const userId = 'user-000';
		const originalName = 'filename';
		
		const path = generateImagePath(userId, originalName);
		
		expect(path).toBe('user-000/1642785600000.filename');
	});
});

describe('validateUsername', () => {
	it('should validate correct usernames', () => {
		const validUsernames = ['john_doe', 'user123', 'developer', 'test_user_2024'];
		
		validUsernames.forEach(username => {
			const result = validateUsername(username);
			expect(result.valid).toBe(true);
		});
	});

	it('should reject empty or null usernames', () => {
		expect(validateUsername('').valid).toBe(false);
		expect(validateUsername(null).valid).toBe(false);
		expect(validateUsername(undefined).valid).toBe(false);
	});

	it('should reject usernames that are too short', () => {
		const result = validateUsername('ab');
		
		expect(result.valid).toBe(false);
		expect(result.error).toBe('Username must be at least 3 characters');
	});

	it('should reject usernames that are too long', () => {
		const result = validateUsername('a'.repeat(21));
		
		expect(result.valid).toBe(false);
		expect(result.error).toBe('Username must be less than 20 characters');
	});

	it('should reject usernames with invalid characters', () => {
		const invalidUsernames = ['user@name', 'user name', 'user-name', 'user.name', 'user#123'];
		
		invalidUsernames.forEach(username => {
			const result = validateUsername(username);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Username can only contain letters, numbers, and underscores');
		});
	});
});

describe('validateEmail', () => {
	it('should validate correct email addresses', () => {
		const validEmails = [
			'user@example.com',
			'test.email@domain.org',
			'user+tag@example.co.uk',
			'firstname.lastname@company.com'
		];
		
		validEmails.forEach(email => {
			const result = validateEmail(email);
			expect(result.valid).toBe(true);
		});
	});

	it('should reject empty or null emails', () => {
		expect(validateEmail('').valid).toBe(false);
		expect(validateEmail(null).valid).toBe(false);
		expect(validateEmail(undefined).valid).toBe(false);
	});

	it('should reject invalid email formats', () => {
		const invalidEmails = [
			'notanemail',
			'user@',
			'@domain.com',
			'user.domain.com',
			'user @domain.com',
			'user@domain',
			'user@.com'
		];
		
		invalidEmails.forEach(email => {
			const result = validateEmail(email);
			expect(result.valid).toBe(false);
			expect(result.error).toBe('Invalid email format');
		});
	});
});

describe('truncateText', () => {
	it('should return original text if shorter than limit', () => {
		const text = 'Short text';
		const result = truncateText(text, 150);
		
		expect(result).toBe('Short text');
	});

	it('should truncate text longer than limit', () => {
		const text = 'A'.repeat(200);
		const result = truncateText(text, 150);
		
		expect(result).toBe('A'.repeat(150) + '...');
	});

	it('should use default limit of 150 characters', () => {
		const text = 'A'.repeat(200);
		const result = truncateText(text);
		
		expect(result).toBe('A'.repeat(150) + '...');
	});

	it('should handle edge case of exact limit length', () => {
		const text = 'A'.repeat(150);
		const result = truncateText(text, 150);
		
		expect(result).toBe(text);
	});
});