-- Add credits tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS chat_credits_minutes integer DEFAULT 5;

-- Create table to track chat session time
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_request_id uuid REFERENCES public.connection_requests(id) ON DELETE CASCADE NOT NULL,
  student_id uuid NOT NULL,
  counsellor_id uuid NOT NULL,
  started_at timestamp with time zone DEFAULT now() NOT NULL,
  ended_at timestamp with time zone,
  duration_minutes integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions
FOR SELECT
USING (auth.uid() = student_id OR auth.uid() = counsellor_id);

CREATE POLICY "Users can create chat sessions"
ON public.chat_sessions
FOR INSERT
WITH CHECK (auth.uid() = student_id OR auth.uid() = counsellor_id);

CREATE POLICY "Users can update their chat sessions"
ON public.chat_sessions
FOR UPDATE
USING (auth.uid() = student_id OR auth.uid() = counsellor_id);

-- Add status column to connection_requests to track disconnections
ALTER TABLE public.connection_requests 
ADD COLUMN IF NOT EXISTS disconnected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS disconnected_by uuid;

-- Update policies to allow students to disconnect
CREATE POLICY "Students can disconnect from counsellors"
ON public.connection_requests
FOR UPDATE
USING (auth.uid() = student_id AND status = 'accepted')
WITH CHECK (auth.uid() = student_id);