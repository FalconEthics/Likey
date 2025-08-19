-- Mock Data for Likey Social Media Platform
-- Run this after setting up the main database schema

-- Insert mock profiles (users can follow these)
INSERT INTO public.profiles (id, username, display_name, bio, profile_pic_url, followers_count, following_count, posts_count) VALUES
-- Tech/Programming accounts
('550e8400-e29b-41d4-a716-446655440001', 'techguru', 'Alex Chen', 'Full-stack developer sharing coding tips and tech insights. Currently building AI applications.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 1250, 350, 24),
('550e8400-e29b-41d4-a716-446655440002', 'codewithsarah', 'Sarah Martinez', 'Frontend engineer | React & Vue.js enthusiast | Building beautiful user experiences', 'https://images.unsplash.com/photo-1494790108755-2616b9f3c8f5?w=150&h=150&fit=crop&crop=face', 980, 280, 18),
('550e8400-e29b-41d4-a716-446655440003', 'devops_mike', 'Mike Johnson', 'DevOps engineer automating the world one pipeline at a time. AWS & Kubernetes expert.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', 750, 220, 15),

-- Creative accounts
('550e8400-e29b-41d4-a716-446655440004', 'designlover', 'Emma Wilson', 'UI/UX Designer creating intuitive and beautiful digital experiences. Figma enthusiast.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 1800, 420, 32),
('550e8400-e29b-41d4-a716-446655440005', 'photographer_jay', 'Jay Patel', 'Street photographer capturing life''s candid moments. Available for portraits and events.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 2100, 350, 45),

-- Lifestyle/Travel accounts
('550e8400-e29b-41d4-a716-446655440006', 'wanderlust_anna', 'Anna Thompson', 'Digital nomad exploring the world one city at a time. Currently in Bali 🌴', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face', 3200, 890, 67),
('550e8400-e29b-41d4-a716-446655440007', 'foodie_carlos', 'Carlos Rodriguez', 'Food enthusiast sharing the best eats around the globe. Chef recommendations welcome!', 'https://images.unsplash.com/photo-1507590549488-b8d973c8b6f7?w=150&h=150&fit=crop&crop=face', 1650, 430, 38),

-- Business/Entrepreneurship
('550e8400-e29b-41d4-a716-446655440008', 'startup_founder', 'Rachel Kim', 'Building the next unicorn 🦄 | Sharing startup journey and entrepreneurship tips', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face', 4500, 1200, 89),
('550e8400-e29b-41d4-a716-446655440009', 'marketing_maven', 'David Liu', 'Digital marketing strategist helping brands grow online. ROI-focused campaigns.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face', 2800, 650, 52),

-- Fitness/Health
('550e8400-e29b-41d4-a716-446655440010', 'fitness_coach', 'Lisa Anderson', 'Certified personal trainer helping you achieve your fitness goals. DM for coaching!', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', 5200, 800, 125);

-- Insert mock posts with engaging content
INSERT INTO public.posts (id, user_id, caption, image_urls, likes_count, comments_count) VALUES
-- Tech posts
('post-001', '550e8400-e29b-41d4-a716-446655440001', '🚀 Just deployed our new AI-powered code review tool! It''s been catching bugs that even senior developers miss. The future of coding is here. What do you think about AI assistance in development?', '["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop"]', 234, 45),
('post-002', '550e8400-e29b-41d4-a716-446655440002', 'Clean code is not written by following a set of rules. Clean code is written by developers who care. Here''s my setup for maximum productivity 💻✨', '["https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"]', 189, 32),
('post-003', '550e8400-e29b-41d4-a716-446655440003', 'Infrastructure as Code changed everything for us. Our deployment time went from 2 hours to 5 minutes! Here''s our Terraform setup that saved the day.', '["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop"]', 156, 28),

-- Design posts
('post-004', '550e8400-e29b-41d4-a716-446655440004', 'The best designs are invisible. Users should never have to think about how to use your interface. Here''s a before/after of our latest UX improvement 🎨', '["https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop"]', 445, 67),
('post-005', '550e8400-e29b-41d4-a716-446655440005', 'Golden hour in the city never gets old 📸 Sometimes the best shots happen when you least expect them. Always keep your camera ready!', '["https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&h=600&fit=crop"]', 892, 134),

-- Travel posts
('post-006', '550e8400-e29b-41d4-a716-446655440006', 'Bali mornings hit different ☀️ Working from this co-working space with an ocean view. Sometimes I can''t believe this is my office! Digital nomad life is challenging but so rewarding.', '["https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&h=600&fit=crop"]', 1250, 189),
('post-007', '550e8400-e29b-41d4-a716-446655440007', 'Found this hidden gem in Bangkok 🍜 The best pad thai I''ve ever had! The owner has been perfecting this recipe for 30 years. Sometimes the smallest places have the biggest flavors.', '["https://images.unsplash.com/photo-1563379091339-03246963d4d6?w=800&h=600&fit=crop"]', 678, 95),

-- Business posts
('post-008', '550e8400-e29b-41d4-a716-446655440008', 'Failure is not the opposite of success, it''s part of success 💪 Our third pivot finally got us product-market fit. Here''s what we learned from 2 years of "failures"...', '["https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop"]', 2100, 312),
('post-009', '550e8400-e29b-41d4-a716-446655440009', 'ROI on our latest campaign: 400% 📈 Sometimes the simplest strategies work best. Here''s the exact framework we used to 4x our client''s revenue in 90 days.', '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"]', 567, 89),

-- Fitness posts
('post-010', '550e8400-e29b-41d4-a716-446655440010', 'Consistency beats perfection every time 🏋️‍♀️ This client started with me 6 months ago and couldn''t do a single push-up. Now she''s deadlifting her bodyweight! What''s your fitness goal?', '["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop"]', 1450, 203),

-- More engaging posts
('post-011', '550e8400-e29b-41d4-a716-446655440001', 'Hot take: The best developers spend more time thinking than coding 🤔 Planning and architecture save more time than any framework or tool ever will.', NULL, 334, 78),
('post-012', '550e8400-e29b-41d4-a716-446655440004', 'Color psychology in action! Changed our CTA button from blue to orange and saw a 23% increase in conversions. Small details, big impact! 🎨', '["https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&h=600&fit=crop"]', 523, 91),
('post-013', '550e8400-e29b-41d4-a716-446655440006', 'Living out of a backpack for 6 months taught me that happiness doesn''t come from things you own, but experiences you collect 🎒✈️', '["https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop"]', 2890, 445),
('post-014', '550e8400-e29b-41d4-a716-446655440008', 'Just raised our Series A! 🎉 18 months from idea to $5M funding. Here''s the pitch deck that convinced investors (template in comments)', '["https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=600&fit=crop"]', 3456, 567),
('post-015', '550e8400-e29b-41d4-a716-446655440005', 'Street photography tip: The best moments happen between moments 📷 Always be ready to capture the unexpected!', '["https://images.unsplash.com/photo-1474403590192-0c631e8f3f1b?w=800&h=600&fit=crop"]', 756, 123);

-- Insert some follow relationships to create realistic social connections
INSERT INTO public.follows (follower_id, following_id) VALUES
-- Tech people following each other
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),

-- Creative people following each other
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004'),

-- Cross-category follows
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008'), -- Tech → Business
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006'), -- Design → Travel
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440009'), -- Business → Marketing
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007'), -- Travel → Food
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008'), -- Fitness → Business

-- Everyone follows some popular accounts
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440006'), -- Tech → Travel
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008'), -- Frontend → Business
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010'), -- DevOps → Fitness
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005'), -- Food → Photography
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004'); -- Marketing → Design

-- Insert some likes on posts to make them feel active
INSERT INTO public.likes (post_id, user_id) VALUES
-- Likes on tech posts
('post-001', '550e8400-e29b-41d4-a716-446655440002'),
('post-001', '550e8400-e29b-41d4-a716-446655440003'),
('post-001', '550e8400-e29b-41d4-a716-446655440008'),
('post-002', '550e8400-e29b-41d4-a716-446655440001'),
('post-002', '550e8400-e29b-41d4-a716-446655440004'),

-- Likes on design posts
('post-004', '550e8400-e29b-41d4-a716-446655440001'),
('post-004', '550e8400-e29b-41d4-a716-446655440002'),
('post-004', '550e8400-e29b-41d4-a716-446655440005'),
('post-005', '550e8400-e29b-41d4-a716-446655440004'),
('post-005', '550e8400-e29b-41d4-a716-446655440006'),

-- Likes on travel posts
('post-006', '550e8400-e29b-41d4-a716-446655440007'),
('post-006', '550e8400-e29b-41d4-a716-446655440008'),
('post-006', '550e8400-e29b-41d4-a716-446655440010'),
('post-013', '550e8400-e29b-41d4-a716-446655440005'),
('post-013', '550e8400-e29b-41d4-a716-446655440007'),

-- Likes on business posts
('post-008', '550e8400-e29b-41d4-a716-446655440001'),
('post-008', '550e8400-e29b-41d4-a716-446655440004'),
('post-008', '550e8400-e29b-41d4-a716-446655440009'),
('post-014', '550e8400-e29b-41d4-a716-446655440001'),
('post-014', '550e8400-e29b-41d4-a716-446655440002'),

-- Likes on fitness posts
('post-010', '550e8400-e29b-41d4-a716-446655440006'),
('post-010', '550e8400-e29b-41d4-a716-446655440008'),
('post-010', '550e8400-e29b-41d4-a716-446655440009');

-- Insert some comments to make posts feel more engaging
INSERT INTO public.comments (id, post_id, user_id, content) VALUES
('comment-001', 'post-001', '550e8400-e29b-41d4-a716-446655440002', 'This is game-changing! How''s the accuracy compared to manual reviews?'),
('comment-002', 'post-001', '550e8400-e29b-41d4-a716-446655440003', 'Been waiting for something like this. Is it open source?'),
('comment-003', 'post-004', '550e8400-e29b-41d4-a716-446655440001', 'The before/after difference is incredible! UX matters so much.'),
('comment-004', 'post-006', '550e8400-e29b-41d4-a716-446655440007', 'Bali is amazing! Which co-working space is this?'),
('comment-005', 'post-008', '550e8400-e29b-41d4-a716-446655440001', 'Resilience is everything in startups. Congrats on finding PMF!'),
('comment-006', 'post-010', '550e8400-e29b-41d4-a716-446655440006', 'Transformation stories like this motivate me so much! 💪'),
('comment-007', 'post-014', '550e8400-e29b-41d4-a716-446655440002', 'Congrats! The pitch deck would be incredibly valuable to see.'),
('comment-008', 'post-005', '550e8400-e29b-41d4-a716-446655440004', 'Your photography keeps getting better! Love the composition.'),
('comment-009', 'post-009', '550e8400-e29b-41d4-a716-446655440008', '400% ROI is insane! Would love to learn more about the framework.'),
('comment-010', 'post-013', '550e8400-e29b-41d4-a716-446655440005', 'This is exactly why I want to try the nomad lifestyle. Inspiring!');

-- Insert trending data for the explore page
INSERT INTO public.trending_posts (post_id, score) VALUES
('post-014', 95.5), -- Series A announcement
('post-013', 87.2), -- Travel inspiration
('post-008', 82.1), -- Startup success story
('post-006', 78.9), -- Bali nomad life
('post-010', 75.3), -- Fitness transformation
('post-001', 71.8), -- AI code review
('post-004', 68.4), -- UX improvement
('post-009', 65.7), -- Marketing ROI
('post-005', 62.1), -- Street photography
('post-012', 58.9); -- Color psychology

-- Insert user recommendations (suggested follows)
INSERT INTO public.user_recommendations (user_id, recommended_user_id, score, reason) VALUES
-- Tech recommendations
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', 0.85, 'Popular in Tech'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 0.80, 'Popular in Tech'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 0.75, 'Similar Interests'),

-- Creative recommendations  
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440006', 0.90, 'Trending Creator'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440008', 0.82, 'Popular in Creative'),

-- Lifestyle recommendations
('550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440010', 0.88, 'Trending Creator'),
('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', 0.84, 'Similar Interests'),

-- Business recommendations
('550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 0.87, 'Popular in Business'),
('550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440006', 0.79, 'Trending Creator');

-- Update the counts to match the inserted data
UPDATE public.profiles SET 
  followers_count = (SELECT COUNT(*) FROM public.follows WHERE following_id = profiles.id),
  following_count = (SELECT COUNT(*) FROM public.follows WHERE follower_id = profiles.id),
  posts_count = (SELECT COUNT(*) FROM public.posts WHERE user_id = profiles.id);

UPDATE public.posts SET 
  likes_count = (SELECT COUNT(*) FROM public.likes WHERE post_id = posts.id),
  comments_count = (SELECT COUNT(*) FROM public.comments WHERE post_id = posts.id);

-- Refresh materialized views if they exist
-- REFRESH MATERIALIZED VIEW IF EXISTS trending_posts_view;
-- REFRESH MATERIALIZED VIEW IF EXISTS user_recommendations_view;

-- Success message
SELECT 'Mock data inserted successfully! 🎉' as message,
       'Users can now follow ' || COUNT(DISTINCT id) || ' interesting profiles' as profiles_created,
       (SELECT COUNT(*) FROM public.posts) as posts_created,
       (SELECT COUNT(*) FROM public.follows) as follow_relationships,
       (SELECT COUNT(*) FROM public.likes) as total_likes,
       (SELECT COUNT(*) FROM public.comments) as total_comments
FROM public.profiles 
WHERE id LIKE '550e8400-e29b-41d4-a716-446655440%';