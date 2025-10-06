/*
  # Add Shoot Tracking Feature

  1. New Columns Added to `clients` Table
    - `shoot_date` (date, optional) - The scheduled date for the photo/video shoot
    - `shoot_status` (text, default 'not_booked') - Current status of the shoot
      * 'not_booked' - Shoot hasn't been scheduled yet
      * 'booked' - Shoot is scheduled
      * 'completed' - Shoot has been completed
    - `shoot_notes` (text, optional) - Additional notes about the shoot (location, time, requirements)

  2. Indexes
    - Add index on `shoot_status` for faster filtering of clients by shoot status
    - Add index on `shoot_date` for date-based queries and calendar views

  3. Notes
    - The shoot tracking feature helps teams manage photo/video shoot scheduling
    - Status tracking enables quick identification of clients needing shoot bookings
    - Visual warnings appear when shoots aren't booked close to content due dates
    - The three status options provide clear workflow stages:
      * not_booked: Initial state, needs attention
      * booked: Scheduled and confirmed
      * completed: Shoot finished, ready for content creation
*/

-- Add shoot_date column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'shoot_date'
  ) THEN
    ALTER TABLE clients ADD COLUMN shoot_date date;
  END IF;
END $$;

-- Add shoot_status column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'shoot_status'
  ) THEN
    ALTER TABLE clients ADD COLUMN shoot_status text DEFAULT 'not_booked' NOT NULL CHECK (shoot_status IN ('not_booked', 'booked', 'completed'));
  END IF;
END $$;

-- Add shoot_notes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'shoot_notes'
  ) THEN
    ALTER TABLE clients ADD COLUMN shoot_notes text;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_shoot_status ON clients(shoot_status);
CREATE INDEX IF NOT EXISTS idx_clients_shoot_date ON clients(shoot_date);