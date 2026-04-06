-- ======================================================
-- SCRIPT PARA LIBERAÇÃO TOTAL DAS DATAS (Jur_Prazos)
-- ======================================================
-- Este script realiza 3 ações cruciais:
-- 1. Remove a obrigatoriedade da coluna 'data_fatal' (permite NULL)
-- 2. Remove a trava de comparação entre data fatal e data final
-- 3. Remove a restrição antiga de validação de datas (chk_datas)

DO $$ 
BEGIN
    -- 1. Alterar a coluna data_fatal para permitir valores nulos (NULL)
    ALTER TABLE public."Jur_Prazos" ALTER COLUMN data_fatal DROP NOT NULL;

    -- 2. Remover a constraint que exige que Data Fatal seja maior que a Final
    ALTER TABLE public."Jur_Prazos" DROP CONSTRAINT IF EXISTS jur_prazos_data_fatal_gte_data_final;

    -- 3. Remover a constraint genérica de validação (se ainda existir)
    ALTER TABLE public."Jur_Prazos" DROP CONSTRAINT IF EXISTS jur_prazos_chk_datas;

    RAISE NOTICE 'Restrições de data removidas com sucesso da tabela Jur_Prazos.';
END $$;
