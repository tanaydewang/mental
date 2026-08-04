/*
# Storage policies for avatars bucket

1. Overview
Allows authenticated users to upload, read, and manage their own avatar
in the public `avatars` storage bucket.

2. Security
- SELECT (read): public — avatars are displayed in community feed, so anyone can read.
- INSERT/UPDATE/DELETE: owner only — files are stored under `avatars/<user_id>.<ext>`,
  so the policy checks that the file path starts with the user's id.
*/

DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
CREATE POLICY "public_read_avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "insert_own_avatars" ON storage.objects;
CREATE POLICY "insert_own_avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "update_own_avatars" ON storage.objects;
CREATE POLICY "update_own_avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "delete_own_avatars" ON storage.objects;
CREATE POLICY "delete_own_avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
