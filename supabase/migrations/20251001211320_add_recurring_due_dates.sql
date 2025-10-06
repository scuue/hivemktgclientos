/*
  # Add Recurring Due Dates Feature

  1. New Columns Added to `clients` Table
    - `recurring_enabled` (boolean, default false) - Whether automatic recurring is enabled for this client
    - `recurring_interval` (text, optional) - Frequency of recurrence: 'monthly', 'quarterly', or 'semi-annually'
    - `last_recurring_update` (timestamptz, optional) - Timestamp of when the due date was last automatically advanced

  2. Indexes
    - Add index on `recurring_enabled` for faster filtering of recurring clients
    - Add index on `recurring_interval` for grouping by interval type

  3. Notes
    - The recurring feature allows automatic advancement of report due dates
    - When enabled, the system will track when dates are advanced using `last_recurring_update`
    - The `recurring_interval` field supports three options:
      * 'monthly' - Advance by 1 month
      * 'quarterly' - Advance by 3 months
      * 'semi-annually' - Advance by 6 months
*/

-- Add recurring_enabled column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'recurring_enabled'
  ) THEN
    ALTER TABLE clients ADD COLUMN recurring_enabled boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add recurring_interval column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'recurring_interval'
  ) THEN
    ALTER TABLE clients ADD COLUMN recurring_interval text CHECK (recurring_interval IN ('monthly', 'quarterly', 'semi-annually'));
  END IF;
END $$;

-- Add last_recurring_update column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'last_recurring_update'
  ) THEN
    ALTER TABLE clients ADD COLUMN last_recurring_update timestamptz;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_recurring_enabled ON clients(recurring_enabled);
CREATE INDEX IF NOT EXISTS idx_clients_recurring_interval ON clients(recurring_interval);