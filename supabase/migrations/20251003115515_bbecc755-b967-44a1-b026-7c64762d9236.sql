-- Add UPDATE policy for counsellors to respond to connection requests
CREATE POLICY "Counsellors can respond to connection requests"
ON public.connection_requests
FOR UPDATE
USING (auth.uid() = counsellor_id AND status = 'pending')
WITH CHECK (auth.uid() = counsellor_id);