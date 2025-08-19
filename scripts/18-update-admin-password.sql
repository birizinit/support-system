-- Update admin password with correct hash for '1234@@'
-- This hash was generated using bcrypt with salt rounds 12
UPDATE users 
SET password_hash = '$2b$12$K1ERYB9n0i5cKq426kaGeeZUfZPFZlCe87VlIJ8eJ3skiTCxzdPky'
WHERE username = 'Admin';
