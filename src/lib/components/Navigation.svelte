<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import {
		user,
		showLogin,
		showSignup,
		theme,
		notifications,
		unreadCount,
		searchQuery,
		searchResults,
		searchLoading
	} from '../stores.js';
	import { signOut } from '../auth.js';
	import { requestNotificationPermission, markNotificationAsRead } from '../notifications.js';
	import { searchUsers } from '../search.js';
	import LikeyLogo from '$lib/assets/Likey.png';

	// Lucide Icons
	import { Bell, User, Search, Settings, Moon, Sun, LogOut } from 'lucide-svelte';

	let showUserMenu = $state(false);
	let showNotifications = $state(false);
	let showSearchResults = $state(false);
	let searchTimeout;

	/**
	 * Handle sign out
	 */
	async function handleSignOut() {
		await signOut();
		showUserMenu = false;
	}

	/**
	 * Handle navigation clicks and close menus
	 */
	function handleNavClick(event) {
		console.log('Navigation click detected:', event.target);

		// Use setTimeout to ensure the click event completes before closing menus
		setTimeout(() => {
			showUserMenu = false;
			showNotifications = false;
			showSearchResults = false;
		}, 10);
	}

	/**
	 * Toggle theme
	 */
	function toggleTheme() {
		const newTheme = $theme === 'light' ? 'dark' : 'light';
		theme.set(newTheme);
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	}

	/**
	 * Close menus when clicking outside
	 */
	function handleClickOutside(event) {
		// Don't interfere with navigation links, buttons, or interactive elements
		if (
			event.target.closest('.dropdown') ||
			event.target.closest('a') ||
			event.target.closest('button') ||
			event.target.closest('[href]') ||
			event.target.closest('.menu-item') ||
			event.target.closest('.btn') ||
			event.target.closest('[role="button"]')
		) {
			return;
		}

		showUserMenu = false;
		showNotifications = false;
		showSearchResults = false;
	}

	/**
	 * Handle search input
	 */
	async function handleSearch() {
		const query = $searchQuery.trim();

		if (query.length < 2) {
			searchResults.set([]);
			showSearchResults = false;
			return;
		}

		searchLoading.set(true);
		showSearchResults = true;

		// Debounce search
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(async () => {
			const { data, error } = await searchUsers(query, 10);

			if (!error && data) {
				searchResults.set(data);
			}

			searchLoading.set(false);
		}, 300);
	}

	/**
	 * Navigate to search result
	 * @param {Object} user
	 */
	function selectSearchResult(user) {
		goto(`/profile/${user.username}`);
		searchQuery.set('');
		searchResults.set([]);
		showSearchResults = false;
	}

	/**
	 * Handle notification click
	 * @param {Object} notification
	 */
	async function handleNotificationClick(notification) {
		// Mark as read
		if (!notification.read) {
			await markNotificationAsRead(notification.id);
		}

		// Close the notifications dropdown
		showNotifications = false;

		// Navigate based on notification type
		if (notification.type === 'follow' && notification.related_user) {
			// For follows, go to the user's profile
			goto(`/profile/${notification.related_user.username}`);
		} else if (
			(notification.type === 'like' || notification.type === 'comment') &&
			notification.related_post_id
		) {
			// For likes and comments, go to the specific post
			goto(`/post/${notification.related_post_id}`);
		}
	}

	onMount(() => {
		// Load saved theme
		const savedTheme = localStorage.getItem('theme') || 'light';
		theme.set(savedTheme);
		document.documentElement.setAttribute('data-theme', savedTheme);

		// Request notification permission for logged in users
		if ($user) {
			requestNotificationPermission();
		}

		// Add click outside listener with passive option to avoid interference
		document.addEventListener('click', handleClickOutside, { passive: true });

		return () => {
			document.removeEventListener('click', handleClickOutside);
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
	});
</script>

<nav class="fixed top-0 left-0 right-0 w-full z-50 navbar overflow-visible border-b border-base-300 bg-base-100">
	<div class="navbar-start">
		<a href="/" class="btn flex items-center gap-2 text-xl font-bold btn-ghost">
			<img src={LikeyLogo} alt="Likey" class="likey-logo h-8 w-8 rounded-lg" />
			<span class="likey-gradient-text">Likey</span>
		</a>
	</div>

	<div class="navbar-center">
		<!-- Search bar for larger screens - hidden on home page since we have sidebar search -->
		<div class="form-control relative hidden md:block" class:lg:hidden={$page.url.pathname === '/'}>
			<input
				type="text"
				placeholder="Search users..."
				class="input-bordered input w-64"
				bind:value={$searchQuery}
				oninput={handleSearch}
				onfocus={() => $searchQuery.length >= 2 && (showSearchResults = true)}
			/>

			<!-- Search Results Dropdown -->
			{#if showSearchResults && ($searchLoading || $searchResults.length > 0)}
				<div
					class="absolute top-full right-0 left-0 z-50 mt-1 max-h-96 overflow-y-auto rounded-box border border-base-300 bg-base-100 shadow-lg"
				>
					{#if $searchLoading}
						<div class="p-4 text-center">
							<span class="loading loading-sm loading-spinner"></span>
						</div>
					{:else if $searchResults.length === 0}
						<div class="p-4 text-center text-base-content/60">No users found</div>
					{:else}
						{#each $searchResults as result (result.id)}
							<button
								class="flex w-full items-center gap-3 p-3 transition-colors hover:bg-base-200"
								onclick={() => selectSearchResult(result)}
							>
								<div class="avatar">
									<div class="w-8 rounded-full">
										{#if result.profile_pic_url}
											<img src={result.profile_pic_url} alt={result.display_name} />
										{:else}
											<div
												class="flex h-full w-full items-center justify-center bg-primary text-xs text-primary-content"
											>
												{result.display_name?.charAt(0).toUpperCase() || 'U'}
											</div>
										{/if}
									</div>
								</div>

								<div class="flex-1 text-left">
									<div class="font-semibold">{result.display_name}</div>
									<div class="text-sm text-base-content/60">@{result.username}</div>
								</div>

								{#if result.is_following}
									<div class="badge badge-ghost badge-sm">Following</div>
								{/if}
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<div class="navbar-end space-x-2">
		{#if $user}
			<!-- Notifications -->
			<div class="relative">
				<button
					class="btn btn-circle btn-ghost"
					class:btn-active={showNotifications}
					onclick={() => (showNotifications = !showNotifications)}
					title="Notifications"
				>
					<div class="indicator">
						<Bell size={20} />
						{#if $unreadCount > 0}
							<span class="indicator-item badge badge-xs badge-primary">{$unreadCount}</span>
						{/if}
					</div>
				</button>

				{#if showNotifications}
					<div class="modern-dropdown absolute top-full right-0 z-[100] mt-2 w-80 sm:w-96 md:w-80">
						<div class="modern-dropdown-header">
							<h3 class="text-lg font-semibold">Notifications</h3>
							{#if $unreadCount > 0}
								<span class="modern-badge">{$unreadCount}</span>
							{/if}
						</div>

						{#if $notifications.length === 0}
							<div class="modern-empty-state">
								<Bell size={32} class="opacity-40" />
								<p class="mt-2 text-base-content/60">No notifications yet</p>
							</div>
						{:else}
							<div class="modern-dropdown-content">
								{#each $notifications.slice(0, 5) as notification}
									<button
										class="modern-notification-item"
										class:unread={!notification.read}
										onclick={() => handleNotificationClick(notification)}
									>
										<div class="flex items-start gap-3">
											{#if !notification.read}
												<div class="modern-unread-indicator"></div>
											{/if}
											<div class="min-w-0 flex-1">
												<p class="text-sm font-medium">{notification.message}</p>
												<p class="mt-1 text-xs text-base-content/60">
													{new Date(notification.created_at).toLocaleDateString()}
												</p>
											</div>
										</div>
									</button>
								{/each}
							</div>

							<div class="modern-dropdown-footer">
								<a href="/notifications" class="modern-view-all-btn" onclick={handleNavClick}>
									View All Notifications
								</a>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- User Menu -->
			<div class="relative">
				<button
					class="btn avatar btn-circle btn-ghost"
					class:btn-active={showUserMenu}
					onclick={() => (showUserMenu = !showUserMenu)}
				>
					<div class="w-8 rounded-full">
						{#if $user.profile_pic_url}
							<img src={$user.profile_pic_url} alt="Profile" />
						{:else}
							<div
								class="flex h-full w-full items-center justify-center bg-primary text-primary-content"
							>
								{$user.display_name?.charAt(0).toUpperCase() || 'U'}
							</div>
						{/if}
					</div>
				</button>

				{#if showUserMenu}
					<div
						class="menu absolute top-full right-0 z-[100] mt-2 w-52 rounded-box border border-base-300 bg-base-100 p-2 shadow-lg sm:w-52"
					>
						<div class="menu-title">
							<span>{$user.display_name}</span>
							<span class="text-xs text-base-content/60">@{$user.username}</span>
						</div>

						<div class="divider"></div>

						<a href="/profile/{$user.username}" class="menu-item" onclick={handleNavClick}>
							<User size={16} />
							Profile
						</a>

						<a href="/settings" class="menu-item" onclick={handleNavClick}>
							<Settings size={16} />
							Settings
						</a>

						<button class="menu-item" onclick={toggleTheme}>
							{#if $theme === 'light'}
								<Moon size={16} />
								Dark Mode
							{:else}
								<Sun size={16} />
								Light Mode
							{/if}
						</button>

						<div class="divider"></div>

						<button class="menu-item text-error" onclick={handleSignOut}>
							<LogOut size={16} />
							Sign Out
						</button>
					</div>
				{/if}
			</div>
		{:else}
			<!-- Not authenticated -->
			<button class="btn btn-ghost" onclick={() => showLogin.set(true)}> Sign In </button>

			<button class="btn btn-primary" onclick={() => showSignup.set(true)}> Sign Up </button>
		{/if}
	</div>
</nav>

<style>
	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
	}

	.menu-item:hover {
		background-color: var(--fallback-b2, oklch(var(--b2) / var(--tw-bg-opacity)));
	}

	.menu-title {
		padding: 0.5rem;
		font-weight: 500;
	}

	/* Modern Dropdown Styles */
	.modern-dropdown {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 16px;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.1),
			0 0 0 1px rgba(255, 255, 255, 0.1);
		overflow: hidden;
		max-height: 480px;
		min-width: 280px;
		display: flex;
		flex-direction: column;
	}

	:global([data-theme='dark']) .modern-dropdown {
		background: rgba(18, 18, 20, 0.95) !important;
		border: 1px solid rgba(255, 255, 255, 0.15) !important;
		box-shadow:
			0 20px 40px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.1) !important;
		backdrop-filter: blur(20px);
	}

	:global([data-theme='dark']) .modern-dropdown-header {
		background: rgba(24, 24, 27, 0.8) !important;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: rgba(255, 255, 255, 0.9) !important;
	}

	:global([data-theme='dark']) .modern-dropdown-footer {
		background: rgba(24, 24, 27, 0.8) !important;
		border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
	}

	:global([data-theme='dark']) .modern-view-all-btn {
		color: hsl(346 77% 65%) !important;
	}

	:global([data-theme='dark']) .modern-view-all-btn:hover {
		background: hsl(346 77% 65% / 0.15) !important;
	}

	:global([data-theme='dark']) .modern-notification-item {
		color: rgba(255, 255, 255, 0.9) !important;
	}

	:global([data-theme='dark']) .modern-notification-item:hover {
		background: rgba(255, 255, 255, 0.05) !important;
	}

	:global([data-theme='dark']) .modern-empty-state {
		color: rgba(255, 255, 255, 0.7) !important;
	}

	.modern-dropdown-header {
		padding: 16px 20px;
		border-bottom: 1px solid hsl(var(--base-300) / 0.5);
		background: linear-gradient(135deg, hsl(var(--base-100)) 0%, hsl(var(--base-200) / 0.5) 100%);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.modern-badge {
		background: linear-gradient(135deg, hsl(346 77% 49%) 0%, hsl(340 80% 60%) 100%);
		color: white;
		font-size: 0.7rem;
		font-weight: 700;
		min-width: 20px;
		height: 20px;
		border-radius: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px hsl(346 77% 49% / 0.3);
	}

	.modern-empty-state {
		padding: 32px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.modern-dropdown-content {
		padding: 8px;
		flex: 1;
		overflow-y: auto;
		min-height: 0;
	}

	.modern-notification-item {
		width: 100%;
		padding: 12px 16px;
		border-radius: 12px;
		text-align: left;
		transition: all 0.2s ease;
		border: none;
		background: transparent;
		cursor: pointer;
		margin-bottom: 4px;
	}

	.modern-notification-item:hover {
		background: hsl(var(--base-200) / 0.7);
		transform: translateX(2px);
	}

	.modern-notification-item.unread {
		background: linear-gradient(
			135deg,
			hsl(var(--primary) / 0.05) 0%,
			hsl(340 70% 65% / 0.05) 100%
		);
		border-left: 3px solid hsl(346 77% 49%);
	}

	.modern-unread-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: linear-gradient(135deg, hsl(346 77% 49%) 0%, hsl(340 80% 60%) 100%);
		margin-top: 4px;
		flex-shrink: 0;
		box-shadow: 0 0 8px hsl(346 77% 49% / 0.4);
	}

	.modern-dropdown-footer {
		padding: 12px 20px;
		border-top: 1px solid hsl(var(--base-300) / 0.5);
		background: hsl(var(--base-100) / 0.5);
		flex-shrink: 0;
		margin-top: auto;
	}

	.modern-view-all-btn {
		display: block;
		width: 100%;
		padding: 8px 16px;
		text-align: center;
		color: hsl(346 77% 49%);
		font-weight: 600;
		border-radius: 8px;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.modern-view-all-btn:hover {
		background: hsl(346 77% 49% / 0.1);
		transform: translateY(-1px);
	}

	/* Scrollbar styling for dropdown content */
	.modern-dropdown-content::-webkit-scrollbar {
		width: 4px;
	}

	.modern-dropdown-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.modern-dropdown-content::-webkit-scrollbar-thumb {
		background: hsl(var(--base-300));
		border-radius: 2px;
	}

	.modern-dropdown-content::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--base-400));
	}

	/* Ensure navbar is properly positioned and visible */
	nav {
		position: fixed !important;
		top: 0 !important;
		left: 0 !important;
		right: 0 !important;
		width: 100% !important;
		max-width: 100% !important;
		box-sizing: border-box !important;
	}
</style>
