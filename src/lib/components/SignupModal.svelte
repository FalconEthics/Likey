<script>
  import { signUp } from '../auth.js';
  import { showSignup, showLogin } from '../stores.js';
  import { validateEmail, validateUsername } from '../utils.js';
  
  let email = '';
  let password = '';
  let confirmPassword = '';
  let username = '';
  let displayName = '';
  let loading = false;
  let errors = {};
  let touched = {};
  
  $: {
    errors = {};
    
    if (touched.email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        errors.email = emailValidation.error;
      }
    }
    
    if (touched.username) {
      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        errors.username = usernameValidation.error;
      }
    }
    
    if (touched.password && password && password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (touched.confirmPassword && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (touched.displayName && !displayName?.trim()) {
      errors.displayName = 'Display name is required';
    }
  }
  
  $: canSubmit = email && password && confirmPassword && username && displayName && 
                 Object.keys(errors).length === 0 && password === confirmPassword;
  
  /**
   * Handle form field blur
   * @param {string} field
   */
  function handleBlur(field) {
    touched[field] = true;
  }
  
  /**
   * Handle signup form submission
   * @param {Event} event
   */
  async function handleSignup(event) {
    event.preventDefault();
    
    // Mark all fields as touched for validation
    touched = { email: true, password: true, confirmPassword: true, username: true, displayName: true };
    
    if (!canSubmit) return;
    
    loading = true;
    
    const result = await signUp(email, password, username, displayName);
    
    if (result.success) {
      showSignup.set(false);
      // Reset form
      email = '';
      password = '';
      confirmPassword = '';
      username = '';
      displayName = '';
      touched = {};
    } else {
      if (result.error.includes('username')) {
        errors.username = result.error;
      } else if (result.error.includes('email')) {
        errors.email = result.error;
      } else {
        errors.general = result.error;
      }
    }
    
    loading = false;
  }
  
  function switchToLogin() {
    showSignup.set(false);
    showLogin.set(true);
  }
  
  function closeModal() {
    showSignup.set(false);
    email = '';
    password = '';
    confirmPassword = '';
    username = '';
    displayName = '';
    errors = {};
    touched = {};
  }
</script>

<div class="modal modal-open">
  <div class="modal-box">
    <button 
      class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
      on:click={closeModal}
    >
      ✕
    </button>
    
    <h3 class="font-bold text-lg mb-4">Create Account</h3>
    
    <form on:submit={handleSignup} class="space-y-4">
      <div class="form-control">
        <label class="label" for="signup-email">
          <span class="label-text">Email</span>
        </label>
        <input 
          id="signup-email"
          type="email" 
          class="input input-bordered" 
          class:input-error={errors.email}
          bind:value={email}
          on:blur={() => handleBlur('email')}
          required
          disabled={loading}
        />
        {#if errors.email}
          <div class="label">
            <span class="label-text-alt text-error">{errors.email}</span>
          </div>
        {/if}
      </div>
      
      <div class="form-control">
        <label class="label" for="signup-username">
          <span class="label-text">Username</span>
        </label>
        <input 
          id="signup-username"
          type="text" 
          class="input input-bordered" 
          class:input-error={errors.username}
          bind:value={username}
          on:blur={() => handleBlur('username')}
          required
          disabled={loading}
          placeholder="johndoe"
        />
        {#if errors.username}
          <div class="label">
            <span class="label-text-alt text-error">{errors.username}</span>
          </div>
        {/if}
      </div>
      
      <div class="form-control">
        <label class="label" for="signup-display-name">
          <span class="label-text">Display Name</span>
        </label>
        <input 
          id="signup-display-name"
          type="text" 
          class="input input-bordered" 
          class:input-error={errors.displayName}
          bind:value={displayName}
          on:blur={() => handleBlur('displayName')}
          required
          disabled={loading}
          placeholder="John Doe"
        />
        {#if errors.displayName}
          <div class="label">
            <span class="label-text-alt text-error">{errors.displayName}</span>
          </div>
        {/if}
      </div>
      
      <div class="form-control">
        <label class="label" for="signup-password">
          <span class="label-text">Password</span>
        </label>
        <input 
          id="signup-password"
          type="password" 
          class="input input-bordered" 
          class:input-error={errors.password}
          bind:value={password}
          on:blur={() => handleBlur('password')}
          required
          disabled={loading}
        />
        {#if errors.password}
          <div class="label">
            <span class="label-text-alt text-error">{errors.password}</span>
          </div>
        {/if}
      </div>
      
      <div class="form-control">
        <label class="label" for="signup-confirm-password">
          <span class="label-text">Confirm Password</span>
        </label>
        <input 
          id="signup-confirm-password"
          type="password" 
          class="input input-bordered" 
          class:input-error={errors.confirmPassword}
          bind:value={confirmPassword}
          on:blur={() => handleBlur('confirmPassword')}
          required
          disabled={loading}
        />
        {#if errors.confirmPassword}
          <div class="label">
            <span class="label-text-alt text-error">{errors.confirmPassword}</span>
          </div>
        {/if}
      </div>
      
      {#if errors.general}
        <div class="alert alert-error">
          <span>{errors.general}</span>
        </div>
      {/if}
      
      <div class="form-control mt-6">
        <button 
          type="submit" 
          class="btn btn-primary"
          class:loading={loading}
          disabled={loading || !canSubmit}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
      
      <div class="text-center text-sm">
        Already have an account? 
        <button 
          type="button"
          class="link link-primary"
          on:click={switchToLogin}
        >
          Sign in
        </button>
      </div>
    </form>
  </div>
</div>