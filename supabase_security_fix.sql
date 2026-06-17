-- INSTRUCTIONS:
-- 1. Open the Supabase Dashboard for your project (vosgfrbxahaiarhmzheg).
-- 2. Go to the "SQL Editor" and click "New query".
-- 3. Paste this entire script into the editor and click "Run".

-------------------------------------------------------------------------------
-- FIX 1: ENABLE ROW-LEVEL SECURITY (RLS) ON ALL TABLES
-- This resolves the 'rls_disabled_in_public' security vulnerability.
-------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knockout_teams ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- FIX 2: ADD RLS POLICIES
-- This ensures everyone can read the data, but only the right people can write.
-- (We use DROP POLICY IF EXISTS first to prevent errors if you run this multiple times)
-------------------------------------------------------------------------------

-- PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- PREDICTIONS
DROP POLICY IF EXISTS "Predictions are viewable by everyone" ON public.predictions;
CREATE POLICY "Predictions are viewable by everyone" ON public.predictions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own prediction" ON public.predictions;
CREATE POLICY "Users can insert their own prediction" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own prediction" ON public.predictions;
CREATE POLICY "Users can update their own prediction" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);

-- OFFICIAL MATCHES
DROP POLICY IF EXISTS "Official matches are viewable by everyone" ON public.official_matches;
CREATE POLICY "Official matches are viewable by everyone" ON public.official_matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can insert official matches" ON public.official_matches;
CREATE POLICY "Only admin can insert official matches" ON public.official_matches FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'romulo.na.santos@gmail.com');

DROP POLICY IF EXISTS "Only admin can update official matches" ON public.official_matches;
CREATE POLICY "Only admin can update official matches" ON public.official_matches FOR UPDATE USING (auth.jwt() ->> 'email' = 'romulo.na.santos@gmail.com');

-- KNOCKOUT TEAMS
DROP POLICY IF EXISTS "Knockout teams are viewable by everyone" ON public.knockout_teams;
CREATE POLICY "Knockout teams are viewable by everyone" ON public.knockout_teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admin can insert knockout teams" ON public.knockout_teams;
CREATE POLICY "Only admin can insert knockout teams" ON public.knockout_teams FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = 'romulo.na.santos@gmail.com');

DROP POLICY IF EXISTS "Only admin can update knockout teams" ON public.knockout_teams;
CREATE POLICY "Only admin can update knockout teams" ON public.knockout_teams FOR UPDATE USING (auth.jwt() ->> 'email' = 'romulo.na.santos@gmail.com');


-------------------------------------------------------------------------------
-- FIX 3: SECURE THE VIEW (FIX AUTH_USERS_EXPOSED)
-- By default, Postgres views execute with the creator's permissions, bypassing RLS.
-- This command changes the 'user_scores' view to use the permissions of the user 
-- querying it (security_invoker = true), preventing accidental exposure of auth.users.
-------------------------------------------------------------------------------

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_scores') THEN
        ALTER VIEW public.user_scores SET (security_invoker = true);
    END IF;
END $$;
