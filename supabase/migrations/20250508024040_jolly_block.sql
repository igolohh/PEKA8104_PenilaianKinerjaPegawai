-- Update RLS policies for work_entries to allow kepala_satker to approve entries
DROP POLICY IF EXISTS "Users can update own entries if pegawai" ON work_entries;

CREATE POLICY "Users can update entries based on role"
ON work_entries
FOR UPDATE
TO authenticated
USING (
  (
    -- Pegawai can update their own entries (except approval status)
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'pegawai'
    )
  ) OR (
    -- Kepala satker can only update approval status
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'kepala_satker'
    )
  )
)
WITH CHECK (
  (
    -- Pegawai can update their own entries (except approval status)
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'pegawai'
    )
  ) OR (
    -- Kepala satker can only update approval status
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'kepala_satker'
    )
  )
);