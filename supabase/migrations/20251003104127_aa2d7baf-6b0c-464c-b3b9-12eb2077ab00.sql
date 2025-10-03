-- Create condition_type enum for patient classification
CREATE TYPE condition_type AS ENUM ('student_mental_health', 'parkinsons', 'alzheimers', 'other_neurological');

-- Create alert_status enum
CREATE TYPE alert_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- Create risk_level enum
CREATE TYPE risk_level_type AS ENUM ('low', 'moderate', 'high', 'severe');

-- Add condition field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS condition condition_type DEFAULT 'student_mental_health';

-- Create daily_check_ins table
CREATE TABLE public.daily_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_date date NOT NULL DEFAULT CURRENT_DATE,
  mood integer NOT NULL CHECK (mood >= 0 AND mood <= 4),
  stress integer NOT NULL CHECK (stress >= 0 AND stress <= 4),
  sleep_hours numeric NOT NULL CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, check_date)
);

ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own check-ins"
ON public.daily_check_ins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-ins"
ON public.daily_check_ins FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create high_risk_alerts table (anonymous until consent)
CREATE TABLE public.high_risk_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  risk_level risk_level_type NOT NULL,
  age_range text NOT NULL,
  source text NOT NULL,
  score numeric,
  created_at timestamptz DEFAULT now() NOT NULL,
  resolved boolean DEFAULT false,
  resolved_at timestamptz
);

ALTER TABLE public.high_risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counsellors and volunteers can view unresolved alerts"
ON public.high_risk_alerts FOR SELECT
USING (
  NOT resolved AND 
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'volunteer'))
);

CREATE POLICY "System can create alerts"
ON public.high_risk_alerts FOR INSERT
WITH CHECK (true);

-- Create connection_requests table (consent-based matching)
CREATE TABLE public.connection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES public.high_risk_alerts(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counsellor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  status alert_status DEFAULT 'pending' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  responded_at timestamptz
);

ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their connection requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = student_id);

CREATE POLICY "Counsellors can view their sent requests"
ON public.connection_requests FOR SELECT
USING (auth.uid() = counsellor_id);

CREATE POLICY "Counsellors can create connection requests"
ON public.connection_requests FOR INSERT
WITH CHECK (
  auth.uid() = counsellor_id AND
  (has_role(auth.uid(), 'doctor') OR has_role(auth.uid(), 'volunteer'))
);

CREATE POLICY "Students can update request status"
ON public.connection_requests FOR UPDATE
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

-- Create secure_messages table (encrypted chat after consent)
CREATE TABLE public.secure_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_request_id uuid REFERENCES public.connection_requests(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.secure_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received"
ON public.secure_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages in their connections"
ON public.secure_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.connection_requests
    WHERE id = connection_request_id
    AND status = 'accepted'
    AND (student_id = auth.uid() OR counsellor_id = auth.uid())
  )
);

CREATE POLICY "Receivers can mark messages as read"
ON public.secure_messages FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Create volunteer_messages table (moderation system)
CREATE TABLE public.volunteer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  template_name text NOT NULL,
  message text NOT NULL,
  target_risk_level risk_level_type NOT NULL,
  approved boolean DEFAULT NULL,
  approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at timestamptz,
  feedback text,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.volunteer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their messages"
ON public.volunteer_messages FOR SELECT
USING (auth.uid() = volunteer_id);

CREATE POLICY "Volunteers can create messages"
ON public.volunteer_messages FOR INSERT
WITH CHECK (auth.uid() = volunteer_id AND has_role(auth.uid(), 'volunteer'));

CREATE POLICY "Admins can view all volunteer messages"
ON public.volunteer_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update volunteer messages"
ON public.volunteer_messages FOR UPDATE
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create volunteer_trust_scores table
CREATE TABLE public.volunteer_trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  approved_messages integer DEFAULT 0,
  rejected_messages integer DEFAULT 0,
  trusted boolean DEFAULT false,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.volunteer_trust_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Volunteers can view their own trust score"
ON public.volunteer_trust_scores FOR SELECT
USING (auth.uid() = volunteer_id);

CREATE POLICY "Admins can view all trust scores"
ON public.volunteer_trust_scores FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Create function to update volunteer trust score
CREATE OR REPLACE FUNCTION update_volunteer_trust()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approved IS NOT NULL AND OLD.approved IS NULL THEN
    INSERT INTO public.volunteer_trust_scores (volunteer_id, approved_messages, rejected_messages)
    VALUES (NEW.volunteer_id, 
            CASE WHEN NEW.approved THEN 1 ELSE 0 END,
            CASE WHEN NOT NEW.approved THEN 1 ELSE 0 END)
    ON CONFLICT (volunteer_id) DO UPDATE
    SET approved_messages = volunteer_trust_scores.approved_messages + CASE WHEN NEW.approved THEN 1 ELSE 0 END,
        rejected_messages = volunteer_trust_scores.rejected_messages + CASE WHEN NOT NEW.approved THEN 1 ELSE 0 END,
        trusted = CASE 
          WHEN volunteer_trust_scores.approved_messages + CASE WHEN NEW.approved THEN 1 ELSE 0 END >= 10 
          THEN true 
          ELSE false 
        END,
        updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_volunteer_trust_trigger ON public.volunteer_messages;
CREATE TRIGGER update_volunteer_trust_trigger
AFTER UPDATE ON public.volunteer_messages
FOR EACH ROW
EXECUTE FUNCTION update_volunteer_trust();

-- Enable realtime for secure messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.secure_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.connection_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.high_risk_alerts;