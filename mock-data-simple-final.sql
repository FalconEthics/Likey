-- Simple Mock Data for Likey Social Media Platform
-- Creates posts from your existing account to populate the feed

DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get the current user ID (your profile)
    SELECT id INTO current_user_id FROM public.profiles LIMIT 1;
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'No user profile found. Please create your profile first through the app.';
    END IF;

    -- Create diverse mock posts from your account to populate the feed
    INSERT INTO public.posts (user_id, caption, image_urls) VALUES
    -- Tech/Programming posts
    (current_user_id, '🚀 Just deployed our new AI-powered code review tool! It''s catching bugs that even senior developers miss. The future of coding is here - AI as a pair programming partner. What are your thoughts on AI assistance in development?', 
     ARRAY['https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop']),
    
    (current_user_id, 'Clean code is not written by following a set of rules. Clean code is written by developers who care. Here''s my current setup for maximum productivity 💻✨ What does your development environment look like?', 
     ARRAY['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop']),
     
    (current_user_id, 'Hot take: The best developers spend more time thinking than coding 🤔 Planning and architecture save more time than any framework or tool ever will. Thoughts?', 
     ARRAY[]::TEXT[]),
     
    -- Design/Creative posts  
    (current_user_id, 'The best designs are invisible. Users should never have to think about how to use your interface. Here''s a before/after of our latest UX improvement 🎨 Small changes, big impact!', 
     ARRAY['https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop']),
     
    (current_user_id, 'Color psychology in action! Changed our CTA button from blue to orange and saw a 23% increase in conversions. It''s amazing how small details can drive such significant results 📈', 
     ARRAY['https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&h=600&fit=crop']),
     
    -- Lifestyle/Personal posts
    (current_user_id, 'Beautiful sunset today! Sometimes you just need to pause and appreciate the simple moments in life ✨ Taking breaks from screens is so important for mental health.', 
     ARRAY['https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop']),
     
    (current_user_id, 'Coffee and code - the perfect combination for a productive morning ☕💻 Currently working on something exciting that I can''t wait to share. What''s your ideal work setup?', 
     ARRAY['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop']),
     
    -- Professional/Business posts
    (current_user_id, 'Learned something new today: the difference between async/await and promises in JavaScript. The learning never stops in tech! 🧠 Always growing and improving.', 
     ARRAY[]::TEXT[]),
     
    (current_user_id, 'Working on a new project that I''m really excited about. Can''t share all the details yet, but it involves some cutting-edge technology 🔧 Stay tuned for updates!', 
     ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop']),
     
    (current_user_id, 'Amazing food at this local restaurant! Supporting small businesses is always worth it 🍜 The community connections we make through food are irreplaceable.', 
     ARRAY['https://images.unsplash.com/photo-1563379091339-03246963d4d6?w=800&h=600&fit=crop']);

    -- Update your profile post count
    UPDATE public.profiles 
    SET posts_count = (SELECT COUNT(*) FROM public.posts WHERE user_id = current_user_id)
    WHERE id = current_user_id;

    RAISE NOTICE 'Mock data created successfully! 🎉';
    RAISE NOTICE 'Created % posts for your feed', (SELECT COUNT(*) FROM public.posts WHERE user_id = current_user_id);
    RAISE NOTICE 'Your feed now has engaging content to explore!';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating mock data: %', SQLERRM;
    RAISE NOTICE 'Make sure you have a profile created first by completing the signup process.';
END $$;

-- Create suggested follows table for user recommendations
CREATE TABLE IF NOT EXISTS public.suggested_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_pic_url TEXT,
    category VARCHAR(50),
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert suggested follow recommendations (accounts users might want to follow)
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
('devops_mike', 'Mike Johnson', 'DevOps engineer automating the world one pipeline at a time. AWS & Kubernetes expert sharing infrastructure tips.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop', 'Technology', 750);

SELECT 'Setup complete! 🎉' as status,
       'Your feed now has ' || (SELECT COUNT(*) FROM public.posts WHERE user_id = (SELECT id FROM public.profiles LIMIT 1)) || ' posts' as feed_status,
       'Plus ' || (SELECT COUNT(*) FROM public.suggested_follows) || ' suggested accounts for new users to follow' as recommendations;