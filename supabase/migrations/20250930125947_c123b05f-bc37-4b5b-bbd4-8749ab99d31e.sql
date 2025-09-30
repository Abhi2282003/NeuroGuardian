-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE app_role AS ENUM ('admin', 'doctor', 'health_worker', 'patient');
CREATE TYPE risk_level AS ENUM ('low', 'moderate', 'high');
CREATE TYPE disorder_type AS ENUM ('parkinson', 'alzheimer', 'epilepsy');

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'patient',
  organization TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  mrn TEXT,
  phone TEXT,
  consent_flags JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  device_info JSONB,
  location TEXT,
  offline_flag BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Activity results table
CREATE TABLE public.activity_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  activity_key TEXT NOT NULL,
  raw_payload JSONB,
  features JSONB,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  duration_sec INTEGER,
  quality_flags JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_results ENABLE ROW LEVEL SECURITY;

-- Risk summaries table
CREATE TABLE public.risk_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  disorder_key disorder_type NOT NULL,
  risk_level risk_level NOT NULL,
  stage_label TEXT,
  score NUMERIC CHECK (score >= 0 AND score <= 100),
  rationale JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.risk_summaries ENABLE ROW LEVEL SECURITY;

-- Attachments table
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('audio', 'image', 'pdf', 'csv')),
  url TEXT NOT NULL,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- User roles table (for role-based access control)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- RLS Policies for patients
CREATE POLICY "Doctors and health workers can view all patients"
  ON public.patients FOR SELECT
  USING (
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'health_worker') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Health workers can create patients"
  ON public.patients FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'health_worker') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for sessions
CREATE POLICY "Users can view sessions they created or for their patients"
  ON public.sessions FOR SELECT
  USING (
    created_by = auth.uid() OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authorized users can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'health_worker') OR
    public.has_role(auth.uid(), 'doctor') OR
    public.has_role(auth.uid(), 'admin')
  );

-- RLS Policies for activity_results
CREATE POLICY "Users can view activity results for their sessions"
  ON public.activity_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = activity_results.session_id
      AND (sessions.created_by = auth.uid() OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Authorized users can create activity results"
  ON public.activity_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = activity_results.session_id
      AND sessions.created_by = auth.uid()
    )
  );

-- RLS Policies for risk_summaries
CREATE POLICY "Users can view risk summaries for their sessions"
  ON public.risk_summaries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = risk_summaries.session_id
      AND (sessions.created_by = auth.uid() OR public.has_role(auth.uid(), 'doctor') OR public.has_role(auth.uid(), 'admin'))
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient')
  );
  
  -- Also add to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'));
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();