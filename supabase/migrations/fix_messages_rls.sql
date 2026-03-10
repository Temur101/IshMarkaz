-- =====================================================
-- MIGRATION: Fix RLS policies for messages table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- =====================================================

-- Make sure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to SELECT their own messages (sent or received)
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- Allow users to INSERT messages where they are the sender
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
  );

-- Allow users to DELETE messages where they are sender OR receiver
DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;
CREATE POLICY "Users can delete their messages"
  ON public.messages FOR DELETE
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );
