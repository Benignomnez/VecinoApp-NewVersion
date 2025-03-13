-- SQL script to insert a sample profile
-- This will add a profile record to get started with
-- Insert a sample profile
INSERT INTO
    profiles (
        id,
        full_name,
        created_at,
        updated_at
    )
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        -- Replace with your actual user ID
        'Test User',
        NOW(),
        NOW()
    );

-- Display the inserted profile
SELECT
    *
FROM
    profiles;