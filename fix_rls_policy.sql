-- Add a policy that allows the service role to bypass all RLS restrictions
-- This should be run in the Supabase SQL editor
-- Policy for profiles table to allow service_role to do anything
CREATE POLICY "Service role can do anything" ON public.profiles USING (auth.jwt() ->> 'role' = 'service_role');

-- Alternative approach - create a specific policy for inserting profiles
-- This allows a user to create their own profile even if the JWT doesn't match
CREATE POLICY "Allow profile creation during signup" ON public.profiles FOR
INSERT
    WITH CHECK (true);

-- If the above doesn't work, you can temporarily disable RLS for troubleshooting
-- WARNING: Only do this temporarily for testing, and enable it back afterwards
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- After testing is complete, re-enable RLS:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;