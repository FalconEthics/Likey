-- Simple Mock Data for Likey Social Media Platform
-- This creates posts and content using your existing user profile

-- First, let's get your current user ID (replace this with your actual user ID from profiles table)
-- You can find your user ID by running: SELECT id FROM profiles LIMIT 1;

-- Create some sample posts from your account to populate the feed
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from the profiles table

DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the first user ID from profiles table (your account)
    SELECT id INTO user_uuid FROM public.profiles LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Insert sample posts from your account
        INSERT INTO public.posts (id, user_id, caption, image_urls, likes_count, comments_count) VALUES
        ('sample-post-001', user_uuid, '🚀 Welcome to Likey! This is my first post on this amazing platform. Excited to connect with everyone and share some great content!', '["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop"]', 15, 3),
        ('sample-post-002', user_uuid, 'Beautiful sunset today! Sometimes you just need to pause and appreciate the simple moments in life ✨', '["https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop"]', 28, 5),
        ('sample-post-003', user_uuid, 'Coffee and code - the perfect combination for a productive morning ☕💻 What''s your favorite coding setup?', '["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"]', 42, 8),
        ('sample-post-004', user_uuid, 'Just finished reading an amazing book on software architecture. The insights on scalable systems were mind-blowing! 📚', NULL, 19, 4),
        ('sample-post-005', user_uuid, 'Weekend vibes! Taking a break from screens to enjoy nature. Work-life balance is so important 🌳', '["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop"]', 35, 7),
        ('sample-post-006', user_uuid, 'Learned something new today: the difference between async/await and promises in JavaScript. Always growing! 🧠', NULL, 23, 6),
        ('sample-post-007', user_uuid, 'Amazing food at this local restaurant! Supporting small businesses is always worth it 🍜', '["https://images.unsplash.com/photo-1563379091339-03246963d4d6?w=800&h=600&fit=crop"]', 31, 9),
        ('sample-post-008', user_uuid, 'Working on a new project that I''m really excited about. Can''t wait to share more details soon! 🔧', '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"]', 47, 12);
        
        -- Add some sample comments to your posts
        INSERT INTO public.comments (id, post_id, user_id, content) VALUES
        ('sample-comment-001', 'sample-post-001', user_uuid, 'Thanks for building this platform! Looking forward to using it.'),
        ('sample-comment-002', 'sample-post-003', user_uuid, 'My setup is similar! VS Code with a dark theme.'),
        ('sample-comment-003', 'sample-post-005', user_uuid, 'Nature walks are the best for clearing your mind!'),
        ('sample-comment-004', 'sample-post-007', user_uuid, 'That place looks amazing! What''s the name?'),
        ('sample-comment-005', 'sample-post-008', user_uuid, 'Can''t wait to see what you''re building!');
        
        -- Add some sample likes to your posts
        INSERT INTO public.likes (post_id, user_id) VALUES
        ('sample-post-001', user_uuid),
        ('sample-post-002', user_uuid),
        ('sample-post-003', user_uuid);
        
        -- Update your post counts
        UPDATE public.profiles 
        SET posts_count = (SELECT COUNT(*) FROM public.posts WHERE user_id = user_uuid)
        WHERE id = user_uuid;
        
        -- Update likes and comments counts on posts
        UPDATE public.posts SET 
            likes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = posts.id),
            comments_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = posts.id)
        WHERE user_id = user_uuid;
        
        RAISE NOTICE 'Sample posts created successfully for user: %', user_uuid;
    ELSE
        RAISE NOTICE 'No users found in profiles table. Please create a profile first.';
    END IF;
END $$;

-- Create some trending posts data
INSERT INTO public.trending_posts (post_id, score) 
SELECT id, (RANDOM() * 30 + 20)::numeric(5,1) 
FROM public.posts 
WHERE id LIKE 'sample-post-%'
ON CONFLICT (post_id) DO NOTHING;

SELECT 'Mock data created successfully! 🎉' as message,
       COUNT(*) as posts_created
FROM public.posts 
WHERE id LIKE 'sample-post-%';