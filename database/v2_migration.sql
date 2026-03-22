-- ================================================
-- TimeCapsule Memories — Version 2.0 Migration
-- Run this in your Supabase SQL Editor
-- ================================================

-- 1. Password Reset Flow
-- Add reset token columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS reset_token text,
ADD COLUMN IF NOT EXISTS reset_token_expiry timestamptz;

-- 2. Public Hall of Fame
-- Add public flag to capsules (only unlocked capsules should actually be visible)
ALTER TABLE capsules 
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;

-- 3. Collaborative Capsules
-- Add collaborative flag to capsules
ALTER TABLE capsules 
ADD COLUMN IF NOT EXISTS is_collaborative boolean DEFAULT false;

-- Create capsule_contributors table
CREATE TABLE IF NOT EXISTS capsule_contributors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  capsule_id uuid NOT NULL REFERENCES capsules(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL, -- Can be null if invited via email but hasn't signed up
  guest_email text, -- For tracking invites
  content_text text DEFAULT '',
  media_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS capsule_contributors_capsule_idx ON capsule_contributors(capsule_id);

-- Update RLS for the new table (must match capsules policy)
ALTER TABLE capsule_contributors ENABLE ROW LEVEL SECURITY;

-- 4. Admin Verification
-- Add verified flag to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Auto-verify existing profiles so current users aren't locked out
UPDATE profiles SET is_verified = true WHERE is_verified IS FALSE;

-- NOTE: To make yourself an admin, run this after registering:
-- UPDATE profiles SET role = 'admin', is_verified = true WHERE email = 'your-email@example.com';
