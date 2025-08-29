<script>
	import { signIn, resetPassword, signInWithGoogle, signInWithGithub } from '../auth.js';
	import { showLogin, showSignup } from '../stores.js';
	import LikeyLogo from '$lib/assets/Likey.png';

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

	/**
	 * Handle Google OAuth login
	 */
	async function handleGoogleLogin() {
		loading = true;
		const result = await signInWithGoogle();

		if (!result.success) {
			error = result.error;
			loading = false;
		}
		// If successful, OAuth redirect will happen automatically
	}

	/**
	 * Handle GitHub OAuth login
	 */
	async function handleGithubLogin() {
		loading = true;
		const result = await signInWithGithub();

		if (!result.success) {
			error = result.error;
			loading = false;
		}
		// If successful, OAuth redirect will happen automatically
	}
</script>

<div class="modal-open modal">
	<div class="modal-box">
		<button class="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm" onclick={closeModal}>
			✕
		</button>

		<!-- Likey Logo -->
		<div class="mb-4 flex items-center justify-center">
			<img src={LikeyLogo} alt="Likey" class="likey-logo h-12 w-12 rounded-lg" />
		</div>

		<h3 class="likey-gradient-text mb-4 text-center text-lg font-bold">
			{showResetPassword ? 'Reset Password' : 'Sign In'}
		</h3>

		{#if !showResetPassword}
			<!-- Social Auth Buttons - TEMPORARILY HIDDEN -->
			<!-- <div class="mb-6 space-y-3">
				<button
					type="button"
					class="btn w-full btn-outline"
					onclick={handleGoogleLogin}
					disabled={loading}
				>
					<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
						<path
							fill="currentColor"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="currentColor"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="currentColor"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="currentColor"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Continue with Google
				</button>

				<button
					type="button"
					class="btn w-full btn-outline"
					onclick={handleGithubLogin}
					disabled={loading}
				>
					<svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
						/>
					</svg>
					Continue with GitHub
				</button>
			</div>

			<div class="divider">Or continue with email</div> -->

			<form onsubmit={handleLogin} class="space-y-4">
				<div class="space-y-2">
					<label for="email" class="block text-sm font-medium">
						Email
					</label>
					<input
						id="email"
						type="email"
						class="input-bordered input w-full"
						bind:value={email}
						required
						disabled={loading}
					/>
				</div>

				<div class="space-y-2">
					<label for="password" class="block text-sm font-medium">
						Password
					</label>
					<input
						id="password"
						type="password"
						class="input-bordered input w-full"
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
					<button type="submit" class="btn btn-primary" class:loading disabled={loading}>
						{loading ? 'Signing In...' : 'Sign In'}
					</button>
				</div>

				<div class="space-y-2 text-center">
					<button
						type="button"
						class="link text-sm link-primary"
						onclick={() => (showResetPassword = true)}
					>
						Forgot your password?
					</button>

					<div class="text-sm">
						Don't have an account?
						<button type="button" class="link link-primary" onclick={switchToSignup}>
							Sign up
						</button>
					</div>
				</div>
			</form>
		{:else}
			<form onsubmit={handleResetPassword} class="space-y-4">
				<div class="space-y-2">
					<label for="reset-email" class="block text-sm font-medium">
						Email
					</label>
					<input
						id="reset-email"
						type="email"
						class="input-bordered input w-full"
						bind:value={resetEmail}
						required
						disabled={resetLoading}
						placeholder="Enter your email address"
					/>
				</div>

				{#if resetMessage}
					<div
						class="alert"
						class:alert-success={resetMessage.includes('sent')}
						class:alert-error={!resetMessage.includes('sent')}
					>
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
						class="link text-sm link-primary"
						onclick={() => (showResetPassword = false)}
					>
						Back to Sign In
					</button>
				</div>
			</form>
		{/if}
	</div>
</div>
