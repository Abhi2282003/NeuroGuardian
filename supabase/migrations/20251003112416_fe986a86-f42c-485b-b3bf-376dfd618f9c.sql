-- Drop the security definer view
DROP VIEW IF EXISTS public.available_counsellors;

-- Add RLS policy to allow students to view counsellor and volunteer profiles
CREATE POLICY "Students can view counsellor and volunteer profiles"
ON public.profiles
FOR SELECT
USING (
  role IN ('doctor', 'volunteer')
  OR auth.uid() = id
);