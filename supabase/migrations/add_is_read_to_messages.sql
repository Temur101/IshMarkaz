-- Add is_read column to messages table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'is_read'
    ) THEN 
        ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Enable Realtime for the messages table (if not already enabled)
-- This is crucial for the "Check" / "CheckCheck" marks to update in real-time
BEGIN;
  -- Remove if already exists to avoid errors, then add
  DROP PUBLICATION IF EXISTS supabase_realtime_messages;
  CREATE PUBLICATION supabase_realtime_messages FOR TABLE messages;
COMMIT;

-- IMPORTANT: Add UPDATE policy for messages
-- Only the receiver should be able to mark a message as read
DROP POLICY IF EXISTS "Users can mark messages as read" ON public.messages;
CREATE POLICY "Users can mark messages as read"
  ON public.messages FOR UPDATE
  USING (
    auth.uid() = receiver_id
  )
  WITH CHECK (
    auth.uid() = receiver_id
  );
