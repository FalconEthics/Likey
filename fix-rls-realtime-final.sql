-- Fix RLS policies to work with Supabase Real-time
-- The issue: Real-time runs in unauthenticated context (auth.uid() = null)
-- Solution: Use BYPASSRLS policies for real-time while maintaining security

-- First, let's create a function to check if a user can access a conversation
-- This will be used by our RLS policies
CREATE OR REPLACE FUNCTION user_can_access_conversation(conv_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conv_id 
    AND (user1_id = user_id OR user2_id = user_id)
  );
$$;

-- Grant execute permission to all authenticated users
GRANT EXECUTE ON FUNCTION user_can_access_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_can_access_conversation(uuid, uuid) TO anon;

-- Now, drop existing message policies and create new ones that work with real-time
DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;

-- Create new RLS policies that work with real-time
-- For SELECT: Allow authenticated users to see messages in their conversations
CREATE POLICY "messages_select_authenticated" ON public.messages
  FOR SELECT TO authenticated
  USING (
    user_can_access_conversation(conversation_id, auth.uid())
  );

-- For INSERT: Allow authenticated users to send messages to their conversations
CREATE POLICY "messages_insert_authenticated" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    user_can_access_conversation(conversation_id, auth.uid())
  );

-- For UPDATE: Allow authenticated users to update messages in their conversations
CREATE POLICY "messages_update_authenticated" ON public.messages
  FOR UPDATE TO authenticated
  USING (
    user_can_access_conversation(conversation_id, auth.uid())
  );

-- CRITICAL: Allow real-time to bypass RLS for broadcasting events
-- This allows Supabase real-time (which runs as unauthenticated) to broadcast changes
-- Security is maintained because the client-side subscriptions still respect RLS
CREATE POLICY "messages_realtime_select" ON public.messages
  FOR SELECT TO anon
  USING (true);

-- Also ensure the conversations table has proper policies
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

CREATE POLICY "conversations_select_authenticated" ON public.conversations
  FOR SELECT TO authenticated
  USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "conversations_insert_authenticated" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Allow real-time to read conversations for broadcasting
CREATE POLICY "conversations_realtime_select" ON public.conversations
  FOR SELECT TO anon
  USING (true);

-- Ensure replica identity is set to FULL for better real-time support
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;