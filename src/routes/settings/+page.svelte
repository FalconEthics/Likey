<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores.js';
	import { updateProfile, signOut } from '$lib/auth.js';
	import { supabase, uploadImage, compressImage, getImageUrl } from '$lib/supabase.js';
	import { generateImagePath, validateUsername } from '$lib/utils.js';

	let displayName = '';
	let bio = '';
	let profilePicUrl = '';
	let newProfilePic = null;
	let loading = false;
	let error = '';
	let success = '';

	$: if (!$user) {
		goto('/');
	}

	/**
	 * Initialize form with current user data
	 */
	function initializeForm() {
		if ($user) {
			displayName = $user.display_name || '';
			bio = $user.bio || '';
			profilePicUrl = $user.profile_pic_url || '';
		}
	}

	/**
	 * Handle profile picture selection
	 * @param {Event} event
	 */
	function handleProfilePicSelect(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		if (!file.type.startsWith('image/')) {
			error = 'Please select an image file';
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			error = 'Image must be smaller than 5MB';
			return;
		}

		newProfilePic = file;

		// Show preview
		const reader = new FileReader();
		reader.onload = (e) => {
			profilePicUrl = e.target.result;
		};
		reader.readAsDataURL(file);
	}

	/**
	 * Save profile changes
	 * @param {Event} event
	 */
	async function saveProfile(event) {
		event.preventDefault();

		if (!$user) return;

		loading = true;
		error = '';
		success = '';

		try {
			let updates = {
				display_name: displayName.trim(),
				bio: bio.trim()
			};

			// Upload new profile picture if selected
			if (newProfilePic) {
				const compressedFile = await compressImage(newProfilePic, 400, 0.9);
				const imagePath = generateImagePath($user.id, 'profile.jpg');

				const { data, error: uploadError } = await uploadImage(compressedFile, 'images', imagePath);

				if (uploadError) throw uploadError;

				updates.profile_pic_url = getImageUrl('images', imagePath);
			}

			const result = await updateProfile(updates);

			if (result.success) {
				success = 'Profile updated successfully!';
				newProfilePic = null;
			} else {
				error = result.error;
			}
		} catch (err) {
			console.error('Error updating profile:', err);
			error = 'Failed to update profile. Please try again.';
		} finally {
			loading = false;
		}
	}

	/**
	 * Handle account deletion
	 */
	async function deleteAccount() {
		if (!$user) return;

		const confirmation = confirm(
			'Are you sure you want to delete your account? This action cannot be undone.'
		);

		if (!confirmation) return;

		try {
			// Delete user profile and related data (handled by database cascading)
			const { error } = await supabase.from('profiles').delete().eq('id', $user.id);

			if (error) throw error;

			// Sign out
			await signOut();
			goto('/');
		} catch (err) {
			console.error('Error deleting account:', err);
			error = 'Failed to delete account. Please try again.';
		}
	}

	onMount(() => {
		initializeForm();
	});
</script>

<svelte:head>
	<title>Settings - Likey</title>
</svelte:head>

{#if $user}
	<div class="mx-auto max-w-2xl px-4 pb-28 lg:pb-6">
		<h1 class="mb-6 text-3xl font-bold">Settings</h1>

		<div class="card bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title">Profile Settings</h2>

				{#if error}
					<div class="mb-4 alert alert-error">
						<span>{error}</span>
					</div>
				{/if}

				{#if success}
					<div class="mb-4 alert alert-success">
						<span>{success}</span>
					</div>
				{/if}

				<form onsubmit={saveProfile} class="space-y-6">
					<!-- Profile Picture -->
					<div class="space-y-2">
						<label for="profile-pic-input" class="block text-sm font-medium">
							Profile Picture
						</label>
						<div class="flex items-center gap-4">
							<div class="avatar">
								<div class="w-20 rounded-full">
									{#if profilePicUrl}
										<img src={profilePicUrl} alt="Profile" />
									{:else}
										<div
											class="flex h-full w-full items-center justify-center bg-primary text-primary-content"
										>
											{displayName?.charAt(0).toUpperCase() || 'U'}
										</div>
									{/if}
								</div>
							</div>
							<input
								id="profile-pic-input"
								type="file"
								accept="image/*"
								class="file-input-bordered file-input"
								onchange={handleProfilePicSelect}
								disabled={loading}
							/>
						</div>
					</div>

					<!-- Display Name -->
					<div class="space-y-2">
						<label for="display-name" class="block text-sm font-medium">
							Display Name
						</label>
						<input
							id="display-name"
							type="text"
							class="input-bordered input w-full"
							bind:value={displayName}
							required
							disabled={loading}
							maxlength="50"
						/>
					</div>

					<!-- Username (read-only) -->
					<div class="space-y-2">
						<label for="username" class="block text-sm font-medium">
							Username
						</label>
						<input
							id="username"
							type="text"
							class="input-bordered input-disabled input w-full"
							value={$user.username}
							disabled
						/>
						<span class="text-xs text-warning">Username cannot be changed</span>
					</div>

					<!-- Bio -->
					<div class="space-y-2">
						<label for="bio" class="block text-sm font-medium">
							Bio
						</label>
						<textarea
							id="bio"
							class="textarea-bordered textarea h-24 w-full"
							placeholder="Tell us about yourself..."
							bind:value={bio}
							disabled={loading}
							maxlength="160"
						></textarea>
						<div class="flex justify-end">
							<span class="text-xs text-base-content/60">{bio.length}/160 characters</span>
						</div>
					</div>

					<!-- Save Button -->
					<div class="form-control">
						<button type="submit" class="btn btn-primary" class:loading disabled={loading}>
							{loading ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</form>
			</div>
		</div>

		<!-- Account Actions -->
		<div class="card mt-6 bg-base-100 shadow-lg">
			<div class="card-body">
				<h2 class="mb-4 card-title text-error">Danger Zone</h2>

				<div class="space-y-4">
					<div class="alert alert-warning">
						<svg class="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							></path>
						</svg>
						<span
							>This action cannot be undone. This will permanently delete your account and all
							associated data.</span
						>
					</div>

					<button class="btn btn-error" onclick={deleteAccount}> Delete Account </button>
				</div>
			</div>
		</div>
	</div>
{/if}
