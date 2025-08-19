<script>
  import { createProfile } from '../auth.js';
  import { user } from '../stores.js';
  import { supabase } from '../supabase.js';
  
  let username = $state('');
  let displayName = $state('');
  let loading = $state(false);
  let error = $state('');
  
  // Get current auth user
  let authUser = $state(null);
  
  // Load auth user data on mount
  async function loadAuthUser() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      authUser = data.user;
      // Pre-fill from metadata if available
      username = data.user.user_metadata?.username || '';
      displayName = data.user.user_metadata?.display_name || '';
      
      // Check if profile already exists
      await checkExistingProfile(data.user.id);
    }
  }
  
  // Check if user already has a profile
  async function checkExistingProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data && !error) {
        // Profile already exists, update the user store and this will hide the modal
        user.set(data);
      }
    } catch (err) {
      console.log('No existing profile found, showing setup form');
    }
  }
  
  // Load auth user when component mounts
  loadAuthUser();
  
  async function handleCreateProfile(event) {
    event.preventDefault();
    
    console.log('handleCreateProfile called');
    console.log('authUser:', authUser);
    console.log('username:', username);
    console.log('displayName:', displayName);
    
    if (!authUser) {
      console.error('No auth user found');
      return;
    }
    
    if (!username.trim() || !displayName.trim()) {
      error = 'Username and display name are required';
      return;
    }
    
    error = '';
    loading = true;
    
    try {
      console.log('Calling createProfile...');
      const result = await createProfile(authUser.id, username, displayName);
      console.log('createProfile result:', result);
      
      if (result.success) {
        // Profile created successfully, user store is updated
        console.log('Profile created successfully');
      } else {
        if (result.error === 'Username already taken') {
          error = 'Username already taken. Please try a different username.';
        } else {
          error = result.error;
        }
        console.error('Profile creation failed:', result.error);
      }
    } catch (err) {
      error = 'Failed to create profile';
      console.error('Profile creation error:', err);
    } finally {
      loading = false;
      console.log('Final loading state:', loading);
      console.log('Final error state:', error);
    }
  }
</script>

<div class="modal modal-open">
  <div class="modal-box">
    <h3 class="font-bold text-lg mb-4">Complete Your Profile</h3>
    <p class="mb-4 text-sm text-base-content/70">
      Welcome! Please complete your profile to get started.
    </p>
    
    <form onsubmit={handleCreateProfile} class="space-y-4">
      <div class="form-control">
        <label class="label" for="username">
          <span class="label-text">Username</span>
        </label>
        <input
          id="username"
          type="text"
          bind:value={username}
          class="input input-bordered"
          placeholder="Enter your username"
          required
          disabled={loading}
        />
      </div>
      
      <div class="form-control">
        <label class="label" for="display-name">
          <span class="label-text">Display Name</span>
        </label>
        <input
          id="display-name"
          type="text"
          bind:value={displayName}
          class="input input-bordered"
          placeholder="Enter your display name"
          required
          disabled={loading}
        />
      </div>
      
      {#if error}
        <div class="alert alert-error">
          <span>{error}</span>
        </div>
      {/if}
      
      <div class="modal-action">
        <button 
          type="submit" 
          class="btn btn-primary"
          disabled={loading || !username.trim() || !displayName.trim()}
        >
          {#if loading}
            <span class="loading loading-spinner loading-sm"></span>
            Creating Profile...
          {:else}
            Complete Setup
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>