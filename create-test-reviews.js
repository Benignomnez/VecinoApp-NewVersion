const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestReviews() {
    console.log('Creating test reviews...');
    console.log('Using URL:', supabaseUrl);

    // First, get or create a test profile
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return;
    }

    let profileId;

    if (profiles && profiles.length > 0) {
        profileId = profiles[0].id;
        console.log('Using existing profile:', profileId);
    } else {
        console.log('No profiles found. Please create a user account first.');
        return;
    }

    // Create some test reviews
    const testReviews = [
        {
            profile_id: profileId,
            place_id: 'ChIJvypWkWcrwokR0E7BDpu9Q0w', // Example Google Place ID
            rating: 5,
            content: '¡Excelente servicio y comida deliciosa! Definitivamente regresaré.',
            photos: [],
            created_at: new Date().toISOString()
        },
        {
            profile_id: profileId,
            place_id: 'ChIJQaBOHyAqwokRWp7t0HI0MDA', // Example Google Place ID
            rating: 4,
            content: 'Muy buen ambiente, aunque los precios son un poco elevados.',
            photos: [],
            created_at: new Date().toISOString()
        },
        {
            profile_id: profileId,
            place_id: 'ChIJh2EKvQ4qwokRjkR5xWlZC4s', // Example Google Place ID
            rating: 3,
            content: 'La ubicación es increíble, pero el servicio podría mejorar.',
            photos: [],
            created_at: new Date().toISOString()
        }
    ];

    const { data, error } = await supabase
        .from('reviews')
        .insert(testReviews)
        .select();

    if (error) {
        console.error('Error creating test reviews:', error);
    } else {
        console.log('Successfully created test reviews:', data);
    }
}

createTestReviews()
    .then(() => console.log('Done!'))
    .catch(err => console.error('Error:', err)); 