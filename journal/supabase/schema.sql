-- Create a secure schema for the 90-Day Success Journal

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. PROFILES
---------------------------------------------------------
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles are viewable by everyone.
CREATE POLICY "Public profiles are viewable by everyone."
    ON profiles FOR SELECT
    USING ( true );

-- Users can insert their own profile.
CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

-- Users can update own profile.
CREATE POLICY "Users can update own profile."
    ON profiles FOR UPDATE
    USING ( auth.uid() = id );

---------------------------------------------------------
-- 2. FRIENDSHIPS
---------------------------------------------------------
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) NOT NULL,
    receiver_id UUID REFERENCES profiles(id) NOT NULL,
    status friendship_status DEFAULT 'pending'::friendship_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(requester_id, receiver_id)
);

-- Ensure a user doesn't friend themselves
ALTER TABLE friendships ADD CONSTRAINT no_self_friendship CHECK (requester_id != receiver_id);

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can see their own friendships (either as requester or receiver).
CREATE POLICY "Users can view their own friendships."
    ON friendships FOR SELECT
    USING ( auth.uid() = requester_id OR auth.uid() = receiver_id );

-- Users can create a friendship request (they must be the requester).
CREATE POLICY "Users can create friendship requests."
    ON friendships FOR INSERT
    WITH CHECK ( auth.uid() = requester_id );

-- Users can update a friendship if they are the receiver (to accept/decline)
CREATE POLICY "Receivers can update friendship status."
    ON friendships FOR UPDATE
    USING ( auth.uid() = receiver_id );

---------------------------------------------------------
-- 3. GOALS (Vision)
---------------------------------------------------------
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    goals JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of strings
    purpose TEXT,
    is_locked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Owner access
CREATE POLICY "Users can manage their own goals."
    ON goals FOR ALL
    USING ( auth.uid() = user_id );

-- Friend read-only access
CREATE POLICY "Friends can view goals."
    ON goals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND receiver_id = goals.user_id) OR
                (receiver_id = auth.uid() AND requester_id = goals.user_id)
            )
        )
    );

---------------------------------------------------------
-- 4. DAILY LOGS
---------------------------------------------------------
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    date_id TEXT NOT NULL, -- e.g., '1', '2', etc. or a formatted date string
    is_public BOOLEAN DEFAULT false, -- If true, friends can view. If false, strictly private.
    morning JSONB NOT NULL DEFAULT '{}'::jsonb,
    meditation JSONB NOT NULL DEFAULT '{}'::jsonb,
    faith JSONB NOT NULL DEFAULT '{}'::jsonb,
    business JSONB NOT NULL DEFAULT '{}'::jsonb,
    health JSONB NOT NULL DEFAULT '{}'::jsonb,
    financial JSONB NOT NULL DEFAULT '{}'::jsonb,
    habits JSONB NOT NULL DEFAULT '{}'::jsonb,
    gratitude JSONB NOT NULL DEFAULT '[]'::jsonb,
    evening JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, date_id)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Owner access
CREATE POLICY "Users can manage their own daily logs."
    ON daily_logs FOR ALL
    USING ( auth.uid() = user_id );

-- Friend read-only access
-- NOTE: Only logs where is_public = true are viewable by friends.
CREATE POLICY "Friends can view public daily logs."
    ON daily_logs FOR SELECT
    USING (
        is_public = true AND
        EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND receiver_id = daily_logs.user_id) OR
                (receiver_id = auth.uid() AND requester_id = daily_logs.user_id)
            )
        )
    );

---------------------------------------------------------
-- 5. MILESTONE REVIEWS
---------------------------------------------------------
CREATE TABLE milestone_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    milestone TEXT NOT NULL, -- '30', '60', '90'
    wins TEXT,
    challenges TEXT,
    financial TEXT,
    spiritual TEXT,
    health TEXT,
    habits_to_continue TEXT,
    goals_next_phase TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, milestone)
);

ALTER TABLE milestone_reviews ENABLE ROW LEVEL SECURITY;

-- Owner access
CREATE POLICY "Users can manage their own milestone reviews."
    ON milestone_reviews FOR ALL
    USING ( auth.uid() = user_id );

-- Friend read-only access
CREATE POLICY "Friends can view milestone reviews."
    ON milestone_reviews FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friendships
            WHERE status = 'accepted'
            AND (
                (requester_id = auth.uid() AND receiver_id = milestone_reviews.user_id) OR
                (receiver_id = auth.uid() AND requester_id = milestone_reviews.user_id)
            )
        )
    );

-- Trigger to update 'updated_at' automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON goals
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at
    BEFORE UPDATE ON daily_logs
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
    BEFORE UPDATE ON friendships
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
