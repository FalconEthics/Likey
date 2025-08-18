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
    
    if (error) throw error;
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
 * @param {string} username - Unique username
 * @param {string} displayName - Display name
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signUp(email, password, username, displayName) {
  // Validate inputs
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { success: false, error: emailValidation.error };
  }
  
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return { success: false, error: usernameValidation.error };
  }
  
  if (!displayName?.trim()) {
    return { success: false, error: 'Display name is required' };
  }
  
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }
  
  try {
    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();
    
    if (existingUser) {
      return { success: false, error: 'Username already taken' };
    }
    
    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username.toLowerCase(),
          display_name: displayName.trim(),
          bio: '',
          profile_pic_url: null
        });
      
      if (profileError) throw profileError;
      
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