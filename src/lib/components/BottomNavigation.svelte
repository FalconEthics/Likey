<script>
  import { page } from '$app/stores';
  import { unreadMessageCount } from '../stores.js';
  
  // Lucide Icons
  import { Home, Search, MessageCircle } from 'lucide-svelte';
  
  // Get current path for active state
  $: currentPath = $page.url.pathname;
</script>

<!-- Bottom Navigation - Mobile/Tablet -->
<nav class="btm-nav lg:hidden bg-base-100 border-t border-base-300 fixed bottom-0 left-0 right-0 z-50 md:justify-center">
  <a 
    href="/explore" 
    class="btm-nav-link"
    class:active={currentPath === '/explore'}
  >
    <Search size={20} />
    <span class="btm-nav-label">Explore</span>
  </a>
  
  <a 
    href="/" 
    class="btm-nav-link"
    class:active={currentPath === '/'}
  >
    <Home size={20} />
    <span class="btm-nav-label">Home</span>
  </a>
  
  <a 
    href="/messages" 
    class="btm-nav-link"
    class:active={currentPath.startsWith('/messages')}
  >
    <div class="indicator">
      <MessageCircle size={20} />
      {#if $unreadMessageCount > 0}
        <span class="badge badge-xs badge-primary indicator-item">{$unreadMessageCount}</span>
      {/if}
    </div>
    <span class="btm-nav-label">Messages</span>
  </a>
</nav>

<style>
  nav {
    height: 64px;
    display: flex;
  }
  
  /* Mobile: Full width spread */
  .btm-nav-link {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--fallback-bc, oklch(var(--bc) / 0.6));
    transition: color 0.2s ease;
    text-decoration: none;
    padding: 0.5rem;
    min-height: 64px;
  }
  
  /* Tablet and larger: Match main feed width */
  @media (min-width: 768px) {
    nav {
      justify-content: center;
      align-items: center;
      padding: 0 2rem;
    }
    
    /* Container to match feed width */
    nav {
      max-width: 42rem; /* Similar to max-w-2xl (672px) */
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      left: 50%;
      right: auto;
      transform: translateX(-50%);
      width: min(100vw - 4rem, 42rem);
    }
    
    .btm-nav-link {
      flex: none;
      width: auto;
      margin: 0;
      padding: 0.5rem 1rem;
    }
  }
  
  .btm-nav-link:hover,
  .btm-nav-link.active {
    color: var(--fallback-p, oklch(var(--p) / 1));
  }
  
  .btm-nav-label {
    font-size: 0.75rem;
    margin-top: 0.25rem;
    font-weight: 500;
  }
</style>