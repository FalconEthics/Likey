drop extension if exists "pg_net";


  create table "public"."comments" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "post_id" uuid not null,
    "content" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."comments" enable row level security;


  create table "public"."conversations" (
    "id" uuid not null default uuid_generate_v4(),
    "user1_id" uuid not null,
    "user2_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "last_message_at" timestamp with time zone default now()
      );


alter table "public"."conversations" enable row level security;


  create table "public"."follows" (
    "id" uuid not null default uuid_generate_v4(),
    "follower_id" uuid not null,
    "following_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."follows" enable row level security;


  create table "public"."likes" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "post_id" uuid not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."likes" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default uuid_generate_v4(),
    "conversation_id" uuid not null,
    "sender_id" uuid not null,
    "content" text not null,
    "read" boolean default false,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."messages" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "type" character varying(20) not null,
    "message" text not null,
    "read" boolean default false,
    "related_user_id" uuid,
    "related_post_id" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."notifications" enable row level security;


  create table "public"."posts" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "caption" text,
    "image_urls" text[] not null,
    "like_count" integer default 0,
    "comment_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."posts" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "username" character varying(20) not null,
    "display_name" character varying(50) not null,
    "bio" text,
    "profile_pic_url" text,
    "followers_count" integer default 0,
    "following_count" integer default 0,
    "posts_count" integer default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."suggested_follows" (
    "id" uuid not null default gen_random_uuid(),
    "username" character varying(50) not null,
    "display_name" character varying(100) not null,
    "bio" text,
    "profile_pic_url" text,
    "category" character varying(50),
    "follower_count" integer default 0,
    "created_at" timestamp with time zone default now()
      );



  create table "public"."trending_posts" (
    "id" uuid not null default uuid_generate_v4(),
    "post_id" uuid not null,
    "score" numeric not null,
    "trending_date" date default CURRENT_DATE,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."trending_posts" enable row level security;


  create table "public"."user_recommendations" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "recommended_user_id" uuid not null,
    "reason" character varying(50) not null,
    "score" integer default 0,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_recommendations" enable row level security;

CREATE UNIQUE INDEX comments_pkey ON public.comments USING btree (id);

CREATE UNIQUE INDEX conversations_pkey ON public.conversations USING btree (id);

CREATE UNIQUE INDEX conversations_user1_id_user2_id_key ON public.conversations USING btree (user1_id, user2_id);

CREATE UNIQUE INDEX follows_follower_id_following_id_key ON public.follows USING btree (follower_id, following_id);

CREATE UNIQUE INDEX follows_pkey ON public.follows USING btree (id);

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);

CREATE INDEX idx_conversations_last_message ON public.conversations USING btree (last_message_at DESC);

CREATE INDEX idx_conversations_user1 ON public.conversations USING btree (user1_id);

CREATE INDEX idx_conversations_user2 ON public.conversations USING btree (user2_id);

CREATE INDEX idx_follows_follower_id ON public.follows USING btree (follower_id);

CREATE INDEX idx_follows_following_id ON public.follows USING btree (following_id);

CREATE INDEX idx_likes_post_id ON public.likes USING btree (post_id);

CREATE INDEX idx_likes_user_id ON public.likes USING btree (user_id);

CREATE INDEX idx_messages_conversation ON public.messages USING btree (conversation_id);

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);

CREATE INDEX idx_messages_sender ON public.messages USING btree (sender_id);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);

CREATE INDEX idx_posts_user_id ON public.posts USING btree (user_id);

CREATE INDEX idx_profiles_search ON public.profiles USING gin (to_tsvector('english'::regconfig, (((username)::text || ' '::text) || (display_name)::text)));

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);

CREATE INDEX idx_trending_posts_date ON public.trending_posts USING btree (trending_date DESC);

CREATE INDEX idx_trending_posts_score ON public.trending_posts USING btree (score DESC);

CREATE INDEX idx_user_recommendations_score ON public.user_recommendations USING btree (score DESC);

CREATE INDEX idx_user_recommendations_user ON public.user_recommendations USING btree (user_id);

CREATE UNIQUE INDEX likes_pkey ON public.likes USING btree (id);

CREATE UNIQUE INDEX likes_user_id_post_id_key ON public.likes USING btree (user_id, post_id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX profiles_username_key ON public.profiles USING btree (username);

CREATE UNIQUE INDEX suggested_follows_pkey ON public.suggested_follows USING btree (id);

CREATE UNIQUE INDEX suggested_follows_username_key ON public.suggested_follows USING btree (username);

CREATE UNIQUE INDEX trending_posts_pkey ON public.trending_posts USING btree (id);

CREATE UNIQUE INDEX trending_posts_post_id_key ON public.trending_posts USING btree (post_id);

CREATE UNIQUE INDEX user_recommendations_pkey ON public.user_recommendations USING btree (id);

CREATE UNIQUE INDEX user_recommendations_user_id_recommended_user_id_key ON public.user_recommendations USING btree (user_id, recommended_user_id);

alter table "public"."comments" add constraint "comments_pkey" PRIMARY KEY using index "comments_pkey";

alter table "public"."conversations" add constraint "conversations_pkey" PRIMARY KEY using index "conversations_pkey";

alter table "public"."follows" add constraint "follows_pkey" PRIMARY KEY using index "follows_pkey";

alter table "public"."likes" add constraint "likes_pkey" PRIMARY KEY using index "likes_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."suggested_follows" add constraint "suggested_follows_pkey" PRIMARY KEY using index "suggested_follows_pkey";

alter table "public"."trending_posts" add constraint "trending_posts_pkey" PRIMARY KEY using index "trending_posts_pkey";

alter table "public"."user_recommendations" add constraint "user_recommendations_pkey" PRIMARY KEY using index "user_recommendations_pkey";

alter table "public"."comments" add constraint "comments_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_post_id_fkey";

alter table "public"."comments" add constraint "comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."comments" validate constraint "comments_user_id_fkey";

alter table "public"."conversations" add constraint "conversations_check" CHECK ((user1_id <> user2_id)) not valid;

alter table "public"."conversations" validate constraint "conversations_check";

alter table "public"."conversations" add constraint "conversations_user1_id_fkey" FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user1_id_fkey";

alter table "public"."conversations" add constraint "conversations_user1_id_user2_id_key" UNIQUE using index "conversations_user1_id_user2_id_key";

alter table "public"."conversations" add constraint "conversations_user2_id_fkey" FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."conversations" validate constraint "conversations_user2_id_fkey";

alter table "public"."follows" add constraint "follows_check" CHECK ((follower_id <> following_id)) not valid;

alter table "public"."follows" validate constraint "follows_check";

alter table "public"."follows" add constraint "follows_follower_id_fkey" FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_follower_id_fkey";

alter table "public"."follows" add constraint "follows_follower_id_following_id_key" UNIQUE using index "follows_follower_id_following_id_key";

alter table "public"."follows" add constraint "follows_following_id_fkey" FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."follows" validate constraint "follows_following_id_fkey";

alter table "public"."likes" add constraint "likes_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."likes" validate constraint "likes_post_id_fkey";

alter table "public"."likes" add constraint "likes_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."likes" validate constraint "likes_user_id_fkey";

alter table "public"."likes" add constraint "likes_user_id_post_id_key" UNIQUE using index "likes_user_id_post_id_key";

alter table "public"."messages" add constraint "messages_conversation_id_fkey" FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_conversation_id_fkey";

alter table "public"."messages" add constraint "messages_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_sender_id_fkey";

alter table "public"."notifications" add constraint "notifications_related_post_id_fkey" FOREIGN KEY (related_post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_related_post_id_fkey";

alter table "public"."notifications" add constraint "notifications_related_user_id_fkey" FOREIGN KEY (related_user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_related_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_type_check" CHECK (((type)::text = ANY ((ARRAY['like'::character varying, 'comment'::character varying, 'follow'::character varying])::text[]))) not valid;

alter table "public"."notifications" validate constraint "notifications_type_check";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."posts" add constraint "posts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."posts" validate constraint "posts_user_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."profiles" add constraint "profiles_username_key" UNIQUE using index "profiles_username_key";

alter table "public"."suggested_follows" add constraint "suggested_follows_username_key" UNIQUE using index "suggested_follows_username_key";

alter table "public"."trending_posts" add constraint "trending_posts_post_id_fkey" FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE not valid;

alter table "public"."trending_posts" validate constraint "trending_posts_post_id_fkey";

alter table "public"."trending_posts" add constraint "trending_posts_post_id_key" UNIQUE using index "trending_posts_post_id_key";

alter table "public"."user_recommendations" add constraint "user_recommendations_recommended_user_id_fkey" FOREIGN KEY (recommended_user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_recommendations" validate constraint "user_recommendations_recommended_user_id_fkey";

alter table "public"."user_recommendations" add constraint "user_recommendations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_recommendations" validate constraint "user_recommendations_user_id_fkey";

alter table "public"."user_recommendations" add constraint "user_recommendations_user_id_recommended_user_id_key" UNIQUE using index "user_recommendations_user_id_recommended_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.calculate_trending_score(post_id uuid)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  like_count INTEGER;
  comment_count INTEGER;
  post_age_hours NUMERIC;
  score NUMERIC;
BEGIN
  SELECT p.like_count, p.comment_count, 
         EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 
  INTO like_count, comment_count, post_age_hours
  FROM public.posts p WHERE p.id = post_id;
  
  -- Trending algorithm: (likes * 2 + comments * 3) / (age_hours + 1)^1.5
  score := (like_count * 2 + comment_count * 3) / POWER(post_age_hours + 1, 1.5);
  
  RETURN score;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_mutual_follow_recommendations(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear old recommendations for this user
  DELETE FROM public.user_recommendations WHERE user_id = target_user_id;
  
  -- Insert mutual follower recommendations
  INSERT INTO public.user_recommendations (user_id, recommended_user_id, reason, score)
  SELECT DISTINCT
    target_user_id,
    mutual_user.id,
    'mutual_followers',
    COUNT(*) as score
  FROM public.follows f1
  JOIN public.follows f2 ON f1.following_id = f2.follower_id
  JOIN public.profiles mutual_user ON f2.following_id = mutual_user.id
  WHERE f1.follower_id = target_user_id
    AND mutual_user.id != target_user_id
    AND mutual_user.id NOT IN (
      SELECT following_id FROM public.follows WHERE follower_id = target_user_id
    )
  GROUP BY mutual_user.id
  HAVING COUNT(*) >= 2
  ORDER BY score DESC
  LIMIT 20;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.refresh_trending_posts()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear old trending data (older than 7 days)
  DELETE FROM public.trending_posts 
  WHERE trending_date < CURRENT_DATE - INTERVAL '7 days';
  
  -- Insert/update trending posts for today
  INSERT INTO public.trending_posts (post_id, score, trending_date)
  SELECT 
    p.id,
    public.calculate_trending_score(p.id),
    CURRENT_DATE
  FROM public.posts p
  WHERE p.created_at > CURRENT_DATE - INTERVAL '7 days'
    AND (p.like_count > 0 OR p.comment_count > 0)
  ON CONFLICT (post_id) 
  DO UPDATE SET 
    score = EXCLUDED.score,
    trending_date = EXCLUDED.trending_date;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_comment_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_follow_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
    UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_like_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_posts_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET posts_count = posts_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET posts_count = posts_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conv_id uuid, user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conv_id 
    AND (user1_id = user_id OR user2_id = user_id)
  );
$function$
;

grant delete on table "public"."comments" to "anon";

grant insert on table "public"."comments" to "anon";

grant references on table "public"."comments" to "anon";

grant select on table "public"."comments" to "anon";

grant trigger on table "public"."comments" to "anon";

grant truncate on table "public"."comments" to "anon";

grant update on table "public"."comments" to "anon";

grant delete on table "public"."comments" to "authenticated";

grant insert on table "public"."comments" to "authenticated";

grant references on table "public"."comments" to "authenticated";

grant select on table "public"."comments" to "authenticated";

grant trigger on table "public"."comments" to "authenticated";

grant truncate on table "public"."comments" to "authenticated";

grant update on table "public"."comments" to "authenticated";

grant delete on table "public"."comments" to "service_role";

grant insert on table "public"."comments" to "service_role";

grant references on table "public"."comments" to "service_role";

grant select on table "public"."comments" to "service_role";

grant trigger on table "public"."comments" to "service_role";

grant truncate on table "public"."comments" to "service_role";

grant update on table "public"."comments" to "service_role";

grant delete on table "public"."conversations" to "anon";

grant insert on table "public"."conversations" to "anon";

grant references on table "public"."conversations" to "anon";

grant select on table "public"."conversations" to "anon";

grant trigger on table "public"."conversations" to "anon";

grant truncate on table "public"."conversations" to "anon";

grant update on table "public"."conversations" to "anon";

grant delete on table "public"."conversations" to "authenticated";

grant insert on table "public"."conversations" to "authenticated";

grant references on table "public"."conversations" to "authenticated";

grant select on table "public"."conversations" to "authenticated";

grant trigger on table "public"."conversations" to "authenticated";

grant truncate on table "public"."conversations" to "authenticated";

grant update on table "public"."conversations" to "authenticated";

grant delete on table "public"."conversations" to "service_role";

grant insert on table "public"."conversations" to "service_role";

grant references on table "public"."conversations" to "service_role";

grant select on table "public"."conversations" to "service_role";

grant trigger on table "public"."conversations" to "service_role";

grant truncate on table "public"."conversations" to "service_role";

grant update on table "public"."conversations" to "service_role";

grant delete on table "public"."follows" to "anon";

grant insert on table "public"."follows" to "anon";

grant references on table "public"."follows" to "anon";

grant select on table "public"."follows" to "anon";

grant trigger on table "public"."follows" to "anon";

grant truncate on table "public"."follows" to "anon";

grant update on table "public"."follows" to "anon";

grant delete on table "public"."follows" to "authenticated";

grant insert on table "public"."follows" to "authenticated";

grant references on table "public"."follows" to "authenticated";

grant select on table "public"."follows" to "authenticated";

grant trigger on table "public"."follows" to "authenticated";

grant truncate on table "public"."follows" to "authenticated";

grant update on table "public"."follows" to "authenticated";

grant delete on table "public"."follows" to "service_role";

grant insert on table "public"."follows" to "service_role";

grant references on table "public"."follows" to "service_role";

grant select on table "public"."follows" to "service_role";

grant trigger on table "public"."follows" to "service_role";

grant truncate on table "public"."follows" to "service_role";

grant update on table "public"."follows" to "service_role";

grant delete on table "public"."likes" to "anon";

grant insert on table "public"."likes" to "anon";

grant references on table "public"."likes" to "anon";

grant select on table "public"."likes" to "anon";

grant trigger on table "public"."likes" to "anon";

grant truncate on table "public"."likes" to "anon";

grant update on table "public"."likes" to "anon";

grant delete on table "public"."likes" to "authenticated";

grant insert on table "public"."likes" to "authenticated";

grant references on table "public"."likes" to "authenticated";

grant select on table "public"."likes" to "authenticated";

grant trigger on table "public"."likes" to "authenticated";

grant truncate on table "public"."likes" to "authenticated";

grant update on table "public"."likes" to "authenticated";

grant delete on table "public"."likes" to "service_role";

grant insert on table "public"."likes" to "service_role";

grant references on table "public"."likes" to "service_role";

grant select on table "public"."likes" to "service_role";

grant trigger on table "public"."likes" to "service_role";

grant truncate on table "public"."likes" to "service_role";

grant update on table "public"."likes" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."suggested_follows" to "anon";

grant insert on table "public"."suggested_follows" to "anon";

grant references on table "public"."suggested_follows" to "anon";

grant select on table "public"."suggested_follows" to "anon";

grant trigger on table "public"."suggested_follows" to "anon";

grant truncate on table "public"."suggested_follows" to "anon";

grant update on table "public"."suggested_follows" to "anon";

grant delete on table "public"."suggested_follows" to "authenticated";

grant insert on table "public"."suggested_follows" to "authenticated";

grant references on table "public"."suggested_follows" to "authenticated";

grant select on table "public"."suggested_follows" to "authenticated";

grant trigger on table "public"."suggested_follows" to "authenticated";

grant truncate on table "public"."suggested_follows" to "authenticated";

grant update on table "public"."suggested_follows" to "authenticated";

grant delete on table "public"."suggested_follows" to "service_role";

grant insert on table "public"."suggested_follows" to "service_role";

grant references on table "public"."suggested_follows" to "service_role";

grant select on table "public"."suggested_follows" to "service_role";

grant trigger on table "public"."suggested_follows" to "service_role";

grant truncate on table "public"."suggested_follows" to "service_role";

grant update on table "public"."suggested_follows" to "service_role";

grant delete on table "public"."trending_posts" to "anon";

grant insert on table "public"."trending_posts" to "anon";

grant references on table "public"."trending_posts" to "anon";

grant select on table "public"."trending_posts" to "anon";

grant trigger on table "public"."trending_posts" to "anon";

grant truncate on table "public"."trending_posts" to "anon";

grant update on table "public"."trending_posts" to "anon";

grant delete on table "public"."trending_posts" to "authenticated";

grant insert on table "public"."trending_posts" to "authenticated";

grant references on table "public"."trending_posts" to "authenticated";

grant select on table "public"."trending_posts" to "authenticated";

grant trigger on table "public"."trending_posts" to "authenticated";

grant truncate on table "public"."trending_posts" to "authenticated";

grant update on table "public"."trending_posts" to "authenticated";

grant delete on table "public"."trending_posts" to "service_role";

grant insert on table "public"."trending_posts" to "service_role";

grant references on table "public"."trending_posts" to "service_role";

grant select on table "public"."trending_posts" to "service_role";

grant trigger on table "public"."trending_posts" to "service_role";

grant truncate on table "public"."trending_posts" to "service_role";

grant update on table "public"."trending_posts" to "service_role";

grant delete on table "public"."user_recommendations" to "anon";

grant insert on table "public"."user_recommendations" to "anon";

grant references on table "public"."user_recommendations" to "anon";

grant select on table "public"."user_recommendations" to "anon";

grant trigger on table "public"."user_recommendations" to "anon";

grant truncate on table "public"."user_recommendations" to "anon";

grant update on table "public"."user_recommendations" to "anon";

grant delete on table "public"."user_recommendations" to "authenticated";

grant insert on table "public"."user_recommendations" to "authenticated";

grant references on table "public"."user_recommendations" to "authenticated";

grant select on table "public"."user_recommendations" to "authenticated";

grant trigger on table "public"."user_recommendations" to "authenticated";

grant truncate on table "public"."user_recommendations" to "authenticated";

grant update on table "public"."user_recommendations" to "authenticated";

grant delete on table "public"."user_recommendations" to "service_role";

grant insert on table "public"."user_recommendations" to "service_role";

grant references on table "public"."user_recommendations" to "service_role";

grant select on table "public"."user_recommendations" to "service_role";

grant trigger on table "public"."user_recommendations" to "service_role";

grant truncate on table "public"."user_recommendations" to "service_role";

grant update on table "public"."user_recommendations" to "service_role";


  create policy "Comments are viewable by everyone"
  on "public"."comments"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own comments"
  on "public"."comments"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "comments_delete_authenticated"
  on "public"."comments"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "comments_realtime_select"
  on "public"."comments"
  as permissive
  for select
  to anon
using (true);



  create policy "comments_update_authenticated"
  on "public"."comments"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()));



  create policy "conversations_insert_authenticated"
  on "public"."conversations"
  as permissive
  for insert
  to authenticated
with check (((user1_id = auth.uid()) OR (user2_id = auth.uid())));



  create policy "conversations_realtime_select"
  on "public"."conversations"
  as permissive
  for select
  to anon
using (true);



  create policy "conversations_select_authenticated"
  on "public"."conversations"
  as permissive
  for select
  to authenticated
using (((user1_id = auth.uid()) OR (user2_id = auth.uid())));



  create policy "Follows are viewable by everyone"
  on "public"."follows"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own follows"
  on "public"."follows"
  as permissive
  for insert
  to public
with check ((auth.uid() = follower_id));



  create policy "follows_delete_authenticated"
  on "public"."follows"
  as permissive
  for delete
  to authenticated
using ((follower_id = auth.uid()));



  create policy "follows_realtime_select"
  on "public"."follows"
  as permissive
  for select
  to anon
using (true);



  create policy "Likes are viewable by everyone"
  on "public"."likes"
  as permissive
  for select
  to public
using (true);



  create policy "Users can insert their own likes"
  on "public"."likes"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "likes_delete_authenticated"
  on "public"."likes"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "likes_realtime_select"
  on "public"."likes"
  as permissive
  for select
  to anon
using (true);



  create policy "messages_insert_authenticated"
  on "public"."messages"
  as permissive
  for insert
  to authenticated
with check (((sender_id = auth.uid()) AND user_can_access_conversation(conversation_id, auth.uid())));



  create policy "messages_realtime_select"
  on "public"."messages"
  as permissive
  for select
  to anon
using (true);



  create policy "messages_select_authenticated"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using (user_can_access_conversation(conversation_id, auth.uid()));



  create policy "messages_update_authenticated"
  on "public"."messages"
  as permissive
  for update
  to authenticated
using (user_can_access_conversation(conversation_id, auth.uid()));



  create policy "Authenticated users can create notifications for others"
  on "public"."notifications"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "notifications_realtime_select"
  on "public"."notifications"
  as permissive
  for select
  to anon
using (true);



  create policy "notifications_select_authenticated"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "notifications_update_authenticated"
  on "public"."notifications"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()));



  create policy "Posts are viewable by everyone"
  on "public"."posts"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete own posts"
  on "public"."posts"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert their own posts"
  on "public"."posts"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own posts"
  on "public"."posts"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Authenticated users can create profiles"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.role() = 'authenticated'::text));



  create policy "Public profiles are viewable by everyone"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Trending posts are viewable by everyone"
  on "public"."trending_posts"
  as permissive
  for select
  to public
using (true);



  create policy "Users can view their own recommendations"
  on "public"."user_recommendations"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));


CREATE TRIGGER comment_count_trigger AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION update_comment_count();

CREATE TRIGGER follow_counts_trigger AFTER INSERT OR DELETE ON public.follows FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

CREATE TRIGGER like_count_trigger AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION update_like_count();

CREATE TRIGGER message_timestamp_trigger AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

CREATE TRIGGER posts_count_trigger AFTER INSERT OR DELETE ON public.posts FOR EACH ROW EXECUTE FUNCTION update_posts_count();


