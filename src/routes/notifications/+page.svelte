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
			goto(`/profile/${notification.related_user.username}`);
		} else if ((notification.type === 'like' || notification.type === 'comment') && notification.related_post_id) {
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
	<div class="max-w-2xl mx-auto">
		<div class="flex items-center justify-between mb-6">
			<h1 class="text-3xl font-bold">Notifications</h1>
			
			{#if $notifications.some(n => !n.read)}
				<button 
					class="btn btn-outline btn-sm"
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
						class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer w-full text-left"
						class:border-l-4={!notification.read}
						class:border-l-primary={!notification.read}
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
												<div class="w-6 rounded-full">
													{#if notification.related_user.profile_pic_url}
														<img src={notification.related_user.profile_pic_url} alt={notification.related_user.display_name} />
													{:else}
														<div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
															{notification.related_user.display_name?.charAt(0).toUpperCase() || 'U'}
														</div>
													{/if}
												</div>
											</div>
										{/if}
										
										{#if !notification.read}
											<div class="w-2 h-2 rounded-full bg-primary"></div>
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