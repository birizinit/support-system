-- Add resolution observation field to tickets table
ALTER TABLE tickets 
ADD COLUMN resolution_observation TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN tickets.resolution_observation IS 'Observação obrigatória preenchida quando o ticket é resolvido';
