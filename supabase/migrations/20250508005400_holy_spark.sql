/*
  # Update profiles table schema

  1. Changes
    - Remove phone column
    - Remove address column
    - Add position column
  
  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Remove columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles DROP COLUMN phone;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles DROP COLUMN address;
  END IF;

  -- Add position column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN position text;
  END IF;
END $$;