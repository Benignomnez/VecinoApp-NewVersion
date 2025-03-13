// Script to manually create a profile for the current user
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Your Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Please provide NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY as environment variables');
    process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Credentials loaded successfully');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Manually create a profile
async function createProfile() {
    try {
        // This is a sample user ID - replace with your actual user ID from the browser console
        // You can get it by running console.log(auth.currentUser.id) in the browser console
        const userId = process.argv[2];

        if (!userId) {
            console.error('Please provide a user ID as an argument');
            console.log('Usage: node create-profile.js USER_ID');
            process.exit(1);
        }

        console.log(`Creating profile for user ID: ${userId}`);

        // Insert a new profile
        const { data, error } = await supabase
            .from('profiles')
            .insert([
                {
                    id: userId,
                    full_name: 'New User',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select();

        if (error) {
            console.error('Error creating profile:', error);
            process.exit(1);
        }

        console.log('Profile created successfully:', data);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createProfile(); 