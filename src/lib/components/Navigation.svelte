<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { user, showLogin, showSignup, theme, notifications, unreadCount, searchQuery, searchResults, searchLoading } from '../stores.js';
  import { signOut } from '../auth.js';
  import { requestNotificationPermission } from '../notifications.js';
  import { searchUsers } from '../search.js';
  
  // Lucide Icons
  import { 
    Bell, 
    User, 
    Search, 
    Settings, 
    Moon, 
    Sun, 
    LogOut
  } from 'lucide-svelte';
  
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
    if (event.target.closest('.dropdown') || 
        event.target.closest('a') || 
        event.target.closest('button') ||
        event.target.closest('[href]') ||
        event.target.closest('.menu-item') ||
        event.target.closest('.btn') ||
        event.target.closest('[role="button"]')) {
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

<nav class="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50">
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost text-xl font-bold text-primary">
      Likey
    </a>
  </div>
  
  <div class="navbar-center">
    <!-- Search bar for larger screens - hidden on home page since we have sidebar search -->
    <div class="form-control hidden md:block relative" class:lg:hidden={$page.url.pathname === '/'}>
      <input 
        type="text" 
        placeholder="Search users..." 
        class="input input-bordered w-64"
        bind:value={$searchQuery}
        oninput={handleSearch}
        onfocus={() => $searchQuery.length >= 2 && (showSearchResults = true)}
      />
      
      <!-- Search Results Dropdown -->
      {#if showSearchResults && ($searchLoading || $searchResults.length > 0)}
        <div class="absolute top-full left-0 right-0 z-50 mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg max-h-96 overflow-y-auto">
          {#if $searchLoading}
            <div class="p-4 text-center">
              <span class="loading loading-spinner loading-sm"></span>
            </div>
          {:else if $searchResults.length === 0}
            <div class="p-4 text-center text-base-content/60">
              No users found
            </div>
          {:else}
            {#each $searchResults as result (result.id)}
              <button 
                class="flex items-center gap-3 w-full p-3 hover:bg-base-200 transition-colors"
                onclick={() => selectSearchResult(result)}
              >
                <div class="avatar">
                  <div class="w-8 rounded-full">
                    {#if result.profile_pic_url}
                      <img src={result.profile_pic_url} alt={result.display_name} />
                    {:else}
                      <div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xs">
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
      <div class="dropdown dropdown-end">
        <button 
          class="btn btn-ghost btn-circle"
          class:btn-active={showNotifications}
          onclick={() => showNotifications = !showNotifications}
          title="Notifications"
        >
          <div class="indicator">
            <Bell size={20} />
            {#if $unreadCount > 0}
              <span class="badge badge-xs badge-primary indicator-item">{$unreadCount}</span>
            {/if}
          </div>
        </button>
        
        {#if showNotifications}
          <div class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-80">
            <div class="menu-title">
              <span>Notifications</span>
            </div>
            
            {#if $notifications.length === 0}
              <div class="p-4 text-center text-base-content/60">
                No notifications yet
              </div>
            {:else}
              {#each $notifications.slice(0, 5) as notification}
                <div class="p-2 hover:bg-base-200 rounded-lg" class:bg-base-200={!notification.read}>
                  <p class="text-sm">{notification.message}</p>
                  <p class="text-xs text-base-content/60 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
              {/each}
              
              <div class="divider"></div>
              <a href="/notifications" class="btn btn-sm btn-ghost" onclick={handleNavClick}>View All</a>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- User Menu -->
      <div class="dropdown dropdown-end">
        <button 
          class="btn btn-ghost btn-circle avatar"
          class:btn-active={showUserMenu}
          onclick={() => showUserMenu = !showUserMenu}
        >
          <div class="w-8 rounded-full">
            {#if $user.profile_pic_url}
              <img src={$user.profile_pic_url} alt="Profile" />
            {:else}
              <div class="bg-primary text-primary-content flex items-center justify-center w-full h-full">
                {$user.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            {/if}
          </div>
        </button>
        
        {#if showUserMenu}
          <div class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
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
      <button 
        class="btn btn-ghost"
        onclick={() => showLogin.set(true)}
      >
        Sign In
      </button>
      
      <button 
        class="btn btn-primary"
        onclick={() => showSignup.set(true)}
      >
        Sign Up
      </button>
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
</style>