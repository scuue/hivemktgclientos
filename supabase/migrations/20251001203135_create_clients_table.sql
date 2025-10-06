/*
  # Create Hive Marketing Clients Table

  1. New Tables
    - `clients`
      - `id` (uuid, primary key, auto-generated)
      - `client_name` (text, required) - Name of the client
      - `report_link` (text, optional) - URL to the client report
      - `due_date` (date, required) - When the report is due
      - `notes` (text, optional) - Additional notes about the client/report
      - `status` (text, required) - Either 'ready' or 'not_ready'
      - `created_at` (timestamptz, auto-generated) - When the record was created
      - `updated_at` (timestamptz, auto-updated) - When the record was last updated

  2. Indexes
    - Index on `due_date` for faster filtering by date
    - Index on `status` for faster filtering by status
    - Index on `client_name` for faster searching and sorting

  3. Security
    - Enable Row Level Security on `clients` table
    - Add policies to allow all operations for public access (suitable for internal team dashboard)
*/

CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  report_link text,
  due_date date NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'not_ready' CHECK (status IN ('ready', 'not_ready')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_due_date ON clients(due_date);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(client_name);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal team use)
CREATE POLICY "Allow public read access"
  ON clients
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON clients
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON clients
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON clients
  FOR DELETE
  TO anon
  USING (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();