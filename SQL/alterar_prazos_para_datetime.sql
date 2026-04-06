-- ==========================================
-- SCRIPT PARA ALTERAR COLUNAS DE DATA EM COMPROMISSOS/PRAZOS
-- ==========================================
-- A tabela Jur_Prazos possui as colunas data_fatal e data_final
-- que atualmente podem estar no formato DATE. Vamos alterá-las 
-- para o tipo TIMESTAMP WITH TIME ZONE para salvar data e hora.

DO $$ 
BEGIN
    -- Altera o tipo de data_fatal para TIMESTAMPTZ (mantendo os dados existentes)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Jur_Prazos' AND column_name = 'data_fatal'
    ) THEN
        ALTER TABLE public."Jur_Prazos" 
        ALTER COLUMN data_fatal TYPE TIMESTAMP WITH TIME ZONE 
        USING data_fatal::TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Altera o tipo de data_final para TIMESTAMPTZ (mantendo os dados existentes)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Jur_Prazos' AND column_name = 'data_final'
    ) THEN
        ALTER TABLE public."Jur_Prazos" 
        ALTER COLUMN data_final TYPE TIMESTAMP WITH TIME ZONE 
        USING data_final::TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;
