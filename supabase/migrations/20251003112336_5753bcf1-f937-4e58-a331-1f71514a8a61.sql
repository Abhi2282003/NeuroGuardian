-- Make alert_id nullable to support direct connection requests
ALTER TABLE public.connection_requests 
ALTER COLUMN alert_id DROP NOT NULL;

-- Add index for better query performance
CREATE INDEX idx_connection_requests_counsellor ON public.connection_requests(counsellor_id);
CREATE INDEX idx_connection_requests_student ON public.connection_requests(student_id);

-- Update RLS policy to allow counsellors/volunteers to view requests sent to them
CREATE POLICY "Counsellors can view requests sent to them"
ON public.connection_requests
FOR SELECT
USING (auth.uid() = counsellor_id);

-- Allow students to create direct connection requests
CREATE POLICY "Students can create direct connection requests"
ON public.connection_requests
FOR INSERT
WITH CHECK (auth.uid() = student_id AND has_role(auth.uid(), 'patient'));

-- Create a view for browseable counsellors/volunteers
CREATE OR REPLACE VIEW public.available_counsellors AS
SELECT 
  p.id,
  p.name,
  p.role,
  p.organization,
  COUNT(cr.id) as active_connections
FROM public.profiles p
LEFT JOIN public.connection_requests cr 
  ON p.id = cr.counsellor_id 
  AND cr.status = 'accepted'
WHERE p.role IN ('doctor', 'volunteer')
GROUP BY p.id, p.name, p.role, p.organization;

-- Grant access to the view
GRANT SELECT ON public.available_counsellors TO authenticated;