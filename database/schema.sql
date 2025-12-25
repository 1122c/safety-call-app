-- Safety Call App Database Schema
-- Run this in your Supabase SQL editor

-- Note: auth.users RLS is already enabled by Supabase by default
-- The line below is not needed and will cause a permission error
-- ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create emergency_contacts table
CREATE TABLE emergency_contacts (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create safety_incidents table
CREATE TABLE safety_incidents (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL CHECK (
        incident_type IN (
            'fake_call',
            'location_share',
            'emergency_call'
        )
    ),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_address TEXT,
    timestamp TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        notes TEXT,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table for additional user data
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES auth.users (id) ON DELETE CASCADE UNIQUE,
    display_name TEXT,
    emergency_message TEXT DEFAULT 'I feel unsafe. My location:',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Emergency contacts: users can only see their own contacts
CREATE POLICY "Users can view own emergency contacts" ON emergency_contacts FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own emergency contacts" ON emergency_contacts FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own emergency contacts" ON emergency_contacts FOR
UPDATE USING (auth.uid () = user_id);

CREATE POLICY "Users can delete own emergency contacts" ON emergency_contacts FOR DELETE USING (auth.uid () = user_id);

-- Safety incidents: users can only see their own incidents
CREATE POLICY "Users can view own safety incidents" ON safety_incidents FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own safety incidents" ON safety_incidents FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

-- User profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles FOR
UPDATE USING (auth.uid () = user_id);

-- Enable RLS on all tables
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_emergency_contacts_updated_at 
  BEFORE UPDATE ON emergency_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
-- sample data for testing
INSERT INTO
    user_profiles (
        user_id,
        display_name,
        emergency_message
    )
VALUES (
        auth.uid (),
        'Safety User',
        'I feel unsafe and need help. My current location:'
    ) ON CONFLICT (user_id) DO NOTHING;