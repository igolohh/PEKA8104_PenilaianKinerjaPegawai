/*
  # Create work entries table

  1. New Tables
    - `work_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `date` (date)
      - `description` (text)
      - `duration` (numeric)
      - `volume` (integer)
      - `unit` (text)
      - `status` (text)
      - `approved` (boolean, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `work_entries` table
    - Add policies for authenticated users to:
      - Insert their own entries
      - Update their own entries
      - View their own entries
    - Add policy for Kepala to view all entries
*/

CREATE TABLE IF NOT EXISTS work_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  description text NOT NULL,
  duration numeric NOT NULL,
  volume integer NOT NULL,
  unit text NOT NULL,
  status text NOT NULL,
  approved boolean,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE work_entries ENABLE ROW LEVEL SECURITY;

-- Policy for users to insert their own entries
CREATE POLICY "Users can insert own entries"
  ON work_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own entries
CREATE POLICY "Users can update own entries"
  ON work_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to view their own entries
CREATE POLICY "Users can view own entries"
  ON work_entries
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND position = 'Kepala BPS Kabupaten Buru'
    )
  );