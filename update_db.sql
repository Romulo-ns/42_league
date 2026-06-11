-- INSTRUCTIONS FOR SUPABASE SQL EDITOR
-- Please copy and paste the following command into your Supabase SQL Editor and click "Run".
-- This will add the "campus" column to your existing "profiles" table.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS campus TEXT;
