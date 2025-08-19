-- Final Mock Data for Likey Social Media Platform
-- This approach creates mock posts from your existing account and adds recommendations

DO $$
DECLARE
    current_user_id UUID;
    mock_post_1 UUID := gen_random_uuid();
    mock_post_2 UUID := gen_random_uuid();
    mock_post_3 UUID := gen_random_uuid();
    mock_post_4 UUID := gen_random_uuid();
    mock_post_5 UUID := gen_random_uuid();
    mock_post_6 UUID := gen_random_uuid();
    mock_post_7 UUID := gen_random_uuid();
    mock_post_8 UUID := gen_random_uuid();
    mock_post_9 UUID := gen_random_uuid();
    mock_post_10 UUID := gen_random_uuid();
BEGIN
    -- Get the current user ID (your profile)
    SELECT id INTO current_user_id FROM public.profiles LIMIT 1;
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No user profile found. Please create your profile first through the app.';
    END IF;

    -- Create diverse mock posts from your account to populate the feed
    INSERT INTO public.posts (id, user_id, caption, image_urls) VALUES
    -- Tech/Programming posts
    (mock_post_1, current_user_id, '🚀 Just deployed our new AI-powered code review tool! It''s catching bugs that even senior developers miss. The future of coding is here - AI as a pair programming partner. What are your thoughts on AI assistance in development?', 
     ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop']),
    
    (mock_post_2, current_user_id, 'Clean code is not written by following a set of rules. Clean code is written by developers who care. Here''s my current setup for maximum productivity 💻✨ What does your development environment look like?', 
     ARRAY['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop']),
     
    (mock_post_3, current_user_id, 'Hot take: The best developers spend more time thinking than coding 🤔 Planning and architecture save more time than any framework or tool ever will. Thoughts?', 
     ARRAY[]::TEXT[]),
     
    -- Design/Creative posts  
    (mock_post_4, current_user_id, 'The best designs are invisible. Users should never have to think about how to use your interface. Here''s a before/after of our latest UX improvement 🎨 Small changes, big impact!', 
     ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop']),
     
    (mock_post_5, current_user_id, 'Color psychology in action! Changed our CTA button from blue to orange and saw a 23% increase in conversions. It''s amazing how small details can drive such significant results 📈', 
     ARRAY['https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&h=600&fit=crop']),
     
    -- Lifestyle/Personal posts
    (mock_post_6, current_user_id, 'Beautiful sunset today! Sometimes you just need to pause and appreciate the simple moments in life ✨ Taking breaks from screens is so important for mental health.', 
     ARRAY['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop']),
     
    (mock_post_7, current_user_id, 'Coffee and code - the perfect combination for a productive morning ☕💻 Currently working on something exciting that I can''t wait to share. What''s your ideal work setup?', 
     ARRAY['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop']),
     
    -- Professional/Business posts
    (mock_post_8, current_user_id, 'Learned something new today: the difference between async/await and promises in JavaScript. The learning never stops in tech! 🧠 Always growing and improving.', 
     ARRAY[]::TEXT[]),
     
    (mock_post_9, current_user_id, 'Working on a new project that I''m really excited about. Can''t share all the details yet, but it involves some cutting-edge technology 🔧 Stay tuned for updates!', 
     ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop']),
     
    (mock_post_10, current_user_id, 'Amazing food at this local restaurant! Supporting small businesses is always worth it 🍜 The community connections we make through food are irreplaceable.', 
     ARRAY['https://images.unsplash.com/photo-1563379091339-03246963d4d6?w=800&h=600&fit=crop'])
;

    -- Add some mock comments to make posts feel more engaging
    INSERT INTO public.comments (id, user_id, post_id, content) VALUES
    (gen_random_uuid(), current_user_id, mock_post_1, 'The AI revolution in coding is fascinating! Would love to see a demo.'),
    (gen_random_uuid(), current_user_id, mock_post_2, 'Clean code principles never go out of style. Great setup!'),
    (gen_random_uuid(), current_user_id, mock_post_4, 'UX improvements like this make such a difference. Users really notice!'),
    (gen_random_uuid(), current_user_id, mock_post_6, 'Beautiful shot! Nature breaks are essential for creativity.'),
    (gen_random_uuid(), current_user_id, mock_post_9, 'Excited to see what you''re building! Innovation never stops.'),
    (gen_random_uuid(), current_user_id, mock_post_10, 'Local restaurants are the heart of the community. Great choice!')
;

    -- Add some mock likes to your posts
    INSERT INTO public.likes (user_id, post_id) VALUES
    (current_user_id, mock_post_1),
    (current_user_id, mock_post_3),
    (current_user_id, mock_post_5),
    (current_user_id, mock_post_7),
    (current_user_id, mock_post_9)
    ON CONFLICT (user_id, post_id) DO NOTHING;

    -- Create trending posts data
    INSERT INTO public.trending_posts (post_id, score) VALUES
    (mock_post_1, 95.5),   -- AI tool post
    (mock_post_4, 87.2),   -- UX design post  
    (mock_post_5, 82.1),   -- Color psychology post
    (mock_post_9, 78.9),   -- New project post
    (mock_post_2, 75.3),   -- Clean code post
    (mock_post_7, 71.8),   -- Coffee and code post
    (mock_post_10, 68.4),  -- Food post
    (mock_post_6, 65.7),   -- Sunset post
    (mock_post_8, 62.1),   -- Learning post
    (mock_post_3, 58.9)    -- Hot take post
    ON CONFLICT (post_id) DO NOTHING;

    -- Create user recommendations (suggesting some popular usernames to follow)
    -- These are placeholder recommendations that would normally come from an algorithm
    INSERT INTO public.user_recommendations (user_id, recommended_user_id, reason, score) VALUES
    -- Since we only have one real user, we'll create recommendations that point to potential future users
    -- This prepares the system for when more users join
    (current_user_id, current_user_id, 'Popular in Tech', 85)  -- Self-reference as example
    ON CONFLICT (user_id, recommended_user_id) DO NOTHING;

    -- Update your profile counts
    UPDATE public.profiles 
    SET 
        posts_count = (SELECT COUNT(*) FROM public.posts WHERE user_id = current_user_id),
        followers_count = GREATEST(followers_count, 0),
        following_count = GREATEST(following_count, 0)
    WHERE id = current_user_id;

    -- Update post counts based on actual data
    UPDATE public.posts SET 
        like_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = posts.id),
        comment_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = posts.id)
    WHERE user_id = current_user_id;

    RAISE NOTICE 'Mock data created successfully! 🎉';
    RAISE NOTICE 'Created % posts for user %', (SELECT COUNT(*) FROM public.posts WHERE user_id = current_user_id), current_user_id;
    RAISE NOTICE 'Your feed now has engaging content to explore!';
    RAISE NOTICE 'Posts include: tech content, design insights, lifestyle moments, and professional updates.';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating mock data: %', SQLERRM;
    RAISE NOTICE 'Make sure you have a profile created first by completing the signup process.';
END $$;

-- Create some sample "recommended users" data that the app can use
-- This table can hold usernames/info for accounts users might want to follow when they join
CREATE TABLE IF NOT EXISTS public.suggested_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_pic_url TEXT,
    category VARCHAR(50),
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert suggested follow recommendations
INSERT INTO public.suggested_follows (username, display_name, bio, profile_pic_url, category, follower_count) VALUES
('techguru_alex', 'Alex Chen', 'Full-stack developer sharing coding tips and AI insights. Building the future one commit at a time.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 'Technology', 1250),
('sarah_codes', 'Sarah Martinez', 'Frontend engineer | React & Vue.js enthusiast | Building beautiful user experiences that users love.', 'https://images.unsplash.com/photo-1494790108755-2616b9f3c8f5?w=150&h=150&fit=crop', 'Technology', 980),
('design_emma', 'Emma Wilson', 'UI/UX Designer creating intuitive digital experiences. Figma expert sharing design tips and trends.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop', 'Design', 1800),
('nomad_anna', 'Anna Thompson', 'Digital nomad exploring the world one city at a time. Currently in Bali 🌴 Sharing travel and remote work tips.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop', 'Travel', 3200),
('startup_rachel', 'Rachel Kim', 'Building the next unicorn 🦄 | Sharing startup journey, fundraising tips, and entrepreneurship insights.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop', 'Business', 4500),
('photographer_jay', 'Jay Patel', 'Street photographer capturing life''s candid moments. Available for portraits and events. Visual storyteller.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop', 'Photography', 2100),
('fitness_lisa', 'Lisa Anderson', 'Certified personal trainer helping you achieve your fitness goals. Motivation + Science = Results 💪', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', 'Fitness', 5200),
('foodie_carlos', 'Carlos Rodriguez', 'Food enthusiast sharing the best eats around the globe. Chef recommendations and hidden gems welcome!', 'https://images.unsplash.com/photo-1507590549488-b8d973c8b6f7?w=150&h=150&fit=crop', 'Food', 1650),
('marketing_david', 'David Liu', 'Digital marketing strategist helping brands grow online. ROI-focused campaigns that actually work.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop', 'Marketing', 2800),
('devops_mike', 'Mike Johnson', 'DevOps engineer automating the world one pipeline at a time. AWS & Kubernetes expert sharing infrastructure tips.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 'Technology', 750)
ON CONFLICT (username) DO NOTHING;

SELECT 'Setup complete! 🎉' as status,
       'Your feed now has ' || (SELECT COUNT(*) FROM public.posts WHERE user_id = (SELECT id FROM public.profiles LIMIT 1)) || ' engaging posts' as feed_status,
       'Plus ' || (SELECT COUNT(*) FROM public.suggested_follows) || ' suggested accounts to follow' as recommendations;