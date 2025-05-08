/*
  # Add NIP column to profiles table

  1. Changes
    - Add NIP column to profiles table
*/

DO $$ 
BEGIN
  -- Add NIP column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'nip'
  ) THEN
    ALTER TABLE profiles ADD COLUMN nip text;
  END IF;
END $$;