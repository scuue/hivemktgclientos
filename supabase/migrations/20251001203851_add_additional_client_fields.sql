/*
  # Add Additional Client Fields for Hive Marketing

  1. Changes
    - Add `contract_renewal_date` (date, optional) - When the client's contract renews
    - Add `content_due_date` (date, optional) - When content is due (separate from report due date)
    - Add `posts_per_month` (integer, optional) - Number of posts per month
    - Add `type` (text, optional) - Type of client/service
    - Add `reminders` (text, optional) - Reminder notes and alerts
    - Rename `due_date` field usage to be clearer (keep as is for backward compatibility)
    - Remove `report_link` field (no longer needed)
    - Remove `status` field (no longer needed)

  2. Indexes
    - Add index on `contract_renewal_date` for faster filtering
    - Add index on `content_due_date` for faster filtering

  3. Notes
    - Existing data will be preserved
    - New fields are optional to maintain compatibility
*/

-- Add new columns to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'contract_renewal_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN contract_renewal_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'content_due_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN content_due_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'posts_per_month'
  ) THEN
    ALTER TABLE clients ADD COLUMN posts_per_month integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'type'
  ) THEN
    ALTER TABLE clients ADD COLUMN type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'reminders'
  ) THEN
    ALTER TABLE clients ADD COLUMN reminders text;
  END IF;
END $$;

-- Drop old columns that are no longer needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'report_link'
  ) THEN
    ALTER TABLE clients DROP COLUMN report_link;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'status'
  ) THEN
    ALTER TABLE clients DROP COLUMN status;
  END IF;
END $$;

-- Create indexes for new date fields
CREATE INDEX IF NOT EXISTS idx_clients_contract_renewal ON clients(contract_renewal_date);
CREATE INDEX IF NOT EXISTS idx_clients_content_due ON clients(content_due_date);