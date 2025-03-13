// Script to manually create a profile for the current user
const { createClient } = require('@supabase/supabase-js');

// Your Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as environment variables');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function createProfile() {
    console.log('Creating a new profile...');

    try {
        // Get the current user session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        if (!session || !session.user) {
            console.error('No authenticated user found. Please sign in first.');
            process.exit(1);
        }

        console.log(`Found authenticated user: ${session.user.email}`);

        // Check if profile already exists
        const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
        }

        if (existingProfile) {
            console.log('Profile already exists:', existingProfile);
            return;
        }

        // Create new profile
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: session.user.id,
                    full_name: session.user.user_metadata.full_name || session.user.email,
                    avatar_url: session.user.user_metadata.avatar_url,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select();

        if (error) {
            throw error;
        }

        console.log('Profile created successfully:', data);
    } catch (error) {
        console.error('Error creating profile:', error);
    }
}

createProfile(); 