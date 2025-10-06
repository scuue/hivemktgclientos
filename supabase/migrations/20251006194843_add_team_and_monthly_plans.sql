/*
  # Add Team Assignments and Monthly Content Plans

  ## Overview
  This migration adds comprehensive team collaboration and monthly content planning features.
  
  ## 1. New Tables
  
  ### users
  Stores team members who can be assigned to clients
  - `id` (uuid, primary key) - Unique user identifier
  - `name` (text, required) - User's full name
  - `email` (text, unique, required) - User's email address
  - `avatar_url` (text, optional) - URL to user's avatar image
  - `role` (text, optional) - User's primary role in organization
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### client_team_assignments
  Junction table linking clients to team members with specific roles
  - `id` (uuid, primary key) - Unique assignment identifier
  - `client_id` (uuid, required, foreign key) - References clients table
  - `user_id` (uuid, required, foreign key) - References users table
  - `role` (text, required) - Assignment role: 'manager', 'editor', or 'scripting'
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### monthly_content_plans
  Stores content planning data for each client by month
  - `id` (uuid, primary key) - Unique plan identifier
  - `client_id` (uuid, required, foreign key) - References clients table
  - `month` (text, required) - Month in YYYY-MM format
  - `posts_planned` (integer, default 0) - Number of posts planned for the month
  - `ads_planned` (integer, default 0) - Number of ads planned for the month
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record last update timestamp
  
  ## 2. Table Modifications
  
  ### clients table changes
  - Add `ads_per_month` (integer, optional) - Number of ads per month for client
  - Rename `recurring_enabled` to `is_recurring` for consistency with requirements
  
  ## 3. Security
  - Enable RLS on all new tables
  - Add policies for authenticated users to manage team assignments and plans
  - Unique constraint on client_team_assignments (client_id, user_id, role) to prevent duplicates
  - Unique constraint on monthly_content_plans (client_id, month) to ensure one plan per month
  
  ## 4. Important Notes
  - Each client should have exactly ONE manager (enforced at application level)
  - Editors and Scripting roles can have zero or more team members
  - Monthly plans auto-create for recurring clients when accessing new months
  - Month format must be YYYY-MM (e.g., "2025-10")
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  role text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update users"
  ON users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create client_team_assignments table
CREATE TABLE IF NOT EXISTS client_team_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('manager', 'editor', 'scripting')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, user_id, role)
);

ALTER TABLE client_team_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view team assignments"
  ON client_team_assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create team assignments"
  ON client_team_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update team assignments"
  ON client_team_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete team assignments"
  ON client_team_assignments FOR DELETE
  TO authenticated
  USING (true);

-- Create monthly_content_plans table
CREATE TABLE IF NOT EXISTS monthly_content_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  month text NOT NULL,
  posts_planned integer DEFAULT 0 NOT NULL,
  ads_planned integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, month)
);

ALTER TABLE monthly_content_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view content plans"
  ON monthly_content_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create content plans"
  ON monthly_content_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update content plans"
  ON monthly_content_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete content plans"
  ON monthly_content_plans FOR DELETE
  TO authenticated
  USING (true);

-- Add ads_per_month to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'ads_per_month'
  ) THEN
    ALTER TABLE clients ADD COLUMN ads_per_month integer;
  END IF;
END $$;

-- Rename recurring_enabled to is_recurring
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'recurring_enabled'
  ) THEN
    ALTER TABLE clients RENAME COLUMN recurring_enabled TO is_recurring;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_client_id ON client_team_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_user_id ON client_team_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_client_team_assignments_role ON client_team_assignments(role);
CREATE INDEX IF NOT EXISTS idx_monthly_content_plans_client_id ON monthly_content_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_monthly_content_plans_month ON monthly_content_plans(month);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on monthly_content_plans
DROP TRIGGER IF EXISTS update_monthly_content_plans_updated_at ON monthly_content_plans;
CREATE TRIGGER update_monthly_content_plans_updated_at
  BEFORE UPDATE ON monthly_content_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
