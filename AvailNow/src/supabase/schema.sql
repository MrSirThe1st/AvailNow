-- Calendar Integration schema for AvailNow

-- Table for storing calendar integrations
CREATE TABLE IF NOT EXISTS public.calendar_integrations (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL, -- 'google', 'outlook', 'apple', 'calendly'
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_user_id ON public.calendar_integrations(user_id);

-- Table for storing user-selected calendars to check for availability
CREATE TABLE IF NOT EXISTS public.selected_calendars (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_id TEXT NOT NULL, -- ID provided by the calendar provider
    provider VARCHAR(20) NOT NULL, -- 'google', 'outlook', 'apple', 'calendly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, calendar_id, provider)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_selected_calendars_user_id ON public.selected_calendars(user_id);

-- Table for storing calendar events (optional, if you need to cache them)
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_id TEXT NOT NULL,
    provider VARCHAR(20) NOT NULL,
    event_id TEXT NOT NULL,
    title TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, calendar_id, event_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time_range ON public.calendar_events(start_time, end_time);

-- Table for storing calendar settings
CREATE TABLE IF NOT EXISTS public.calendar_settings (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    availability_start_time TIME DEFAULT '09:00',
    availability_end_time TIME DEFAULT '17:00',
    working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- 0=Sunday, 6=Saturday
    buffer_before INTEGER DEFAULT 0, -- Buffer time in minutes before events
    buffer_after INTEGER DEFAULT 0, -- Buffer time in minutes after events
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create Row Level Security (RLS) policies

-- Calendar integrations security (only the owner can access their integrations)
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar integrations"
    ON public.calendar_integrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar integrations"
    ON public.calendar_integrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar integrations"
    ON public.calendar_integrations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar integrations"
    ON public.calendar_integrations FOR DELETE
    USING (auth.uid() = user_id);

-- Selected calendars security
ALTER TABLE public.selected_calendars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own selected calendars"
    ON public.selected_calendars FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own selected calendars"
    ON public.selected_calendars FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own selected calendars"
    ON public.selected_calendars FOR DELETE
    USING (auth.uid() = user_id);

-- Calendar events security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events"
    ON public.calendar_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
    ON public.calendar_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
    ON public.calendar_events FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
    ON public.calendar_events FOR DELETE
    USING (auth.uid() = user_id);

-- Calendar settings security
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar settings"
    ON public.calendar_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar settings"
    ON public.calendar_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar settings"
    ON public.calendar_settings FOR UPDATE
    USING (auth.uid() = user_id);