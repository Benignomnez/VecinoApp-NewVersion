-- Fix schema and relationships in Supabase
-- 1. Make sure the profiles table exists with the correct schema
DO $ $ BEGIN IF NOT EXISTS (
    SELECT
    FROM
        information_schema.tables
    WHERE
        table_schema = 'public'
        AND table_name = 'profiles'
) THEN CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ELSE -- Make sure columns exist
IF NOT EXISTS (
    SELECT
    FROM
        information_schema.columns
    WHERE
        table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'full_name'
) THEN
ALTER TABLE
    public.profiles
ADD
    COLUMN full_name TEXT;

END IF;

IF NOT EXISTS (
    SELECT
    FROM
        information_schema.columns
    WHERE
        table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'avatar_url'
) THEN
ALTER TABLE
    public.profiles
ADD
    COLUMN avatar_url TEXT;

END IF;

IF NOT EXISTS (
    SELECT
    FROM
        information_schema.columns
    WHERE
        table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'created_at'
) THEN
ALTER TABLE
    public.profiles
ADD
    COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

END IF;

IF NOT EXISTS (
    SELECT
    FROM
        information_schema.columns
    WHERE
        table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'updated_at'
) THEN
ALTER TABLE
    public.profiles
ADD
    COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

END IF;

END IF;

END $ $;

-- 2. Make sure the reviews table exists and has proper relationships
DO $ $ BEGIN IF NOT EXISTS (
    SELECT
    FROM
        information_schema.tables
    WHERE
        table_schema = 'public'
        AND table_name = 'reviews'
) THEN CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    content TEXT,
    photos TEXT [],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ELSE -- Make sure the profile_id column exists and has the proper relationship
IF NOT EXISTS (
    SELECT
    FROM
        information_schema.columns
    WHERE
        table_schema = 'public'
        AND table_name = 'reviews'
        AND column_name = 'profile_id'
) THEN
ALTER TABLE
    public.reviews
ADD
    COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ELSE -- Check if foreign key exists, if not add it
IF NOT EXISTS (
    SELECT
    FROM
        information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'reviews'
        AND ccu.column_name = 'profile_id'
) THEN -- Remove any existing constraint on profile_id
DO $ $ DECLARE const_name text;

BEGIN
SELECT
    tc.constraint_name INTO const_name
FROM
    information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE
    tc.table_schema = 'public'
    AND tc.table_name = 'reviews'
    AND ccu.column_name = 'profile_id';

IF FOUND THEN EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT ' || const_name;

END IF;

END $ $;

-- Add the proper foreign key constraint
ALTER TABLE
    public.reviews
ADD
    CONSTRAINT reviews_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

END IF;

END IF;

END IF;

END $ $;

-- 3. Set basic RLS policies that allow all operations (since you removed the RLS files)
ALTER TABLE
    public.profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    public.reviews ENABLE ROW LEVEL SECURITY;

-- Create an open policy for profiles
DROP POLICY IF EXISTS profiles_policy ON public.profiles;

CREATE POLICY profiles_policy ON public.profiles USING (true) WITH CHECK (true);

-- Create an open policy for reviews
DROP POLICY IF EXISTS reviews_policy ON public.reviews;

CREATE POLICY reviews_policy ON public.reviews USING (true) WITH CHECK (true);

-- Grant necessary privileges
GRANT ALL ON public.profiles TO authenticated;

GRANT ALL ON public.reviews TO authenticated;

GRANT ALL ON public.profiles TO anon;

GRANT ALL ON public.reviews TO anon;

GRANT ALL ON public.profiles TO service_role;

GRANT ALL ON public.reviews TO service_role;