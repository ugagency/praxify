-- ==========================================
-- SCRIPT PARA REMOVER OBRIGATORIEDADE DE DATAS
-- ==========================================
-- A tabela Jur_Prazos possui uma constraint que impede a
-- inserção de dados caso as datas não sejam preenchidas.
-- Vamos remover essa validação para permitir nulos.

DO $$ 
BEGIN
    ALTER TABLE public."Jur_Prazos" DROP CONSTRAINT IF EXISTS jur_prazos_chk_datas;
END $$;
