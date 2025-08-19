-- Alterando estrutura da tabela para os novos campos
ALTER TABLE tickets 
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS requester_name,
DROP COLUMN IF EXISTS requester_phone;

-- Adicionando novos campos
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS client_email VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS broker_link TEXT,
ADD COLUMN IF NOT EXISTS attendant VARCHAR(50);

-- Renomeando campos existentes
ALTER TABLE tickets 
RENAME COLUMN requester_email TO client_email_old;

-- Atualizando dados existentes
UPDATE tickets SET client_email = client_email_old WHERE client_email_old IS NOT NULL;

-- Removendo coluna temporária
ALTER TABLE tickets DROP COLUMN IF EXISTS client_email_old;
