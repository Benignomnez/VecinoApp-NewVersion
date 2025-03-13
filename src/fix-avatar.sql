-- SQL script to fix avatar URLs in profiles table
-- This replaces 'avatars' with 'profiles' in the bucket URLs
-- Update all avatar_url values that contain 'avatars' in the URL
UPDATE
    profiles
SET
    avatar_url = REPLACE(avatar_url, '/avatars/', '/profiles/'),
    updated_at = NOW()
WHERE
    avatar_url LIKE '%/avatars/%';

-- If you have any URLs with storage.googleapis.com, you can update those too
-- UPDATE profiles 
-- SET 
--   avatar_url = REPLACE(avatar_url, 'storage.googleapis.com/avatars', 'storage.googleapis.com/profiles'),
--   updated_at = NOW()
-- WHERE 
--   avatar_url LIKE '%storage.googleapis.com/avatars%';
-- Show the updated profiles
SELECT
    id,
    avatar_url
FROM
    profiles
WHERE
    avatar_url IS NOT NULL;