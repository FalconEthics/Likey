<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabase.js';
  import { user } from '$lib/stores.js';
  import { forwardMessage } from '$lib/messages.js';
  import { goto } from '$app/navigation';

  /** @type {boolean} */
  let { show = $bindable(false), messageId, messageContent } = $props();

  /** @type {Array<{id: string, username: string, avatar_url?: string, last_message_time?: string}>} */
  let conversations = $state([]);
  let loading = $state(true);
  let forwarding = $state(false);

  onMount(() => {
    if (show) {
      loadConversations();
    }
  });

  $effect(() => {
    if (show) {
      loadConversations();
    }
  });

  async function loadConversations() {
    if (!$user) return;
    
    try {
      loading = true;
      
      // Get all conversations ordered by last message time
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          user1_id,
          user2_id,
          updated_at,
          user1:profiles!conversations_user1_id_fkey(id, username, display_name, avatar_url),
          user2:profiles!conversations_user2_id_fkey(id, username, display_name, avatar_url)
        `)
        .or(`user1_id.eq.${$user.id},user2_id.eq.${$user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Transform conversations to get the other user's info
      conversations = conversationData.map(conv => {
        const otherUser = conv.user1_id === $user.id 
          ? conv.user2 
          : conv.user1;
        
        return {
          id: conv.id,
          username: otherUser.username,
          display_name: otherUser.display_name,
          avatar_url: otherUser.avatar_url,
          last_message_time: conv.updated_at
        };
      });

    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      loading = false;
    }
  }

  async function handleForward(conversationId) {
    if (!messageId || forwarding) return;
    
    try {
      forwarding = true;
      
      const result = await forwardMessage(messageId, conversationId);
      
      if (result.success) {
        // Navigate to the conversation
        goto(`/messages/${conversationId}`);
        show = false;
      } else {
        alert(result.error || 'Failed to forward message');
      }
    } catch (error) {
      console.error('Error forwarding message:', error);
      alert('Failed to forward message');
    } finally {
      forwarding = false;
    }
  }

  function closeModal() {
    show = false;
  }

  // Close modal on escape key
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    onclick={closeModal}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="forward-modal-title"
    tabindex="-1"
  >
    <div 
      class="bg-base-100 rounded-lg max-w-md w-full max-h-[80vh] flex flex-col"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="p-4 border-b border-base-200">
        <h2 id="forward-modal-title" class="text-lg font-semibold">Forward Message</h2>
        <p class="text-sm text-base-content/60 mt-1">Choose a conversation to forward to</p>
      </div>

      <!-- Message Preview -->
      <div class="p-4 border-b border-base-200 bg-base-50">
        <p class="text-sm text-base-content/80 italic">"{messageContent}"</p>
      </div>

      <!-- Conversation List -->
      <div class="flex-1 overflow-y-auto">
        {#if loading}
          <div class="p-8 text-center">
            <div class="loading loading-spinner loading-md"></div>
            <p class="text-sm text-base-content/60 mt-2">Loading conversations...</p>
          </div>
        {:else if conversations.length === 0}
          <div class="p-8 text-center">
            <p class="text-base-content/60">No conversations found</p>
            <p class="text-sm text-base-content/40 mt-2">Start a conversation first to forward messages</p>
          </div>
        {:else}
          <div class="divide-y divide-base-200">
            {#each conversations as conversation}
              <button
                class="w-full p-4 flex items-center gap-3 hover:bg-base-200 transition-colors disabled:opacity-50"
                onclick={() => handleForward(conversation.id)}
                disabled={forwarding}
              >
                <!-- Avatar -->
                <div class="avatar">
                  <div class="w-10 h-10 rounded-full">
                    {#if conversation.avatar_url}
                      <img 
                        src="{conversation.avatar_url}" 
                        alt="{conversation.display_name}'s avatar"
                        class="w-full h-full object-cover"
                      />
                    {:else}
                      <div class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-lg font-semibold">
                        {conversation.display_name?.charAt(0).toUpperCase() || conversation.username.charAt(0).toUpperCase()}
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex-1 text-left">
                  <p class="font-medium">{conversation.display_name || conversation.username}</p>
                  <p class="text-sm text-base-content/60">@{conversation.username}</p>
                  {#if conversation.last_message_time}
                    <p class="text-xs text-base-content/40">
                      Last active: {new Date(conversation.last_message_time).toLocaleDateString()}
                    </p>
                  {/if}
                </div>

                {#if forwarding}
                  <div class="loading loading-spinner loading-sm"></div>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-base-200">
        <button 
          class="btn btn-outline w-full"
          onclick={closeModal}
          disabled={forwarding}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}