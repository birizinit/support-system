-- Add new allowed status 'em_analise' to tickets.status CHECK constraint

DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'tickets'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%IN%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE tickets DROP CONSTRAINT %I', constraint_name);
    END IF;

    -- Recreate the CHECK constraint including the new value 'em_analise'
    ALTER TABLE tickets
    ADD CONSTRAINT tickets_status_check
    CHECK (status IN ('aberto', 'em_analise', 'em_andamento', 'aguardando', 'resolvido', 'fechado'));
END $$;

