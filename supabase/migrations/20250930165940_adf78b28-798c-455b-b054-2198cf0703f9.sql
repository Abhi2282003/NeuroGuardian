-- Add UPDATE policy for patients table to allow only authorized healthcare staff
CREATE POLICY "Authorized staff can update patients"
ON public.patients
FOR UPDATE
USING (
  has_role(auth.uid(), 'doctor'::app_role) 
  OR has_role(auth.uid(), 'health_worker'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'doctor'::app_role) 
  OR has_role(auth.uid(), 'health_worker'::app_role) 
  OR has_role(auth.uid(), 'admin'::app_role)
);