<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import LikeyLogo from '$lib/assets/Likey.png';

	let errorTitle = $state('Authentication Error');
	let errorMessage = $state('An error occurred during authentication.');
	let errorCode = $state('');
	let showDetails = $state(false);

	// Error message mappings for better user experience
	const errorMappings = {
		server_error: {
			title: 'Server Error',
			message: 'A server error occurred. Please try again later.'
		},
		access_denied: {
			title: 'Access Denied',
			message: 'You denied access to the application. Please try again if this was unintentional.'
		},
		unauthorized_client: {
			title: 'Unauthorized Client',
			message: 'The application is not authorized to perform this request.'
		},
		invalid_request: {
			title: 'Invalid Request',
			message: 'The authentication request was invalid.'
		},
		unsupported_response_type: {
			title: 'Unsupported Response Type',
			message: 'The authorization server does not support this response type.'
		}
	};

	// Specific error description mappings
	const descriptionMappings = {
		'Multiple accounts with the same email address in the same linking domain detected: default': {
			title: 'Account Already Exists',
			message:
				'An account with this email address already exists. Please sign in with your existing account instead of creating a new one.',
			suggestion:
				'Try signing in with your email and password, or use the same authentication method you used before.'
		}
	};

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const hashParams = new URLSearchParams(window.location.hash.substring(1));

		// Check both URL params and hash params (OAuth can return errors in either)
		const error = urlParams.get('error') || hashParams.get('error') || 'unknown_error';
		const error_description =
			urlParams.get('error_description') || hashParams.get('error_description') || '';
		const error_code = urlParams.get('error_code') || hashParams.get('error_code') || '';

		console.log('Error params:', { error, error_description, error_code });

		// Decode URL-encoded descriptions
		const decodedDescription = decodeURIComponent(error_description);

		// Check for specific error description mappings first
		if (decodedDescription && descriptionMappings[decodedDescription]) {
			const mapping = descriptionMappings[decodedDescription];
			errorTitle = mapping.title;
			errorMessage = mapping.message;
			if (mapping.suggestion) {
				errorMessage += '\n\n' + mapping.suggestion;
			}
		}
		// Then check for general error code mappings
		else if (errorMappings[error]) {
			const mapping = errorMappings[error];
			errorTitle = mapping.title;
			errorMessage = mapping.message;

			// If we have a specific description, append it
			if (decodedDescription) {
				errorMessage += '\n\nDetails: ' + decodedDescription;
			}
		}
		// Fallback for unknown errors
		else {
			errorTitle = 'Authentication Error';
			errorMessage = decodedDescription || 'An unknown error occurred during authentication.';
		}

		errorCode = error_code || error;
	});

	function goHome() {
		goto('/');
	}

	function tryAgain() {
		// Clear the error params and go back to home
		goto('/');
	}

	function toggleDetails() {
		showDetails = !showDetails;
	}
</script>

<svelte:head>
	<title>Error - Likey</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-100 p-4">
	<div class="w-full max-w-md">
		<div class="card bg-base-200 shadow-xl">
			<div class="card-body text-center">
				<!-- Likey Logo -->
				<div class="mx-auto mb-4">
					<img src={LikeyLogo} alt="Likey" class="mx-auto h-16 w-16 rounded-lg opacity-70" />
				</div>

				<!-- Error Icon -->
				<div
					class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-8 w-8 text-error"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>

				<!-- Error Title -->
				<h1 class="mb-2 text-2xl font-bold text-base-content">
					{errorTitle}
				</h1>

				<!-- Error Message -->
				<div class="mb-6 whitespace-pre-line text-base-content/70">
					{errorMessage}
				</div>

				<!-- Action Buttons -->
				<div class="flex flex-col gap-3">
					<button class="btn btn-primary" onclick={tryAgain}> Try Again </button>
					<button class="btn btn-ghost" onclick={goHome}> Go to Home </button>
				</div>

				<!-- Technical Details (collapsible) -->
				{#if errorCode}
					<div class="mt-6">
						<button class="btn text-xs btn-ghost btn-sm" onclick={toggleDetails}>
							{showDetails ? 'Hide' : 'Show'} Technical Details
						</button>

						{#if showDetails}
							<div class="mt-3 rounded-lg bg-base-300 p-3 text-left">
								<div class="font-mono text-xs text-base-content/60">
									<div><strong>Error Code:</strong> {errorCode}</div>
									{#if $page.url.search}
										<div class="mt-2"><strong>URL Parameters:</strong></div>
										<div class="break-all">{$page.url.search}</div>
									{/if}
									{#if $page.url.hash}
										<div class="mt-2"><strong>Hash Parameters:</strong></div>
										<div class="break-all">{$page.url.hash}</div>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>

		<!-- Help Text -->
		<div class="mt-6 text-center text-sm text-base-content/50">
			If you continue to experience issues, please contact support.
		</div>
	</div>
</div>
