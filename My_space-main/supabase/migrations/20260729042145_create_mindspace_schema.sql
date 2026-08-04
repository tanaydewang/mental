/*
# Create MindSpace core schema (multi-user, owner-scoped)

1. Overview
MindSpace is a mental wellness SaaS. Each authenticated user owns their data.
This migration creates tables for: profiles, moods, journals, sleep, goals, posts.

2. New Tables
- `profiles` — extends auth.users with display info (avatar, full name, bio, preferences)
- `moods` — daily mood logs with emoji, intensity 1-5, note, tags
- `journals` — rich-text journal entries with category and title
- `sleep` — nightly sleep logs (hours, quality 1-5, bedtime/wake, notes)
- `goals` — wellness goals with target, progress, status
- `posts` — community feed posts with likes count

3. Columns
profiles:
  id (uuid, PK, FK -> auth.users), full_name, avatar_url, bio,
  theme_preference, notification_enabled, privacy_public, created_at, updated_at
moods:
  id, user_id (default auth.uid()), mood (text emoji key), emoji (text glyph),
  intensity (int 1-5), note, tags (text[]), logged_at (timestamptz), created_at
journals:
  id, user_id, title, content, category, is_pinned, created_at, updated_at
sleep:
  id, user_id, hours (numeric), quality (int 1-5), bedtime, wake_time, note, logged_at, created_at
goals:
  id, user_id, title, description, target_count, current_count, unit, status, due_date, created_at, updated_at
posts:
  id, user_id, author_name, author_avatar, title, content, mood, likes (int), created_at

4. Security
- RLS enabled on ALL tables.
- Owner-scoped CRUD on profiles, moods, journals, sleep, goals (auth.uid() = user_id).
- Posts: SELECT open to authenticated (community feed), INSERT/UPDATE/DELETE owner-only.
- Every owner table has user_id DEFAULT auth.uid() so inserts omitting user_id still pass WITH CHECK.
- Trigger auto-creates a profile row when a new auth.users row is inserted.

5. Indexes
- moods(user_id, logged_at desc), journals(user_id, created_at desc),
  sleep(user_id, logged_at desc), goals(user_id), posts(created_at desc)
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  theme_preference text DEFAULT 'dark',
  notification_enabled boolean DEFAULT true,
  privacy_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- MOODS
CREATE TABLE IF NOT EXISTS moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mood text NOT NULL,
  emoji text NOT NULL,
  intensity int NOT NULL DEFAULT 3 CHECK (intensity BETWEEN 1 AND 5),
  note text DEFAULT '',
  tags text[] DEFAULT '{}',
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_moods_user_logged ON moods(user_id, logged_at DESC);

DROP POLICY IF EXISTS "select_own_moods" ON moods;
CREATE POLICY "select_own_moods" ON moods FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_moods" ON moods;
CREATE POLICY "insert_own_moods" ON moods FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_moods" ON moods;
CREATE POLICY "update_own_moods" ON moods FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_moods" ON moods;
CREATE POLICY "delete_own_moods" ON moods FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- JOURNALS
CREATE TABLE IF NOT EXISTS journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Untitled',
  content text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Personal',
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_journals_user_created ON journals(user_id, created_at DESC);

DROP POLICY IF EXISTS "select_own_journals" ON journals;
CREATE POLICY "select_own_journals" ON journals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_journals" ON journals;
CREATE POLICY "insert_own_journals" ON journals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_journals" ON journals;
CREATE POLICY "update_own_journals" ON journals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_journals" ON journals;
CREATE POLICY "delete_own_journals" ON journals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- SLEEP
CREATE TABLE IF NOT EXISTS sleep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  hours numeric(4,1) NOT NULL DEFAULT 7.0,
  quality int NOT NULL DEFAULT 3 CHECK (quality BETWEEN 1 AND 5),
  bedtime timestamptz,
  wake_time timestamptz,
  note text DEFAULT '',
  logged_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE sleep ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_sleep_user_logged ON sleep(user_id, logged_at DESC);

DROP POLICY IF EXISTS "select_own_sleep" ON sleep;
CREATE POLICY "select_own_sleep" ON sleep FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sleep" ON sleep;
CREATE POLICY "insert_own_sleep" ON sleep FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sleep" ON sleep;
CREATE POLICY "update_own_sleep" ON sleep FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sleep" ON sleep;
CREATE POLICY "delete_own_sleep" ON sleep FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- GOALS
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  target_count int NOT NULL DEFAULT 7,
  current_count int NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'days',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);

DROP POLICY IF EXISTS "select_own_goals" ON goals;
CREATE POLICY "select_own_goals" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_goals" ON goals;
CREATE POLICY "insert_own_goals" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_goals" ON goals;
CREATE POLICY "update_own_goals" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_goals" ON goals;
CREATE POLICY "delete_own_goals" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- POSTS (community feed)
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Anonymous',
  author_avatar text,
  title text NOT NULL DEFAULT '',
  content text NOT NULL,
  mood text,
  likes int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Community posts are readable by all authenticated users
DROP POLICY IF EXISTS "select_all_posts" ON posts;
CREATE POLICY "select_all_posts" ON posts FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_posts" ON posts;
CREATE POLICY "insert_own_posts" ON posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_posts" ON posts;
CREATE POLICY "update_own_posts" ON posts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_posts" ON posts;
CREATE POLICY "delete_own_posts" ON posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
