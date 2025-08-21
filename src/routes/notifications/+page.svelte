<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user, notifications } from '$lib/stores.js';
	import { markNotificationAsRead, markAllNotificationsAsRead } from '$lib/notifications.js';
	import { formatRelativeTime } from '$lib/utils.js';
	
	$: if (!$user) {
		goto('/');
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
		
		// Navigate based on notification type
		if (notification.type === 'follow' && notification.related_user) {
			// For follows, go to the user's profile
			goto(`/profile/${notification.related_user.username}`);
		} else if ((notification.type === 'like' || notification.type === 'comment') && notification.related_post_id) {
			// For likes and comments, go to the specific post
			goto(`/post/${notification.related_post_id}`);
		}
	}
	
	/**
	 * Get notification icon based on type
	 * @param {string} type
	 * @returns {string}
	 */
	function getNotificationIcon(type) {
		switch (type) {
			case 'like':
				return '❤️';
			case 'comment':
				return '💬';
			case 'follow':
				return '👤';
			default:
				return '📱';
		}
	}
</script>

<svelte:head>
	<title>Notifications - Likey</title>
</svelte:head>

{#if $user}
	<div class="max-w-2xl mx-auto pb-28 lg:pb-6">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold bg-gradient-to-r from-[hsl(346_77%_49%)] to-[hsl(340_70%_65%)] bg-clip-text text-transparent">Notifications</h1>
			
			{#if $notifications.some(n => !n.read)}
				<button 
					class="btn btn-outline btn-sm border-[hsl(346_77%_49%)] text-[hsl(346_77%_49%)] hover:bg-[hsl(346_77%_49%)] hover:text-white"
					onclick={markAllNotificationsAsRead}
				>
					Mark all as read
				</button>
			{/if}
		</div>
		
		{#if $notifications.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔔</div>
				<h3 class="text-xl font-semibold mb-2">No notifications yet</h3>
				<p class="text-base-content/60">
					When someone likes your posts, follows you, or comments, you'll see it here.
				</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each $notifications as notification (notification.id)}
					<button 
						class="card bg-base-100 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer w-full text-left border border-base-300/50"
						class:unread={!notification.read}
						onclick={() => handleNotificationClick(notification)}
					>
						<div class="card-body p-4">
							<div class="flex items-start gap-3">
								<!-- Notification Icon -->
								<div class="text-2xl">
									{getNotificationIcon(notification.type)}
								</div>
								
								<!-- Notification Content -->
								<div class="flex-1">
									<div class="flex items-center gap-2 mb-1">
										{#if notification.related_user}
											<div class="avatar">
												<div class="w-8 h-8 rounded-full">
													{#if notification.related_user.profile_pic_url}
														<img src={notification.related_user.profile_pic_url} alt={notification.related_user.display_name} class="rounded-full w-full h-full object-cover" />
													{:else}
														<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs rounded-full">
															{notification.related_user.display_name?.charAt(0).toUpperCase() || 'U'}
														</div>
													{/if}
												</div>
											</div>
										{/if}
										
										{#if !notification.read}
											<div class="w-2 h-2 rounded-full unread-dot shadow-sm"></div>
										{/if}
									</div>
									
									<p class="text-sm font-medium">{notification.message}</p>
									
									<time class="text-xs text-base-content/60">
										{formatRelativeTime(notification.created_at)}
									</time>
								</div>
								
								<!-- Action Button -->
								<div class="flex-shrink-0">
									{#if notification.type === 'follow'}
										<svg class="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
										</svg>
									{:else if notification.type === 'like' || notification.type === 'comment'}
										<svg class="w-5 h-5 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
										</svg>
									{/if}
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	/* Unread notification styling */
	.unread {
		border-left: 4px solid hsl(346 77% 49%);
		background: linear-gradient(to right, hsl(346 77% 49% / 0.03), transparent);
	}
	
	/* Unread dot styling */
	.unread-dot {
		background: hsl(346 77% 49%);
	}
	
	/* Dark theme support */
	[data-theme="dark"] .unread {
		background: linear-gradient(to right, hsl(346 77% 55% / 0.05), transparent);
		border-left-color: hsl(346 77% 55%);
	}
	
	[data-theme="dark"] .unread-dot {
		background: hsl(346 77% 55%);
	}
</style>