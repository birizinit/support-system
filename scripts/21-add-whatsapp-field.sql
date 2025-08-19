-- Add WhatsApp notification field to users table
ALTER TABLE users 
ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT true;

-- Add comment to explain the field
COMMENT ON COLUMN users.whatsapp_enabled IS 'Se o usuário deve receber notificações WhatsApp quando seus tickets são resolvidos';

-- Update existing users to have WhatsApp enabled by default
UPDATE users SET whatsapp_enabled = true WHERE whatsapp_enabled IS NULL;
