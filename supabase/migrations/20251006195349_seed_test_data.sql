/*
  # Seed Test Data - Intuitive Beauty Spa Example

  ## Overview
  Seeds initial test data to demonstrate the team assignment and monthly content planning features.

  ## Data Created
  
  ### Users
  - Jenesis (Manager)
  - Katrina (Editor)
  - Stephanie (Editor)
  - Alysha (Editor)
  - Olivia (Scripting)
  
  ### Client
  - Intuitive Beauty Spa with team assignments and October 2025 content plan
  
  ### Team Assignments
  - Manager: Jenesis
  - Editors: Katrina, Stephanie, Alysha
  - Scripting: Olivia
  
  ### Monthly Content Plan
  - October 2025: 12 posts, 2 ads
  - Recurring enabled
  
  ## Important Notes
  - Uses INSERT ... ON CONFLICT DO NOTHING to be idempotent
  - Safe to run multiple times without creating duplicates
*/

-- Insert test users
INSERT INTO users (name, email, role) VALUES
  ('Jenesis', 'jenesis@example.com', 'Manager'),
  ('Katrina', 'katrina@example.com', 'Editor'),
  ('Stephanie', 'stephanie@example.com', 'Editor'),
  ('Alysha', 'alysha@example.com', 'Editor'),
  ('Olivia', 'olivia@example.com', 'Scripting')
ON CONFLICT (email) DO NOTHING;

-- Insert test client
INSERT INTO clients (
  id,
  client_name,
  due_date,
  content_due_date,
  posts_per_month,
  ads_per_month,
  package,
  is_recurring,
  shoot_status
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Intuitive Beauty Spa',
  '2025-10-15',
  '2025-10-05',
  12,
  2,
  'Social Media Management',
  true,
  'not_booked'
)
ON CONFLICT (id) DO UPDATE SET
  client_name = EXCLUDED.client_name,
  due_date = EXCLUDED.due_date,
  content_due_date = EXCLUDED.content_due_date,
  posts_per_month = EXCLUDED.posts_per_month,
  ads_per_month = EXCLUDED.ads_per_month,
  package = EXCLUDED.package,
  is_recurring = EXCLUDED.is_recurring,
  shoot_status = EXCLUDED.shoot_status;

-- Assign team members to client
DO $$
DECLARE
  client_uuid uuid := '11111111-1111-1111-1111-111111111111';
  jenesis_id uuid;
  katrina_id uuid;
  stephanie_id uuid;
  alysha_id uuid;
  olivia_id uuid;
BEGIN
  -- Get user IDs
  SELECT id INTO jenesis_id FROM users WHERE email = 'jenesis@example.com';
  SELECT id INTO katrina_id FROM users WHERE email = 'katrina@example.com';
  SELECT id INTO stephanie_id FROM users WHERE email = 'stephanie@example.com';
  SELECT id INTO alysha_id FROM users WHERE email = 'alysha@example.com';
  SELECT id INTO olivia_id FROM users WHERE email = 'olivia@example.com';

  -- Clear existing assignments for this client
  DELETE FROM client_team_assignments WHERE client_id = client_uuid;

  -- Insert new assignments
  INSERT INTO client_team_assignments (client_id, user_id, role) VALUES
    (client_uuid, jenesis_id, 'manager'),
    (client_uuid, katrina_id, 'editor'),
    (client_uuid, stephanie_id, 'editor'),
    (client_uuid, alysha_id, 'editor'),
    (client_uuid, olivia_id, 'scripting');
END $$;

-- Create October 2025 content plan
INSERT INTO monthly_content_plans (
  client_id,
  month,
  posts_planned,
  ads_planned
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '2025-10',
  12,
  2
)
ON CONFLICT (client_id, month) DO UPDATE SET
  posts_planned = EXCLUDED.posts_planned,
  ads_planned = EXCLUDED.ads_planned;
