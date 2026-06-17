-- INSTRUCTIONS:
-- Copy and paste this into your Supabase SQL Editor and click "Run".
-- This script will:
-- 1. Create profiles for everyone who signed up but hasn't set a nickname.
-- 2. Set up a trigger so future users get a profile automatically.
-- 3. Recreate the user_scores view so EVERYONE appears on the ranking!

-------------------------------------------------------------------------------
-- 1. BACKFILL MISSING PROFILES
-- Anyone in auth.users without a profile gets one (using the first part of their email)
-------------------------------------------------------------------------------
INSERT INTO public.profiles (user_id, nickname)
SELECT id, split_part(email, '@', 1)
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT DO NOTHING;

-------------------------------------------------------------------------------
-- 2. CREATE A TRIGGER FOR FUTURE USERS
-- Automatically creates a profile when a new user signs up.
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-------------------------------------------------------------------------------
-- 3. RECREATE THE VIEW
-- Now we use public.profiles as the base, so EVERYONE shows up (even with 0 pts)
-------------------------------------------------------------------------------
DROP VIEW IF EXISTS public.user_scores;

CREATE VIEW public.user_scores WITH (security_invoker = true) AS
WITH match_points AS (
    SELECT 
        p.user_id,
        p.match_id,
        CASE
            WHEN p.home_score = o.home_score AND p.away_score = o.away_score THEN 5
            WHEN (p.home_score - p.away_score) = (o.home_score - o.away_score) AND (o.home_score - o.away_score) != 0 THEN 3
            WHEN (p.home_score = p.away_score) AND (o.home_score = o.away_score) THEN 2
            WHEN sign(p.home_score - p.away_score) = sign(o.home_score - o.away_score) AND (o.home_score - o.away_score) != 0 THEN 1
            ELSE 0
        END AS points
    FROM public.predictions p
    JOIN public.official_matches o ON p.match_id = o.match_id
)
SELECT 
    prof.user_id,
    COALESCE(prof.nickname, 'Unknown Player') AS user_name,
    COALESCE(SUM(mp.points), 0)::int AS total_points
FROM public.profiles prof
LEFT JOIN match_points mp ON prof.user_id = mp.user_id
GROUP BY prof.user_id, prof.nickname;
