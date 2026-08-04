/*
# Fix security issues: public bucket listing + trigger function exposure

1. Public bucket allows listing (avatars)
The `avatars` bucket is public, so object URLs (used in <img> tags for
community avatars) are served directly without any RLS policy. The broad
SELECT policy `public_read_avatars` on storage.objects allowed any client
to LIST all files in the bucket via the storage API, exposing more metadata
than intended. We drop it — public URL access still works for public buckets.

2. SECURITY DEFINER function executable by anon / authenticated
`public.handle_new_user()` is a trigger function that auto-creates a profile
row when a new auth.users row is inserted. It must only be invoked by the
`on_auth_user_created` trigger, never via the REST RPC endpoint. We revoke
EXECUTE from anon, authenticated, and public so /rest/v1/rpc/handle_new_user
returns 403/permission-denied. The trigger still fires correctly because
trigger invocation does not require caller EXECUTE permission and the
function runs as its owner (SECURITY DEFINER).

No data is lost; no tables or columns are dropped. Only policies and grants
are adjusted.
*/

-- 1. Remove the broad SELECT that allowed listing all avatars
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;

-- 2. Revoke direct RPC execution of the trigger function from all client roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public;
