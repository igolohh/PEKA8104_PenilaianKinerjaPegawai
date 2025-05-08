/*
  # Add user roles and permissions

  1. Changes
    - Add role column to profiles table
    - Set default role as 'pegawai'
    - Update christo.erie@bps.go.id to 'kepala_satker' role
    - Update RLS policies to consider roles
*/

-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'pegawai';

-- Update christo.erie@bps.go.id to kepala_satker role
UPDATE profiles 
SET role = 'kepala_satker'
WHERE email = 'christo.erie@bps.go.id';

-- Update RLS policies for work_entries
DROP POLICY IF EXISTS "Users can view own entries" ON work_entries;
CREATE POLICY "Users can view entries based on role"
ON work_entries
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'kepala_satker'
  )
);

DROP POLICY IF EXISTS "Users can insert own entries" ON work_entries;
CREATE POLICY "Only pegawai can insert entries"
ON work_entries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'pegawai'
  )
);

DROP POLICY IF EXISTS "Users can update own entries" ON work_entries;
CREATE POLICY "Users can update own entries if pegawai"
ON work_entries
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'pegawai'
  )
)
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'pegawai'
  )
);