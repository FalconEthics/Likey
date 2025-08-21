<script>
  import { page } from '$app/stores';
  import { unreadMessageCount } from '../stores.js';
  
  // Lucide Icons
  import { Home, Search, MessageCircle } from 'lucide-svelte';
  
  // Get current path for active state
  $: currentPath = $page.url.pathname;
</script>

<!-- Modern Bottom Navigation - All screens -->
<nav class="modern-bottom-nav">
  <div class="nav-container">
    <div class="nav-background"></div>
    
    <a 
      href="/explore" 
      class="nav-item"
      class:active={currentPath === '/explore'}
    >
      <div class="nav-icon-wrapper">
        <Search size={22} />
        <div class="glow-effect"></div>
      </div>
      <span class="nav-label">Explore</span>
    </a>
    
    <a 
      href="/" 
      class="nav-item home-item"
      class:active={currentPath === '/'}
    >
      <div class="nav-icon-wrapper home-icon">
        <Home size={24} />
        <div class="glow-effect"></div>
      </div>
      <span class="nav-label">Home</span>
    </a>
    
    <a 
      href="/messages" 
      class="nav-item"
      class:active={currentPath.startsWith('/messages')}
    >
      <div class="nav-icon-wrapper">
        <div class="indicator">
          <MessageCircle size={22} />
          {#if $unreadMessageCount > 0}
            <span class="message-badge">{$unreadMessageCount}</span>
          {/if}
        </div>
        <div class="glow-effect"></div>
      </div>
      <span class="nav-label">Messages</span>
    </a>
  </div>
</nav>

<style>
  /* Modern Bottom Navigation */
  .modern-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 50;
    padding: 12px 16px 20px;
    background: transparent;
  }
  
  /* Hide on desktop - navigation is handled by top nav */
  @media (min-width: 1024px) {
    .modern-bottom-nav {
      display: none;
    }
  }
  
  .nav-container {
    position: relative;
    max-width: 320px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 20px;
  }
  
  /* Glassmorphism background */
  .nav-background {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 -2px 16px rgba(0, 0, 0, 0.1),
      0 -4px 24px rgba(0, 0, 0, 0.05);
  }
  
  /* Dark theme background */
  [data-theme="dark"] .nav-background {
    background: rgba(24, 24, 27, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 -2px 16px rgba(0, 0, 0, 0.4),
      0 -4px 24px rgba(0, 0, 0, 0.2);
  }
  
  /* Dark theme nav items */
  [data-theme="dark"] .nav-item {
    color: rgba(255, 255, 255, 0.7);
  }
  
  [data-theme="dark"] .nav-item.active {
    color: hsl(346 77% 65%);
  }
  
  [data-theme="dark"] .nav-item.active .nav-label {
    color: hsl(346 77% 65%);
    text-shadow: 0 0 8px hsl(346 77% 65% / 0.3);
  }
  
  /* Navigation items */
  .nav-item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    color: hsl(var(--base-content) / 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px 10px;
    border-radius: 14px;
    min-width: 56px;
  }
  
  .nav-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 14px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin-bottom: 3px;
  }
  
  .home-icon {
    width: 46px;
    height: 46px;
    border-radius: 16px;
  }
  
  /* Glow effect (hidden by default) */
  .glow-effect {
    position: absolute;
    inset: -3px;
    background: linear-gradient(135deg, 
      hsl(346 77% 55%) 0%, 
      hsl(340 70% 60%) 50%, 
      hsl(348 80% 65%) 100%);
    border-radius: 18px;
    opacity: 0;
    filter: blur(6px);
    transition: opacity 0.3s ease;
    z-index: -1;
  }
  
  .home-icon .glow-effect {
    inset: -4px;
    border-radius: 20px;
    filter: blur(8px);
  }
  
  /* Active state */
  .nav-item.active {
    color: hsl(var(--primary));
  }
  
  .nav-item.active .nav-icon-wrapper {
    background: linear-gradient(135deg, 
      hsl(346 77% 49% / 0.1) 0%, 
      hsl(340 70% 65% / 0.1) 50%, 
      hsl(348 80% 70% / 0.1) 100%);
    transform: translateY(-2px);
  }
  
  .nav-item.active .glow-effect {
    opacity: 0.25;
    animation: pulse-glow 3s ease-in-out infinite;
  }
  
  /* Home button special styling */
  .home-item.active .nav-icon-wrapper {
    background: linear-gradient(135deg, 
      hsl(346 77% 49% / 0.15) 0%, 
      hsl(340 70% 65% / 0.15) 50%, 
      hsl(348 80% 70% / 0.15) 100%);
    transform: translateY(-3px) scale(1.05);
  }
  
  .home-item.active .glow-effect {
    opacity: 0.35;
  }
  
  /* Hover effects */
  .nav-item:hover:not(.active) {
    color: hsl(var(--base-content) / 0.8);
  }
  
  .nav-item:hover .nav-icon-wrapper {
    background: hsl(var(--base-content) / 0.05);
    transform: translateY(-1px);
  }
  
  .nav-item:hover .glow-effect {
    opacity: 0.15;
  }
  
  /* Labels */
  .nav-label {
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 2px;
    transition: all 0.3s ease;
    letter-spacing: 0.5px;
  }
  
  .nav-item.active .nav-label {
    color: hsl(var(--primary));
    text-shadow: 0 0 8px hsl(var(--primary) / 0.3);
  }
  
  /* Message badge */
  .message-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: linear-gradient(135deg, 
      hsl(346 77% 49%) 0%, 
      hsl(340 80% 60%) 100%);
    color: white;
    font-size: 0.7rem;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px hsl(346 77% 49% / 0.4);
    animation: badge-pulse 2s ease-in-out infinite;
  }
  
  /* Animations */
  @keyframes pulse-glow {
    0%, 100% { 
      opacity: 0.25;
      filter: blur(6px);
    }
    50% { 
      opacity: 0.4;
      filter: blur(8px);
    }
  }
  
  @keyframes badge-pulse {
    0%, 100% { 
      transform: scale(1);
      box-shadow: 0 2px 8px hsl(346 77% 49% / 0.4);
    }
    50% { 
      transform: scale(1.1);
      box-shadow: 0 4px 16px hsl(346 77% 49% / 0.6);
    }
  }
  
  /* Tablet responsive */
  @media (min-width: 768px) {
    .nav-container {
      max-width: min(90vw, 500px);
      padding: 10px 32px;
    }
    
    .nav-item {
      padding: 12px 16px;
      min-width: 80px;
    }
    
    .nav-icon-wrapper {
      width: 52px;
      height: 52px;
    }
    
    .home-icon {
      width: 56px;
      height: 56px;
    }
  }
</style>