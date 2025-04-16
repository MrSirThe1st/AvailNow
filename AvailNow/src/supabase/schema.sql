-- Calendar Integration schema for AvailNow

-- Table for storing calendar integrations
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT to match Clerk user ID
    provider VARCHAR(20) NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, provider)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON public.calendar_integrations(user_id);

-- Table for storing user-selected calendars to check for availability
CREATE TABLE IF NOT EXISTS public.selected_calendars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT to match Clerk user ID
    calendar_id TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, calendar_id, provider)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_selected_calendars_user_id ON public.selected_calendars(user_id);

-- Table for storing calendar events (optional, if you need to cache them)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL, -- Changed to TEXT to match Clerk user ID
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time_range ON public.calendar_events(start_time, end_time);

-- Table for storing calendar settings
CREATE TABLE IF NOT EXISTS public.calendar_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- Changed to TEXT to match Clerk user ID
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_settings_user_id ON public.calendar_settings(user_id);

-- Enable RLS on all tables
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can insert their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can update their own calendar integrations" ON public.calendar_integrations;
DROP POLICY IF EXISTS "Users can delete their own calendar integrations" ON public.calendar_integrations;

DROP POLICY IF EXISTS "Users can view their own selected calendars" ON public.selected_calendars;
DROP POLICY IF EXISTS "Users can insert their own selected calendars" ON public.selected_calendars;
DROP POLICY IF EXISTS "Users can delete their own selected calendars" ON public.selected_calendars;

DROP POLICY IF EXISTS "Users can view their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can insert their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can update their own calendar events" ON public.calendar_events;
DROP POLICY IF EXISTS "Users can delete their own calendar events" ON public.calendar_events;

DROP POLICY IF EXISTS "Users can view their own calendar settings" ON public.calendar_settings;
DROP POLICY IF EXISTS "Users can insert their own calendar settings" ON public.calendar_settings;
DROP POLICY IF EXISTS "Users can update their own calendar settings" ON public.calendar_settings;

-- Calendar integrations policies
CREATE POLICY "Users can view their own calendar integrations"
ON public.calendar_integrations FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own calendar integrations"
ON public.calendar_integrations FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own calendar integrations"
ON public.calendar_integrations FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
ON public.calendar_integrations FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Selected calendars policies
CREATE POLICY "Users can view their own selected calendars"
ON public.selected_calendars FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own selected calendars"
ON public.selected_calendars FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own selected calendars"
ON public.selected_calendars FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Calendar events security
CREATE POLICY "Users can view their own calendar events"
ON public.calendar_events FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own calendar events"
ON public.calendar_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.calendar_events FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON public.calendar_events FOR DELETE
TO authenticated
USING (auth.uid()::text = user_id);

-- Calendar settings policies
CREATE POLICY "Users can view their own calendar settings"
ON public.calendar_settings FOR SELECT
TO authenticated
USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own calendar settings"
ON public.calendar_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own calendar settings"
ON public.calendar_settings FOR UPDATE
TO authenticated
USING (auth.uid()::text = user_id);