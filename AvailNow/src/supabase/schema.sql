-- AvailNow Database Schema with Row Level Security (RLS)
-- ==========================================
-- This file defines tables and RLS policies for the AvailNow application
-- using Supabase authentication.

-------------------------------------------------------------
-- USERS RELATED TABLES
-------------------------------------------------------------

-- User profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-------------------------------------------------------------
-- CALENDAR RELATED TABLES
-------------------------------------------------------------

-- Calendar Integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL, -- 'google', 'outlook', etc.
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Selected Calendars table
CREATE TABLE IF NOT EXISTS public.selected_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_id TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, calendar_id, provider)
);

-- Calendar Settings table
CREATE TABLE IF NOT EXISTS public.calendar_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    availability_start_time TIME DEFAULT '09:00',
    availability_end_time TIME DEFAULT '17:00',
    working_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    buffer_before INTEGER DEFAULT 0,
    buffer_after INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Availability Slots table
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    recurrence VARCHAR(20), -- 'none', 'daily', 'weekly', etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-------------------------------------------------------------
-- WIDGET RELATED TABLES
-------------------------------------------------------------

-- Widget Settings table
CREATE TABLE IF NOT EXISTS public.widget_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    accent_color VARCHAR(20) DEFAULT '#0070f3',
    text_color VARCHAR(20) DEFAULT '#333333',
    button_text VARCHAR(50) DEFAULT 'Check Availability',
    show_days INTEGER DEFAULT 5,
    compact BOOLEAN DEFAULT FALSE,
    header_style VARCHAR(20) DEFAULT 'modern',
    font_family VARCHAR(20) DEFAULT 'system',
    border_radius VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Widget Statistics table
CREATE TABLE IF NOT EXISTS public.widget_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    bookings INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_stats ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------
-- CREATE ROW LEVEL SECURITY POLICIES
-------------------------------------------------------------

-- User Profiles Policies
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Calendar Integrations Policies
CREATE POLICY "Users can view their own calendar integrations"
ON public.calendar_integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar integrations"
ON public.calendar_integrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations"
ON public.calendar_integrations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
ON public.calendar_integrations FOR DELETE
USING (auth.uid() = user_id);

-- Selected Calendars Policies
CREATE POLICY "Users can view their own selected calendars"
ON public.selected_calendars FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own selected calendars"
ON public.selected_calendars FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own selected calendars"
ON public.selected_calendars FOR DELETE
USING (auth.uid() = user_id);

-- Calendar Settings Policies
CREATE POLICY "Users can view their own calendar settings"
ON public.calendar_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar settings"
ON public.calendar_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar settings"
ON public.calendar_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Availability Slots Policies
CREATE POLICY "Users can view their own availability slots"
ON public.availability_slots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own availability slots"
ON public.availability_slots FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availability slots"
ON public.availability_slots FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availability slots"
ON public.availability_slots FOR DELETE
USING (auth.uid() = user_id);

-- Widget Settings Policies
CREATE POLICY "Users can view their own widget settings"
ON public.widget_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own widget settings"
ON public.widget_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget settings"
ON public.widget_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Widget Stats Policies
CREATE POLICY "Users can view their own widget stats"
ON public.widget_stats FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own widget stats"
ON public.widget_stats FOR UPDATE
USING (auth.uid() = user_id);

-- Public read access for availability slots (for the widget)
CREATE POLICY "Anyone can read availability slots"
ON public.availability_slots FOR SELECT
USING (true);

-- Public read access for widget settings (for the widget)
CREATE POLICY "Anyone can read widget settings"
ON public.widget_settings FOR SELECT
USING (true);

-------------------------------------------------------------
-- HELPER FUNCTIONS
-------------------------------------------------------------

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_calendar_integrations
BEFORE UPDATE ON public.calendar_integrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_calendar_settings
BEFORE UPDATE ON public.calendar_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_availability_slots
BEFORE UPDATE ON public.availability_slots
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_widget_settings
BEFORE UPDATE ON public.widget_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to refresh Google Calendar token
CREATE OR REPLACE FUNCTION public.refresh_google_token(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_refresh_token TEXT;
  v_result JSON;
BEGIN
  -- Get the refresh token
  SELECT refresh_token INTO v_refresh_token
  FROM public.calendar_integrations
  WHERE user_id = p_user_id AND provider = 'google';
  
  IF v_refresh_token IS NULL THEN
    RETURN json_build_object('error', 'No refresh token found');
  END IF;
  
  -- Note: This is a placeholder. In a real implementation, you would call
  -- an external service to refresh the token. This likely requires a serverless function.
  -- This is just to demonstrate the concept.
  RETURN json_build_object('success', true, 'message', 'Token would be refreshed here');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

