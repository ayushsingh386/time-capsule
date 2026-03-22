-- 1. Status and Branch columns for profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending', -- pending, active, blocked, suspended
ADD COLUMN IF NOT EXISTS branch text; -- CS, DS, IT, etc.

-- 2. Update existing verified users to 'active'
UPDATE profiles SET status = 'active' WHERE is_verified IS TRUE;
UPDATE profiles SET status = 'pending' WHERE is_verified IS FALSE AND status = 'pending';
