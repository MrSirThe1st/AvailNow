-- This SQL script sets up tables and Row Level Security (RLS) policies
-- for AvailNow's data model with Clerk authentication

-------------------------------------------------------------
-- USERS RELATED TABLES
-------------------------------------------------------------

-- User settings/profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    display_name TEXT,
    email TEXT,
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-------------------------------------------------------------
-- CALENDAR RELATED TABLES
-------------------------------------------------------------

-- Calendar Integrations table
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
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
    user_id TEXT NOT NULL, -- Clerk user ID
    calendar_id TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, calendar_id, provider)
);

-- Calendar Events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Clerk user ID
    calendar_id TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    event_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider, calendar_id, event_id)
);

-- Calendar Settings table
CREATE TABLE IF NOT EXISTS public.calendar_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    timezone VARCHAR(50) DEFAULT 'UTC',
    availability_start_time TIME DEFAULT '09:00',
    availability_end_time TIME DEFAULT '17:00',
    working_days INTEGER[] DEFAULT '{1,2,3,4,5}',
    buffer_before INTEGER DEFAULT 0,
    buffer_after INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Availability Slots table
CREATE TABLE IF NOT EXISTS public.availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Clerk user ID
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
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Widget Statistics table
CREATE TABLE IF NOT EXISTS public.widget_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    bookings INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
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
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);

-- Calendar Integrations Policies
CREATE POLICY "Users can view their own calendar integrations"
ON public.calendar_integrations FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own calendar integrations"
ON public.calendar_integrations FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own calendar integrations"
ON public.calendar_integrations FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
ON public.calendar_integrations FOR DELETE
USING (auth.jwt() ->> 'sub' = user_id);

-- Selected Calendars Policies
CREATE POLICY "Users can view their own selected calendars"
ON public.selected_calendars FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own selected calendars"
ON public.selected_calendars FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own selected calendars"
ON public.selected_calendars FOR DELETE
USING (auth.jwt() ->> 'sub' = user_id);

-- Calendar Events Policies
CREATE POLICY "Users can view their own calendar events"
ON public.calendar_events FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.calendar_events FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON public.calendar_events FOR DELETE
USING (auth.jwt() ->> 'sub' = user_id);

-- Calendar Settings Policies
CREATE POLICY "Users can view their own calendar settings"
ON public.calendar_settings FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own calendar settings"
ON public.calendar_settings FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own calendar settings"
ON public.calendar_settings FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);

-- Availability Slots Policies
CREATE POLICY "Users can view their own availability slots"
ON public.availability_slots FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can create their own availability slots"
ON public.availability_slots FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own availability slots"
ON public.availability_slots FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can delete their own availability slots"
ON public.availability_slots FOR DELETE
USING (auth.jwt() ->> 'sub' = user_id);

-- Widget Settings Policies
CREATE POLICY "Users can view their own widget settings"
ON public.widget_settings FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can insert their own widget settings"
ON public.widget_settings FOR INSERT
WITH CHECK (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own widget settings"
ON public.widget_settings FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);

-- Widget Stats Policies
CREATE POLICY "Users can view their own widget stats"
ON public.widget_stats FOR SELECT
USING (auth.jwt() ->> 'sub' = user_id);

CREATE POLICY "Users can update their own widget stats"
ON public.widget_stats FOR UPDATE
USING (auth.jwt() ->> 'sub' = user_id);