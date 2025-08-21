import { supabase } from './supabase.js';
import { user, loading } from './stores.js';
import { validateEmail, validateUsername } from './utils.js';
import { initializeNotifications, cleanupNotifications } from './notifications.js';

/**
 * Initialize auth session
 */
export async function initializeAuth() {
  loading.set(true);
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      await loadUserProfile(session.user.id);
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
        initializeNotifications();
      } else if (event === 'SIGNED_OUT') {
        user.set(null);
        cleanupNotifications();
      }
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
  } finally {
    loading.set(false);
  }
}

/**
 * Load user profile from database
 * @param {string} userId - User ID
 */
async function loadUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If profile doesn't exist, create it (for first-time login after email confirmation)
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating new profile for user:', userId);
        // Set user as null to trigger profile creation flow
        user.set(null);
        return;
      }
      throw error;
    }
    
    user.set(data);
    
    // Initialize notifications after user is loaded
    setTimeout(() => initializeNotifications(), 100);
  } catch (error) {
    console.error('Error loading user profile:', error);
    user.set(null);
  }
}

/**
 * Sign up a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, error?: string, needsConfirmation?: boolean}>}
 */
export async function signUp(email, password) {
  // Validate inputs
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  try {
    
    // Get the current origin for redirect URL
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    // Sign up user - Supabase will send confirmation email
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo
      }
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      // Check if email confirmation is needed
      if (!authData.session || !authData.user.email_confirmed_at) {
        return { 
          success: true, 
          needsConfirmation: true,
          message: 'Please check your email and click the confirmation link to complete registration.'
        };
      }
      
      return { success: true };
    }
    
    return { success: false, error: 'Failed to create account' };
  } catch (error) {
    console.error('Signup error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create account' 
    };
  }
}

/**
 * Sign in user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signIn(email, password) {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }
  
  if (!password) {
    return { success: false, error: 'Password is required' };
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Signin error:', error);
    return { 
      success: false, 
      error: error.message === 'Invalid login credentials' 
        ? 'Invalid email or password'
        : error.message || 'Failed to sign in'
    };
  }
}

/**
 * Sign out user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOut() {
  try {
    cleanupNotifications();
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    user.set(null);
    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign out' 
    };
  }
}

/**
 * Reset password
 * @param {string} email - User email
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function resetPassword(email) {
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to send reset email' 
    };
  }
}

/**
 * Create user profile after email confirmation
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} displayName - Display name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createProfile(userId, username, displayName) {
  try {
    // Double-check username availability
    const { data: existingUsers, error: checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase());
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking username:', checkError);
      return { success: false, error: 'Failed to validate username' };
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return { success: false, error: 'Username already taken' };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username.toLowerCase(),
        display_name: displayName.trim(),
        bio: '',
        profile_pic_url: null
      })
      .select()
      .single();
    
    if (error) throw error;
    
    user.set(data);
    return { success: true };
  } catch (error) {
    console.error('Profile creation error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to create profile' 
    };
  }
}

/**
 * Sign in with Google
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signInWithGoogle() {
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Google OAuth error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign in with Google' 
    };
  }
}

/**
 * Sign in with GitHub
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signInWithGithub() {
  try {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo
      }
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to sign in with GitHub' 
    };
  }
}

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateProfile(updates) {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    user.set(data);
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to update profile' 
    };
  }
}