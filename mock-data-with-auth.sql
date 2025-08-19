-- Mock Data with Auth Users for Likey Social Media Platform
-- This creates actual auth users and then populates profiles and posts

-- First, we need to create a function that can create auth users
-- Note: This function requires admin privileges and may need to be run differently

-- Create mock users using Supabase's auth.users table
-- WARNING: This directly manipulates auth.users which should normally be done through Supabase Auth API
-- This is for development/testing purposes only

DO $$
DECLARE
    user1_id UUID := '550e8400-e29b-41d4-a716-446655440001';
    user2_id UUID := '550e8400-e29b-41d4-a716-446655440002';
    user3_id UUID := '550e8400-e29b-41d4-a716-446655440003';
    user4_id UUID := '550e8400-e29b-41d4-a716-446655440004';
    user5_id UUID := '550e8400-e29b-41d4-a716-446655440005';
BEGIN
    -- Insert mock auth users (this might require special permissions)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, 
        email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
        is_super_admin, created_at, updated_at, phone, phone_confirmed_at,
        phone_change, phone_change_token, phone_change_sent_at, confirmed_at,
        email_change_token_current, email_change_confirm_status, banned_until,
        reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at
    ) VALUES 
    (
        user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'techguru@example.com', '$2a$10$K8c9bC.k5VJ8X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X',
        NOW(), NULL, '', NOW(), '', NOW(), '', '', NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"techguru","display_name":"Alex Chen"}',
        FALSE, NOW(), NOW(), NULL, NULL, '', '', NOW(), NOW(), '', 0, NULL, '', NOW(), FALSE, NULL
    ),
    (
        user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'codewithsarah@example.com', '$2a$10$K8c9bC.k5VJ8X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X',
        NOW(), NULL, '', NOW(), '', NOW(), '', '', NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"codewithsarah","display_name":"Sarah Martinez"}',
        FALSE, NOW(), NOW(), NULL, NULL, '', '', NOW(), NOW(), '', 0, NULL, '', NOW(), FALSE, NULL
    ),
    (
        user3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'designlover@example.com', '$2a$10$K8c9bC.k5VJ8X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X',
        NOW(), NULL, '', NOW(), '', NOW(), '', '', NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"designlover","display_name":"Emma Wilson"}',
        FALSE, NOW(), NOW(), NULL, NULL, '', '', NOW(), NOW(), '', 0, NULL, '', NOW(), FALSE, NULL
    ),
    (
        user4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'wanderlust@example.com', '$2a$10$K8c9bC.k5VJ8X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X',
        NOW(), NULL, '', NOW(), '', NOW(), '', '', NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"wanderlust_anna","display_name":"Anna Thompson"}',
        FALSE, NOW(), NOW(), NULL, NULL, '', '', NOW(), NOW(), '', 0, NULL, '', NOW(), FALSE, NULL
    ),
    (
        user5_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'startup@example.com', '$2a$10$K8c9bC.k5VJ8X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X',
        NOW(), NULL, '', NOW(), '', NOW(), '', '', NOW(), NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"username":"startup_founder","display_name":"Rachel Kim"}',
        FALSE, NOW(), NOW(), NULL, NULL, '', '', NOW(), NOW(), '', 0, NULL, '', NOW(), FALSE, NULL
    )
    ON CONFLICT (id) DO NOTHING;

    -- Now create profiles for these users
    INSERT INTO public.profiles (id, username, display_name, bio, profile_pic_url) VALUES
    (user1_id, 'techguru', 'Alex Chen', 'Full-stack developer sharing coding tips and tech insights. Currently building AI applications.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'),
    (user2_id, 'codewithsarah', 'Sarah Martinez', 'Frontend engineer | React & Vue.js enthusiast | Building beautiful user experiences', 'https://images.unsplash.com/photo-1494790108755-2616b9f3c8f5?w=150&h=150&fit=crop&crop=face'),
    (user3_id, 'designlover', 'Emma Wilson', 'UI/UX Designer creating intuitive and beautiful digital experiences. Figma enthusiast.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'),
    (user4_id, 'wanderlust_anna', 'Anna Thompson', 'Digital nomad exploring the world one city at a time. Currently in Bali 🌴', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'),
    (user5_id, 'startup_founder', 'Rachel Kim', 'Building the next unicorn 🦄 | Sharing startup journey and entrepreneurship tips', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face')
    ON CONFLICT (id) DO NOTHING;

    -- Create posts for these users (note: using image_urls array as required by schema)
    INSERT INTO public.posts (id, user_id, caption, image_urls) VALUES
    ('post-001', user1_id, '🚀 Just deployed our new AI-powered code review tool! It''s been catching bugs that even senior developers miss. The future of coding is here. What do you think about AI assistance in development?', ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop']),
    ('post-002', user2_id, 'Clean code is not written by following a set of rules. Clean code is written by developers who care. Here''s my setup for maximum productivity 💻✨', ARRAY['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop']),
    ('post-003', user3_id, 'The best designs are invisible. Users should never have to think about how to use your interface. Here''s a before/after of our latest UX improvement 🎨', ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop']),
    ('post-004', user4_id, 'Bali mornings hit different ☀️ Working from this co-working space with an ocean view. Sometimes I can''t believe this is my office! Digital nomad life is challenging but so rewarding.', ARRAY['https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&h=600&fit=crop']),
    ('post-005', user5_id, 'Failure is not the opposite of success, it''s part of success 💪 Our third pivot finally got us product-market fit. Here''s what we learned from 2 years of "failures"...', ARRAY['https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop']),
    ('post-006', user1_id, 'Hot take: The best developers spend more time thinking than coding 🤔 Planning and architecture save more time than any framework or tool ever will.', ARRAY[]::TEXT[]),
    ('post-007', user2_id, 'Just discovered this amazing new CSS feature! Grid subgrid is finally here and it''s a game changer for complex layouts 🎉', ARRAY['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop']),
    ('post-008', user3_id, 'Color psychology in action! Changed our CTA button from blue to orange and saw a 23% increase in conversions. Small details, big impact! 🎨', ARRAY['https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&h=600&fit=crop']),
    ('post-009', user4_id, 'Living out of a backpack for 6 months taught me that happiness doesn''t come from things you own, but experiences you collect 🎒✈️', ARRAY['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop']),
    ('post-010', user5_id, 'Just raised our Series A! 🎉 18 months from idea to $5M funding. Here''s the pitch deck that convinced investors (template in comments)', ARRAY['https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop'])
    ON CONFLICT (id) DO NOTHING;

    -- Create some follow relationships
    INSERT INTO public.follows (follower_id, following_id) VALUES
    (user1_id, user2_id), (user1_id, user3_id), (user1_id, user5_id),
    (user2_id, user1_id), (user2_id, user3_id), (user2_id, user4_id),
    (user3_id, user1_id), (user3_id, user4_id), (user3_id, user5_id),
    (user4_id, user2_id), (user4_id, user3_id), (user4_id, user5_id),
    (user5_id, user1_id), (user5_id, user2_id), (user5_id, user4_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    -- Add some likes
    INSERT INTO public.likes (user_id, post_id) VALUES
    (user2_id, 'post-001'), (user3_id, 'post-001'), (user5_id, 'post-001'),
    (user1_id, 'post-002'), (user3_id, 'post-002'), (user4_id, 'post-002'),
    (user1_id, 'post-003'), (user2_id, 'post-003'), (user5_id, 'post-003'),
    (user2_id, 'post-004'), (user3_id, 'post-004'), (user5_id, 'post-004'),
    (user1_id, 'post-005'), (user3_id, 'post-005'), (user4_id, 'post-005')
    ON CONFLICT (user_id, post_id) DO NOTHING;

    -- Add some comments
    INSERT INTO public.comments (id, user_id, post_id, content) VALUES
    ('comment-001', user2_id, 'post-001', 'This is game-changing! How''s the accuracy compared to manual reviews?'),
    ('comment-002', user3_id, 'post-001', 'Been waiting for something like this. Is it open source?'),
    ('comment-003', user1_id, 'post-003', 'The before/after difference is incredible! UX matters so much.'),
    ('comment-004', user5_id, 'post-004', 'Bali is amazing! Which co-working space is this?'),
    ('comment-005', user1_id, 'post-005', 'Resilience is everything in startups. Congrats on finding PMF!'),
    ('comment-006', user4_id, 'post-010', 'Congrats! The pitch deck would be incredibly valuable to see.'),
    ('comment-007', user2_id, 'post-008', 'Your design insights are always spot on! Love following your work.'),
    ('comment-008', user3_id, 'post-009', 'This is exactly why I want to try the nomad lifestyle. Inspiring!')
    ON CONFLICT (id) DO NOTHING;

    -- Add trending posts
    INSERT INTO public.trending_posts (post_id, score) VALUES
    ('post-010', 95.5), ('post-004', 87.2), ('post-005', 82.1),
    ('post-001', 78.9), ('post-003', 75.3), ('post-009', 71.8),
    ('post-008', 68.4), ('post-002', 65.7), ('post-007', 62.1), ('post-006', 58.9)
    ON CONFLICT (post_id) DO NOTHING;

    RAISE NOTICE 'Mock data created successfully! 🎉';
    RAISE NOTICE 'Created % profiles with posts and relationships', (SELECT COUNT(*) FROM public.profiles WHERE id IN (user1_id, user2_id, user3_id, user4_id, user5_id));

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating mock data: %', SQLERRM;
    RAISE NOTICE 'This might be because direct auth.users manipulation requires admin privileges.';
    RAISE NOTICE 'Try running the simpler mock-data-simple.sql instead.';
END $$;