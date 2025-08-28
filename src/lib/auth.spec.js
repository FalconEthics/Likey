import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	signUp,
	signIn,
	signOut,
	resetPassword,
	createProfile,
	signInWithGoogle,
	signInWithGithub,
	updateProfile,
	initializeAuth
} from './auth.js';

// Mock the dependencies
vi.mock('./supabase.js', () => ({
	supabase: {
		auth: {
			getSession: vi.fn(),
			onAuthStateChange: vi.fn(),
			signUp: vi.fn(),
			signInWithPassword: vi.fn(),
			signOut: vi.fn(),
			resetPasswordForEmail: vi.fn(),
			signInWithOAuth: vi.fn(),
			getUser: vi.fn()
		},
		from: vi.fn(() => ({
			select: vi.fn(() => ({
				eq: vi.fn(() => ({
					single: vi.fn()
				}))
			})),
			insert: vi.fn(() => ({
				select: vi.fn(() => ({
					single: vi.fn()
				}))
			})),
			update: vi.fn(() => ({
				eq: vi.fn(() => ({
					select: vi.fn(() => ({
						single: vi.fn()
					}))
				}))
			}))
		}))
	}
}));

vi.mock('./stores.js', () => ({
	user: {
		set: vi.fn()
	},
	loading: {
		set: vi.fn()
	}
}));

vi.mock('./notifications.js', () => ({
	initializeNotifications: vi.fn(),
	cleanupNotifications: vi.fn()
}));

// Mock validateEmail and validateUsername from utils
vi.mock('./utils.js', () => ({
	validateEmail: vi.fn(),
	validateUsername: vi.fn()
}));

import { supabase } from './supabase.js';
import { user, loading } from './stores.js';
import { initializeNotifications, cleanupNotifications } from './notifications.js';
import { validateEmail } from './utils.js';

describe('signUp', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock window.location.origin for browser environment
		Object.defineProperty(window, 'location', {
			value: { origin: 'http://localhost:5173' },
			writable: true
		});
	});

	it('should validate email before signup', async () => {
		validateEmail.mockReturnValue({ valid: false, error: 'Invalid email format' });

		const result = await signUp('invalid-email', 'password123');

		expect(validateEmail).toHaveBeenCalledWith('invalid-email');
		expect(result).toEqual({
			success: false,
			error: 'Invalid email format'
		});
	});

	it('should validate password length', async () => {
		validateEmail.mockReturnValue({ valid: true });

		const result = await signUp('test@example.com', '123');

		expect(result).toEqual({
			success: false,
			error: 'Password must be at least 6 characters'
		});
	});

	it('should sign up user successfully with email confirmation required', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signUp.mockResolvedValue({
			data: {
				user: { id: 'user-123', email_confirmed_at: null },
				session: null
			},
			error: null
		});

		const result = await signUp('test@example.com', 'password123');

		expect(supabase.auth.signUp).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123',
			options: {
				emailRedirectTo: 'http://localhost:5173'
			}
		});

		expect(result).toEqual({
			success: true,
			needsConfirmation: true,
			message: 'Please check your email and click the confirmation link to complete registration.'
		});
	});

	it('should sign up user successfully when email is already confirmed', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signUp.mockResolvedValue({
			data: {
				user: { id: 'user-123', email_confirmed_at: '2024-01-01T00:00:00Z' },
				session: { access_token: 'token' }
			},
			error: null
		});

		const result = await signUp('test@example.com', 'password123');

		expect(result).toEqual({ success: true });
	});

	it('should handle signup errors', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signUp.mockResolvedValue({
			data: null,
			error: { message: 'User already registered' }
		});

		const result = await signUp('test@example.com', 'password123');

		expect(result).toEqual({
			success: false,
			error: 'User already registered'
		});
	});

	it('should handle case when no user is returned', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signUp.mockResolvedValue({
			data: { user: null },
			error: null
		});

		const result = await signUp('test@example.com', 'password123');

		expect(result).toEqual({
			success: false,
			error: 'Failed to create account'
		});
	});
});

describe('signIn', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should validate email before signin', async () => {
		validateEmail.mockReturnValue({ valid: false, error: 'Invalid email format' });

		const result = await signIn('invalid-email', 'password123');

		expect(validateEmail).toHaveBeenCalledWith('invalid-email');
		expect(result).toEqual({
			success: false,
			error: 'Invalid email format'
		});
	});

	it('should require password', async () => {
		validateEmail.mockReturnValue({ valid: true });

		const result = await signIn('test@example.com', '');

		expect(result).toEqual({
			success: false,
			error: 'Password is required'
		});
	});

	it('should sign in user successfully', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signInWithPassword.mockResolvedValue({
			data: { user: { id: 'user-123' } },
			error: null
		});

		const result = await signIn('test@example.com', 'password123');

		expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'password123'
		});

		expect(result).toEqual({ success: true });
	});

	it('should handle invalid credentials with user-friendly message', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signInWithPassword.mockResolvedValue({
			data: null,
			error: { message: 'Invalid login credentials' }
		});

		const result = await signIn('test@example.com', 'wrongpassword');

		expect(result).toEqual({
			success: false,
			error: 'Invalid email or password'
		});
	});

	it('should handle other signin errors', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.signInWithPassword.mockResolvedValue({
			data: null,
			error: { message: 'Network error' }
		});

		const result = await signIn('test@example.com', 'password123');

		expect(result).toEqual({
			success: false,
			error: 'Network error'
		});
	});
});

describe('signOut', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should sign out successfully', async () => {
		supabase.auth.signOut.mockResolvedValue({ error: null });

		const result = await signOut();

		expect(cleanupNotifications).toHaveBeenCalled();
		expect(supabase.auth.signOut).toHaveBeenCalled();
		expect(user.set).toHaveBeenCalledWith(null);
		expect(result).toEqual({ success: true });
	});

	it('should handle signout errors', async () => {
		supabase.auth.signOut.mockResolvedValue({
			error: { message: 'Network error' }
		});

		const result = await signOut();

		expect(result).toEqual({
			success: false,
			error: 'Network error'
		});
	});
});

describe('resetPassword', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should validate email before reset', async () => {
		validateEmail.mockReturnValue({ valid: false, error: 'Invalid email format' });

		const result = await resetPassword('invalid-email');

		expect(validateEmail).toHaveBeenCalledWith('invalid-email');
		expect(result).toEqual({
			success: false,
			error: 'Invalid email format'
		});
	});

	it('should send reset email successfully', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

		const result = await resetPassword('test@example.com');

		expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
		expect(result).toEqual({ success: true });
	});

	it('should handle reset password errors', async () => {
		validateEmail.mockReturnValue({ valid: true });
		supabase.auth.resetPasswordForEmail.mockResolvedValue({
			error: { message: 'Email not found' }
		});

		const result = await resetPassword('test@example.com');

		expect(result).toEqual({
			success: false,
			error: 'Email not found'
		});
	});
});

describe('createProfile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should create profile successfully when username is available', async () => {
		// Mock username check - no existing users
		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({
				data: [],
				error: { code: 'PGRST116' } // No rows found
			})
		});
		supabase.from.mockReturnValueOnce({
			select: selectMock
		});

		// Mock profile creation
		const insertMock = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: {
						id: 'user-123',
						username: 'testuser',
						display_name: 'Test User'
					},
					error: null
				})
			})
		});
		supabase.from.mockReturnValueOnce({
			insert: insertMock
		});

		const result = await createProfile('user-123', 'testuser', 'Test User');

		expect(user.set).toHaveBeenCalledWith({
			id: 'user-123',
			username: 'testuser',
			display_name: 'Test User'
		});
		expect(result).toEqual({ success: true });
	});

	it('should fail when username is already taken', async () => {
		// Mock username check - existing user found
		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({
				data: [{ username: 'testuser' }],
				error: null
			})
		});
		supabase.from.mockReturnValueOnce({
			select: selectMock
		});

		const result = await createProfile('user-123', 'testuser', 'Test User');

		expect(result).toEqual({
			success: false,
			error: 'Username already taken'
		});
	});

	it('should handle database errors during username check', async () => {
		// Mock username check error
		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({
				data: null,
				error: { code: 'CONNECTION_ERROR', message: 'Database connection failed' }
			})
		});
		supabase.from.mockReturnValueOnce({
			select: selectMock
		});

		const result = await createProfile('user-123', 'testuser', 'Test User');

		expect(result).toEqual({
			success: false,
			error: 'Failed to validate username'
		});
	});

	it('should handle profile creation errors', async () => {
		// Mock username check - username available
		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockResolvedValue({
				data: [],
				error: { code: 'PGRST116' }
			})
		});
		supabase.from.mockReturnValueOnce({
			select: selectMock
		});

		// Mock profile creation error
		const insertMock = vi.fn().mockReturnValue({
			select: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: null,
					error: { message: 'Database constraint violation' }
				})
			})
		});
		supabase.from.mockReturnValueOnce({
			insert: insertMock
		});

		const result = await createProfile('user-123', 'testuser', 'Test User');

		expect(result).toEqual({
			success: false,
			error: 'Database constraint violation'
		});
	});
});

describe('OAuth sign in methods', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window, 'location', {
			value: { origin: 'http://localhost:5173' },
			writable: true
		});
	});

	describe('signInWithGoogle', () => {
		it('should initiate Google OAuth successfully', async () => {
			supabase.auth.signInWithOAuth.mockResolvedValue({
				data: { url: 'https://accounts.google.com/oauth/authorize' },
				error: null
			});

			const result = await signInWithGoogle();

			expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
				provider: 'google',
				options: {
					redirectTo: 'http://localhost:5173'
				}
			});

			expect(result).toEqual({ success: true });
		});

		it('should handle Google OAuth errors', async () => {
			supabase.auth.signInWithOAuth.mockResolvedValue({
				data: null,
				error: { message: 'OAuth provider unavailable' }
			});

			const result = await signInWithGoogle();

			expect(result).toEqual({
				success: false,
				error: 'OAuth provider unavailable'
			});
		});
	});

	describe('signInWithGithub', () => {
		it('should initiate GitHub OAuth successfully', async () => {
			supabase.auth.signInWithOAuth.mockResolvedValue({
				data: { url: 'https://github.com/login/oauth/authorize' },
				error: null
			});

			const result = await signInWithGithub();

			expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
				provider: 'github',
				options: {
					redirectTo: 'http://localhost:5173'
				}
			});

			expect(result).toEqual({ success: true });
		});

		it('should handle GitHub OAuth errors', async () => {
			supabase.auth.signInWithOAuth.mockResolvedValue({
				data: null,
				error: { message: 'GitHub OAuth failed' }
			});

			const result = await signInWithGithub();

			expect(result).toEqual({
				success: false,
				error: 'GitHub OAuth failed'
			});
		});
	});
});

describe('updateProfile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should update profile successfully', async () => {
		supabase.auth.getUser.mockResolvedValue({
			data: { user: { id: 'user-123' } }
		});

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: {
							id: 'user-123',
							display_name: 'Updated Name',
							bio: 'New bio'
						},
						error: null
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		const updates = { display_name: 'Updated Name', bio: 'New bio' };
		const result = await updateProfile(updates);

		expect(updateMock).toHaveBeenCalledWith(updates);
		expect(user.set).toHaveBeenCalledWith({
			id: 'user-123',
			display_name: 'Updated Name',
			bio: 'New bio'
		});
		expect(result).toEqual({ success: true });
	});

	it('should fail when user is not authenticated', async () => {
		supabase.auth.getUser.mockResolvedValue({
			data: { user: null }
		});

		const result = await updateProfile({ display_name: 'New Name' });

		expect(result).toEqual({
			success: false,
			error: 'Not authenticated'
		});
	});

	it('should handle profile update errors', async () => {
		supabase.auth.getUser.mockResolvedValue({
			data: { user: { id: 'user-123' } }
		});

		const updateMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				select: vi.fn().mockReturnValue({
					single: vi.fn().mockResolvedValue({
						data: null,
						error: { message: 'Update failed' }
					})
				})
			})
		});

		supabase.from.mockReturnValue({
			update: updateMock
		});

		const result = await updateProfile({ display_name: 'New Name' });

		expect(result).toEqual({
			success: false,
			error: 'Update failed'
		});
	});
});

describe('initializeAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should initialize auth with existing session', async () => {
		const mockUser = { id: 'user-123' };
		const mockProfile = { id: 'user-123', username: 'testuser' };

		supabase.auth.getSession.mockResolvedValue({
			data: {
				session: {
					user: mockUser
				}
			}
		});

		// Mock profile loading
		const selectMock = vi.fn().mockReturnValue({
			eq: vi.fn().mockReturnValue({
				single: vi.fn().mockResolvedValue({
					data: mockProfile,
					error: null
				})
			})
		});
		supabase.from.mockReturnValue({
			select: selectMock
		});

		// Mock setTimeout to execute immediately in tests
		vi.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());

		await initializeAuth();

		expect(loading.set).toHaveBeenCalledWith(true);
		expect(supabase.auth.getSession).toHaveBeenCalled();
		expect(user.set).toHaveBeenCalledWith(mockProfile);
		expect(loading.set).toHaveBeenCalledWith(false);
		expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
	});

	it('should initialize auth with no session', async () => {
		supabase.auth.getSession.mockResolvedValue({
			data: { session: null }
		});

		await initializeAuth();

		expect(loading.set).toHaveBeenCalledWith(true);
		expect(supabase.auth.getSession).toHaveBeenCalled();
		expect(loading.set).toHaveBeenCalledWith(false);
		expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
	});

	it('should handle auth initialization errors', async () => {
		supabase.auth.getSession.mockRejectedValue(new Error('Network error'));

		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		await initializeAuth();

		expect(loading.set).toHaveBeenCalledWith(true);
		expect(consoleSpy).toHaveBeenCalledWith('Auth initialization error:', expect.any(Error));
		expect(loading.set).toHaveBeenCalledWith(false);

		consoleSpy.mockRestore();
	});
});