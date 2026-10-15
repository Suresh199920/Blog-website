-- ============================================
-- BLOG WEBSITE DATABASE SCHEMA
-- PostgreSQL / Supabase
-- ============================================
--
-- How to apply:
--   1. Supabase Dashboard -> SQL Editor -> New query
--   2. Paste this whole file and click Run
--   3. Create your admin user: Authentication -> Users -> Add user
--      (set "Auto Confirm User" ON), then run the promote statement
--      printed at the bottom of this file.
--
-- Note: gen_random_uuid() is built into PostgreSQL 13+, so no
-- extension needs to be enabled.

-- ============================================
-- PROFILES & AUTH
-- ============================================
-- One row per auth user, created automatically on signup.
-- `role` drives every write policy in this file: only
-- 'admin' may insert / update / delete content.

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'editor' NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Backfill a profile row whenever a user signs up.
-- SECURITY DEFINER is required: profiles has RLS enabled with no
-- INSERT policy, so an invoker-rights trigger would fail on every
-- signup with "Database error creating new user".
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block a signup because the profile backfill failed.
  RETURN NEW;
END;
$$ language 'plpgsql'
SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ADMIN CHECK HELPER
-- ============================================
-- SECURITY DEFINER + a pinned search_path lets policies read
-- `profiles` without tripping profiles' own RLS (which would
-- otherwise recurse). SECURITY DEFINER is what makes this safe.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================
-- SETTINGS
-- ============================================
-- Site-wide editable text (tagline, about body, social links...)
-- so you can change copy from the admin panel without a deploy.

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO settings (key, value) VALUES
  ('site_title', 'The Blog'),
  ('site_tagline', 'Notes, photos and videos from the field.'),
  ('site_description', 'A personal blog with a photo gallery and a YouTube video library.'),
  ('about_body', 'Tell your story here. Edit this text from Admin -> Settings.'),
  ('contact_email', 'hello@example.com');

-- ============================================
-- BLOG
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO categories (slug, name, sort_order) VALUES
  ('general', 'General', 1),
  ('tutorials', 'Tutorials', 2),
  ('travel', 'Travel', 3),
  ('tech', 'Tech', 4);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  -- Post body, authored as Markdown and rendered on the server.
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  cover_alt TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}' NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published')),
  is_featured BOOLEAN DEFAULT false NOT NULL,
  reading_minutes INTEGER DEFAULT 1 NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- GALLERY
-- ============================================

CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo TEXT,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT,
  caption TEXT,
  image_path TEXT NOT NULL,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- VIDEOS
-- ============================================
-- `youtube_id` is derived from `youtube_url` by the app
-- (src/lib/youtube.ts) so embeds never depend on user-typed HTML.

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_seconds INTEGER,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- CONTACT
-- ============================================

CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_category_id ON posts(category_id);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_sort_order ON photos(sort_order);
CREATE INDEX idx_videos_sort_order ON videos(sort_order);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_contact_messages_is_read ON contact_messages(is_read);

-- Full-text search over post title + excerpt.
CREATE INDEX idx_posts_search ON posts
  USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- ============================================
-- TRIGGERS (auto-update updated_at)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Reading published content is open to everyone.
-- Every write is restricted to is_admin().

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: readable by everyone (public author bylines), writable by admins.
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Admins can update profiles"
  ON profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Settings: readable by everyone, writable by admins.
CREATE POLICY "Settings are publicly readable"
  ON settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Posts: only published rows are public. Drafts stay invisible
-- even to the anon key, so previews can't leak into search.
CREATE POLICY "Published posts are publicly readable"
  ON posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can read all posts including drafts"
  ON posts FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can create posts"
  ON posts FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update posts"
  ON posts FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE
  USING (is_admin());

CREATE POLICY "Albums are publicly readable"
  ON albums FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage albums"
  ON albums FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Photos are publicly readable"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Admins can create photos"
  ON photos FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update photos"
  ON photos FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete photos"
  ON photos FOR DELETE
  USING (is_admin());

CREATE POLICY "Videos are publicly readable"
  ON videos FOR SELECT
  USING (true);

CREATE POLICY "Admins can create videos"
  ON videos FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update videos"
  ON videos FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete videos"
  ON videos FOR DELETE
  USING (is_admin());

-- Contact: anyone may submit, only admins may read.
CREATE POLICY "Anyone can send a contact message"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read messages"
  ON contact_messages FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update messages"
  ON contact_messages FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete messages"
  ON contact_messages FOR DELETE
  USING (is_admin());

-- ============================================
-- STORAGE
-- ============================================
-- Public buckets: served straight from Supabase CDN, so no
-- image-optimization round trip and no storage cost blowout.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('post-covers', 'post-covers', true),
  ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Post covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-covers');

CREATE POLICY "Gallery images are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Admins can upload to post-covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'post-covers' AND is_admin());

CREATE POLICY "Admins can update post-covers"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'post-covers' AND is_admin())
  WITH CHECK (bucket_id = 'post-covers' AND is_admin());

CREATE POLICY "Admins can delete from post-covers"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'post-covers' AND is_admin());

CREATE POLICY "Admins can upload to gallery"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'gallery' AND is_admin());

CREATE POLICY "Admins can update gallery"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'gallery' AND is_admin())
  WITH CHECK (bucket_id = 'gallery' AND is_admin());

CREATE POLICY "Admins can delete from gallery"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'gallery' AND is_admin());

-- ============================================
-- MAKE YOURSELF ADMIN
-- ============================================
-- Create your user first (Authentication -> Users -> Add user),
-- then run the statement below with your real email address.

-- UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';