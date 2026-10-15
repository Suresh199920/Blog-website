-- ============================================
-- STORAGE BUCKETS + POLICIES (idempotent)
-- ============================================
-- Safe to run more than once: buckets use ON CONFLICT, and each
-- policy is only created when a same-named policy is missing.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('post-covers', 'post-covers', true),
  ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for both buckets.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can read blog images'
  ) THEN
    CREATE POLICY "Public can read blog images"
      ON storage.objects FOR SELECT
      USING (bucket_id IN ('post-covers', 'gallery'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can upload to post-covers'
  ) THEN
    CREATE POLICY "Admins can upload to post-covers"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'post-covers' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can update post-covers'
  ) THEN
    CREATE POLICY "Admins can update post-covers"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'post-covers' AND public.is_admin())
      WITH CHECK (bucket_id = 'post-covers' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can delete from post-covers'
  ) THEN
    CREATE POLICY "Admins can delete from post-covers"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'post-covers' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can upload to gallery'
  ) THEN
    CREATE POLICY "Admins can upload to gallery"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can update gallery'
  ) THEN
    CREATE POLICY "Admins can update gallery"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'gallery' AND public.is_admin())
      WITH CHECK (bucket_id = 'gallery' AND public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Admins can delete from gallery'
  ) THEN
    CREATE POLICY "Admins can delete from gallery"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'gallery' AND public.is_admin());
  END IF;
END $$;