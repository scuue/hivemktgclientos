/*
  # Add Monthly Reporting Canva Link and Rename Type to Package

  1. Changes
    - Add `monthly_reporting_canva_link` (text, optional) - URL to the monthly reporting Canva document
    - Rename `type` column to `package` - Represents the package/service tier
    
  2. Notes
    - Existing data in the `type` column will be preserved in the new `package` column
    - The rename is done safely to avoid data loss
*/

-- Add new column for monthly reporting canva link
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'monthly_reporting_canva_link'
  ) THEN
    ALTER TABLE clients ADD COLUMN monthly_reporting_canva_link text;
  END IF;
END $$;

-- Rename type column to package
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'package'
  ) THEN
    ALTER TABLE clients RENAME COLUMN type TO package;
  END IF;
END $$;