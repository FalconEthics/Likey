<script>
  import { signIn, resetPassword } from '../auth.js';
  import { showLogin, showSignup } from '../stores.js';
  
  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let showResetPassword = false;
  let resetEmail = '';
  let resetLoading = false;
  let resetMessage = '';
  
  /**
   * Handle login form submission
   * @param {Event} event
   */
  async function handleLogin(event) {
    event.preventDefault();
    loading = true;
    error = '';
    
    const result = await signIn(email, password);
    
    if (result.success) {
      showLogin.set(false);
      email = '';
      password = '';
    } else {
      error = result.error;
    }
    
    loading = false;
  }
  
  /**
   * Handle password reset
   * @param {Event} event
   */
  async function handleResetPassword(event) {
    event.preventDefault();
    resetLoading = true;
    resetMessage = '';
    
    const result = await resetPassword(resetEmail);
    
    if (result.success) {
      resetMessage = 'Password reset email sent! Check your inbox.';
      resetEmail = '';
    } else {
      resetMessage = result.error;
    }
    
    resetLoading = false;
  }
  
  function switchToSignup() {
    showLogin.set(false);
    showSignup.set(true);
  }
  
  function closeModal() {
    showLogin.set(false);
    showResetPassword = false;
    email = '';
    password = '';
    resetEmail = '';
    error = '';
    resetMessage = '';
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
    
    <h3 class="font-bold text-lg mb-4">
      {showResetPassword ? 'Reset Password' : 'Sign In'}
    </h3>
    
    {#if !showResetPassword}
      <form on:submit={handleLogin} class="space-y-4">
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input 
            id="email"
            type="email" 
            class="input input-bordered" 
            bind:value={email}
            required
            disabled={loading}
          />
        </div>
        
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input 
            id="password"
            type="password" 
            class="input input-bordered" 
            bind:value={password}
            required
            disabled={loading}
          />
        </div>
        
        {#if error}
          <div class="alert alert-error">
            <span>{error}</span>
          </div>
        {/if}
        
        <div class="form-control mt-6">
          <button 
            type="submit" 
            class="btn btn-primary"
            class:loading={loading}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
        
        <div class="text-center space-y-2">
          <button 
            type="button"
            class="link link-primary text-sm"
            on:click={() => showResetPassword = true}
          >
            Forgot your password?
          </button>
          
          <div class="text-sm">
            Don't have an account? 
            <button 
              type="button"
              class="link link-primary"
              on:click={switchToSignup}
            >
              Sign up
            </button>
          </div>
        </div>
      </form>
    {:else}
      <form on:submit={handleResetPassword} class="space-y-4">
        <div class="form-control">
          <label class="label" for="reset-email">
            <span class="label-text">Email</span>
          </label>
          <input 
            id="reset-email"
            type="email" 
            class="input input-bordered" 
            bind:value={resetEmail}
            required
            disabled={resetLoading}
            placeholder="Enter your email address"
          />
        </div>
        
        {#if resetMessage}
          <div class="alert" class:alert-success={resetMessage.includes('sent')} class:alert-error={!resetMessage.includes('sent')}>
            <span>{resetMessage}</span>
          </div>
        {/if}
        
        <div class="form-control mt-6">
          <button 
            type="submit" 
            class="btn btn-primary"
            class:loading={resetLoading}
            disabled={resetLoading}
          >
            {resetLoading ? 'Sending...' : 'Send Reset Email'}
          </button>
        </div>
        
        <div class="text-center">
          <button 
            type="button"
            class="link link-primary text-sm"
            on:click={() => showResetPassword = false}
          >
            Back to Sign In
          </button>
        </div>
      </form>
    {/if}
  </div>
</div>