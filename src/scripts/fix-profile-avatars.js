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

async function fixProfileAvatars() {
    console.log('Fixing profile avatars...');

    try {
        // Get all profiles
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*');

        if (error) {
            throw error;
        }

        console.log(`Found ${profiles.length} profiles`);

        // Check each profile
        for (const profile of profiles) {
            const { id, avatar_url } = profile;

            // If avatar URL exists but uses old bucket name or format
            if (avatar_url && (avatar_url.includes('/avatars/') || !avatar_url.includes('/profiles/'))) {
                console.log(`Fixing avatar URL for user ${id}`);
                console.log(`Current URL: ${avatar_url}`);

                // Get the file name from the URL
                const fileName = avatar_url.split('/').pop();

                // Generate new URL with the proper bucket name
                const { data: { publicUrl } } = supabase
                    .storage
                    .from('profiles')
                    .getPublicUrl(fileName);

                console.log(`New URL: ${publicUrl}`);

                // Update the profile with the new URL
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', id);

                if (updateError) {
                    console.error(`Error updating profile ${id}:`, updateError);
                } else {
                    console.log(`Profile ${id} updated successfully`);
                }
            } else if (!avatar_url) {
                console.log(`Profile ${id} has no avatar URL`);
            } else {
                console.log(`Profile ${id} already has correct URL format: ${avatar_url}`);
            }
        }

        console.log('Done fixing profile avatars');
    } catch (error) {
        console.error('Error:', error);
    }
}

fixProfileAvatars(); 