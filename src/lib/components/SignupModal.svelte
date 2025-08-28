<script>
	import { signUp, signInWithGoogle, signInWithGithub } from '../auth.js';
	import { showSignup, showLogin } from '../stores.js';
	import { validateEmail, validateUsername } from '../utils.js';
	import LikeyLogo from '$lib/assets/Likey.png';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let errors = $state({});
	let touched = $state({});
	let confirmationMessage = $state('');
	let generalError = $state('');

	// Validation with $derived
	let validationErrors = $derived(() => {
		const newErrors = {};

		if (touched.email) {
			const emailValidation = validateEmail(email);
			if (!emailValidation.valid) {
				newErrors.email = emailValidation.error;
			}
		}

		if (touched.password && password && password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
		}

		if (touched.confirmPassword && confirmPassword && password !== confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		return newErrors;
	});

	// Update errors when validation changes
	$effect(() => {
		errors = validationErrors;
	});

	let canSubmit = $derived(
		email &&
			password &&
			confirmPassword &&
			Object.keys(errors).length === 0 &&
			password === confirmPassword
	);

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
		touched = { email: true, password: true, confirmPassword: true };

		if (!canSubmit) return;

		loading = true;

		const result = await signUp(email, password);

		if (result.success) {
			if (result.needsConfirmation) {
				// Show success confirmation message
				confirmationMessage =
					result.message ||
					'Please check your email and click the confirmation link to complete registration.';
				generalError = ''; // Clear any previous error

				// Auto-close modal after 3 seconds
				setTimeout(() => {
					showSignup.set(false);
					// Reset form
					email = '';
					password = '';
					confirmPassword = '';
					touched = {};
					confirmationMessage = '';
					generalError = '';
				}, 3000);
			} else {
				showSignup.set(false);
				// Reset form
				email = '';
				password = '';
				confirmPassword = '';
				touched = {};
			}
		} else {
			confirmationMessage = ''; // Clear any previous confirmation
			if (result.error.includes('email')) {
				errors.email = result.error;
			} else {
				generalError = result.error;
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
		errors = {};
		touched = {};
		confirmationMessage = '';
		generalError = '';
	}

	/**
	 * Handle Google OAuth signup
	 */
	async function handleGoogleSignup() {
		loading = true;
		const result = await signInWithGoogle();

		if (!result.success) {
			generalError = result.error;
			loading = false;
		}
		// If successful, OAuth redirect will happen automatically
	}

	/**
	 * Handle GitHub OAuth signup
	 */
	async function handleGithubSignup() {
		loading = true;
		const result = await signInWithGithub();

		if (!result.success) {
			generalError = result.error;
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

		<h3 class="likey-gradient-text mb-4 text-center text-lg font-bold">Create Account</h3>

		<!-- Social Auth Buttons -->
		<div class="mb-6 space-y-3">
			<button
				type="button"
				class="btn w-full btn-outline"
				onclick={handleGoogleSignup}
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
				onclick={handleGithubSignup}
				disabled={loading}
			>
				<svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
				Continue with GitHub
			</button>
		</div>

		<div class="divider">Or continue with email</div>

		<form onsubmit={handleSignup} class="space-y-4">
			<div class="space-y-2">
				<label for="signup-email" class="block text-sm font-medium">
					Email
				</label>
				<input
					id="signup-email"
					type="email"
					class="input-bordered input w-full"
					class:input-error={errors.email}
					bind:value={email}
					onblur={() => handleBlur('email')}
					required
					disabled={loading}
				/>
				{#if errors.email}
					<span class="text-xs text-error">{errors.email}</span>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="signup-password" class="block text-sm font-medium">
					Password
				</label>
				<input
					id="signup-password"
					type="password"
					class="input-bordered input w-full"
					class:input-error={errors.password}
					bind:value={password}
					onblur={() => handleBlur('password')}
					required
					disabled={loading}
				/>
				{#if errors.password}
					<span class="text-xs text-error">{errors.password}</span>
				{/if}
			</div>

			<div class="space-y-2">
				<label for="signup-confirm-password" class="block text-sm font-medium">
					Confirm Password
				</label>
				<input
					id="signup-confirm-password"
					type="password"
					class="input-bordered input w-full"
					class:input-error={errors.confirmPassword}
					bind:value={confirmPassword}
					onblur={() => handleBlur('confirmPassword')}
					required
					disabled={loading}
				/>
				{#if errors.confirmPassword}
					<span class="text-xs text-error">{errors.confirmPassword}</span>
				{/if}
			</div>

			{#if confirmationMessage}
				<div class="alert alert-success">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{confirmationMessage}</span>
				</div>
			{/if}

			{#if generalError}
				<div class="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6 shrink-0 stroke-current"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{generalError}</span>
				</div>
			{/if}

			<div class="form-control mt-6">
				<button
					type="submit"
					class="btn btn-primary"
					class:loading
					disabled={loading || !canSubmit || confirmationMessage}
				>
					{loading
						? 'Creating Account...'
						: confirmationMessage
							? 'Check Your Email'
							: 'Create Account'}
				</button>
			</div>

			<div class="text-center text-sm">
				Already have an account?
				<button type="button" class="link link-primary" onclick={switchToLogin}> Sign in </button>
			</div>
		</form>
	</div>
</div>
