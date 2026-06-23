-- Create a secure schema for the 90-Day Success Journal

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---------------------------------------------------------
-- 1. PROFILES
---------------------------------------------------------
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    goal_importance INTEGER,
    goal_why TEXT,
    time_investment TEXT,
    interests JSONB DEFAULT '[]'::jsonb,
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
    is_public BOOLEAN DEFAULT true, -- If true, friends can view. If false, strictly private.
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

---------------------------------------------------------
-- MIGRATION: RUN THIS MANUALLY IN YOUR SUPABASE SQL EDITOR
---------------------------------------------------------
/*
ALTER TABLE profiles
  RENAME COLUMN display_name TO first_name;
  
ALTER TABLE profiles
  ADD COLUMN last_name TEXT,
  ADD COLUMN goal_importance INTEGER,
  ADD COLUMN goal_why TEXT,
  ADD COLUMN time_investment TEXT,
  ADD COLUMN interests JSONB DEFAULT '[]'::jsonb;
*/

---------------------------------------------------------
-- 6. STORAGE BUCKETS (Avatars)
---------------------------------------------------------
-- If you are using the Supabase Dashboard, you can just create a public bucket named "avatars" manually.
-- Or run this SQL:
/*
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid() = owner );

CREATE POLICY "Users can update their own avatar."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid() = owner );
*/

---------------------------------------------------------
-- 7. REAL-TIME AND UTILITY FUNCTIONS
---------------------------------------------------------
-- Enable Realtime for friendships (run manually if needed)
-- ALTER PUBLICATION supabase_realtime ADD TABLE friendships;

-- Function to get random profiles for "Suggested for you"
CREATE OR REPLACE FUNCTION get_random_profiles(limit_num INT, exclude_id UUID)
RETURNS TABLE (id UUID, username TEXT, first_name TEXT, last_name TEXT, avatar_url TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.first_name, p.last_name, p.avatar_url
  FROM profiles p
  WHERE p.id != exclude_id
    AND p.id NOT IN (
      SELECT receiver_id FROM friendships WHERE requester_id = exclude_id
      UNION
      SELECT requester_id FROM friendships WHERE receiver_id = exclude_id
    )
  ORDER BY random()
  LIMIT limit_num;
END;
$$;

---------------------------------------------------------
-- 8. NOTIFICATIONS
---------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receiver_id UUID REFERENCES profiles(id) NOT NULL,
    sender_id UUID REFERENCES profiles(id) NOT NULL,
    type TEXT NOT NULL,
    referenced_log_id TEXT,
    read_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications."
    ON notifications FOR ALL
    USING ( auth.uid() = receiver_id );

-- Trigger function for notifications
CREATE OR REPLACE FUNCTION notify_friends_on_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (receiver_id, sender_id, type, referenced_log_id)
  SELECT 
    CASE WHEN requester_id = NEW.user_id THEN receiver_id ELSE requester_id END,
    NEW.user_id,
    'new_entry',
    NEW.date_id
  FROM friendships
  WHERE status = 'accepted' AND (requester_id = NEW.user_id OR receiver_id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger should only fire on new logs or when a log becomes public for the first time?
-- The prompt says: "Whenever a new row is inserted into daily_logs"
CREATE TRIGGER on_daily_log_insert
  AFTER INSERT ON daily_logs
  FOR EACH ROW
  EXECUTE PROCEDURE notify_friends_on_log();

-- Add to Realtime (uncomment and run manually in Supabase Dashboard)
-- ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

---------------------------------------------------------
-- 9. CASCADE DELETION POLICIES (Run Manually)
---------------------------------------------------------
-- Run this in your Supabase SQL editor to allow deleting users directly from auth.users
-- This will automatically cascade and delete their profile, logs, friendships, etc.

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_requester_id_fkey;
ALTER TABLE friendships ADD CONSTRAINT friendships_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE friendships DROP CONSTRAINT IF EXISTS friendships_receiver_id_fkey;
ALTER TABLE friendships ADD CONSTRAINT friendships_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_user_id_fkey;
ALTER TABLE goals ADD CONSTRAINT goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_user_id_fkey;
ALTER TABLE daily_logs ADD CONSTRAINT daily_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE milestone_reviews DROP CONSTRAINT IF EXISTS milestone_reviews_user_id_fkey;
ALTER TABLE milestone_reviews ADD CONSTRAINT milestone_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_receiver_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE notifications ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
