-- Create users table for real authentication system
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atendente VARCHAR(255) NOT NULL,
  telefone VARCHAR(50),
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  level1_access BOOLEAN DEFAULT false,
  level2_access BOOLEAN DEFAULT false,
  level3_access BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_levels ON users(level1_access, level2_access, level3_access);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Insert the master admin user (password: 1234@@)
INSERT INTO users (atendente, username, password_hash, level1_access, level2_access, level3_access, is_active)
VALUES (
  'Administrador Master',
  'Admin',
  '$2b$12$K1ERYB9n0i5cKq426kaGeeZUfZPFZlCe87VlIJ8eJ3skiTCxzdPky', -- Hash correto para '1234@@'
  true,
  true,
  true,
  true
) ON CONFLICT (username) DO NOTHING;
