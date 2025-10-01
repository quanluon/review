-- Advanced Features Migration
-- Adds: Notifications, Gamification, Admin features

-- Create Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'new_review', 'new_follower', 'review_like', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Additional data (review_id, place_id, etc.)
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create User Stats table for gamification
CREATE TABLE public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_reviews INTEGER DEFAULT 0,
  total_places_added INTEGER DEFAULT 0,
  total_followers INTEGER DEFAULT 0,
  total_following INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Reported Content table for moderation
CREATE TABLE public.reported_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'review', 'place', 'user'
  content_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  moderator_id UUID REFERENCES public.users(id),
  moderator_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add admin role to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
-- Possible values: 'user', 'moderator', 'admin'

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX idx_user_stats_points ON public.user_stats(points DESC);
CREATE INDEX idx_reported_content_status ON public.reported_content(status, created_at DESC);

-- RLS Policies for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for User Stats
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User stats are viewable by everyone" ON public.user_stats
  FOR SELECT USING (true);

CREATE POLICY "System can manage user stats" ON public.user_stats
  FOR ALL USING (true);

-- RLS Policies for Reported Content
ALTER TABLE public.reported_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports" ON public.reported_content
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON public.reported_content
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view all reports" ON public.reported_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Moderators can update reports" ON public.reported_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Function: Create notification when user is followed
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    NEW.following_id,
    'new_follower',
    'New Follower',
    (SELECT name FROM public.users WHERE id = NEW.follower_id) || ' started following you',
    jsonb_build_object('follower_id', NEW.follower_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_follower
AFTER INSERT ON public.follows
FOR EACH ROW
EXECUTE FUNCTION notify_new_follower();

-- Function: Create notification when someone reviews a place you follow
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify followers of the reviewer
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT 
    f.follower_id,
    'new_review',
    'New Review',
    (SELECT name FROM public.users WHERE id = NEW.user_id) || ' reviewed ' || 
    (SELECT name FROM public.places WHERE id = NEW.place_id),
    jsonb_build_object(
      'review_id', NEW.id,
      'place_id', NEW.place_id,
      'user_id', NEW.user_id
    )
  FROM public.follows f
  WHERE f.following_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();

-- Function: Update user stats when review is created
CREATE OR REPLACE FUNCTION update_user_stats_on_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (user_id, total_reviews, points)
  VALUES (NEW.user_id, 1, 10) -- 10 points per review
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_reviews = user_stats.total_reviews + 1,
    points = user_stats.points + 10,
    level = CASE 
      WHEN user_stats.points + 10 >= 1000 THEN 10
      WHEN user_stats.points + 10 >= 500 THEN 5
      WHEN user_stats.points + 10 >= 100 THEN 3
      ELSE 1
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_on_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_on_review();

-- Function: Update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update following count for follower
    INSERT INTO public.user_stats (user_id, total_following)
    VALUES (NEW.follower_id, 1)
    ON CONFLICT (user_id) DO UPDATE
    SET total_following = user_stats.total_following + 1;
    
    -- Update followers count for following
    INSERT INTO public.user_stats (user_id, total_followers, points)
    VALUES (NEW.following_id, 1, 5) -- 5 points for new follower
    ON CONFLICT (user_id) DO UPDATE
    SET 
      total_followers = user_stats.total_followers + 1,
      points = user_stats.points + 5;
      
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease counts
    UPDATE public.user_stats SET total_following = total_following - 1
    WHERE user_id = OLD.follower_id;
    
    UPDATE public.user_stats SET total_followers = total_followers - 1
    WHERE user_id = OLD.following_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follower_counts
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();

-- Create view for leaderboard
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  u.id,
  u.name,
  u.avatar_url,
  COALESCE(s.points, 0) as points,
  COALESCE(s.level, 1) as level,
  COALESCE(s.total_reviews, 0) as total_reviews,
  COALESCE(s.total_followers, 0) as total_followers,
  COALESCE(s.badges, '[]'::jsonb) as badges
FROM public.users u
LEFT JOIN public.user_stats s ON u.id = s.user_id
ORDER BY points DESC, total_reviews DESC
LIMIT 100;

-- Grant access to leaderboard view
GRANT SELECT ON public.leaderboard TO authenticated, anon;

