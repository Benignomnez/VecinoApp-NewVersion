-- This SQL file contains the definition for a Postgres function that can be run in Supabase
-- to create a new profile while bypassing Row Level Security (RLS) policies.
-- Create a function that can be called from the client-side to create a profile
CREATE
OR REPLACE FUNCTION public.create_profile(
    user_id uuid,
    user_full_name text,
    user_created_at timestamptz DEFAULT now(),
    user_updated_at timestamptz DEFAULT now()
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER -- This makes the function run with the privileges of the creator
SET
    search_path = public AS $ $ DECLARE profile_record jsonb;

BEGIN -- Insert the profile into the profiles table
INSERT INTO
    public.profiles (id, full_name, created_at, updated_at)
VALUES
    (
        user_id,
        user_full_name,
        user_created_at,
        user_updated_at
    ) ON CONFLICT (id) DO
UPDATE
SET
    full_name = EXCLUDED.full_name,
    updated_at = EXCLUDED.updated_at RETURNING to_jsonb(profiles.*) INTO profile_record;

-- Return the created profile as JSON
RETURN profile_record;

END;

$ $;

-- Ensure the function can be executed by authenticated users
GRANT EXECUTE ON FUNCTION public.create_profile(uuid, text, timestamptz, timestamptz) TO authenticated;

GRANT EXECUTE ON FUNCTION public.create_profile(uuid, text, timestamptz, timestamptz) TO anon;

GRANT EXECUTE ON FUNCTION public.create_profile(uuid, text, timestamptz, timestamptz) TO service_role;