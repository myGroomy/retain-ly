-- Users table for PIN-based login
-- Simple username + 6-digit PIN auth for single-branch POS

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  pin TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS disabled (same as other tables)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON users FOR ALL USING (true);

-- Seed default admin user (PIN: 123456)
INSERT INTO users (username, pin, role) VALUES
  ('admin', '123456', 'admin')
ON CONFLICT (username) DO NOTHING;
