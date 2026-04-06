-- ================================================
-- CORREÇÃO DO SCRIPT RBAC (RLS E ESCRITORIO_ID)
-- ================================================

-- 1. Como a tabela "grupos_acesso" foi criada originalmente com escritorio_id como UUID,
-- precisamos alterar essa coluna para BIGINT para bater com o "Jur_Usuarios".
-- (Se a tabela já tiver dados e não puder fazer casting, o melhor é dropar e recriar, 
--  mas assumiremos que a tabela está vazia ou usaremos USING)
ALTER TABLE public.grupos_acesso ALTER COLUMN escritorio_id TYPE BIGINT USING NULL;

-- 2. Recriar a Função de identificação do escritório
DROP FUNCTION IF EXISTS public.get_user_escritorio_id();

CREATE OR REPLACE FUNCTION public.get_user_escritorio_id()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT escritorio_id::bigint FROM public."Jur_Usuarios" WHERE id = auth.uid() LIMIT 1;
$$;


-- 3. Recriar as Políticas (Policies) da tabela grupos_acesso
-- (Caso as políticas tenham sido parcialmente criadas e deram erro na última, 
--  nós dropamos caso existam (opcional, já que no seu caso elas deram erro e não criaram, 
--  mas é uma boa prática)).
DROP POLICY IF EXISTS "Ver grupos do proprio escritorio" ON public.grupos_acesso;
DROP POLICY IF EXISTS "Inserir grupos no proprio escritorio" ON public.grupos_acesso;
DROP POLICY IF EXISTS "Atualizar grupos do proprio escritorio" ON public.grupos_acesso;

CREATE POLICY "Ver grupos do proprio escritorio" 
ON public.grupos_acesso FOR SELECT USING (escritorio_id = public.get_user_escritorio_id());

CREATE POLICY "Inserir grupos no proprio escritorio" 
ON public.grupos_acesso FOR INSERT WITH CHECK (escritorio_id = public.get_user_escritorio_id());

CREATE POLICY "Atualizar grupos do proprio escritorio" 
ON public.grupos_acesso FOR UPDATE USING (escritorio_id = public.get_user_escritorio_id());


-- 4. Recriar a Política da tabela grupo_permissoes
DROP POLICY IF EXISTS "Vínculos visiveis do proprio escritorio" ON public.grupo_permissoes;

CREATE POLICY "Vínculos visiveis do proprio escritorio" 
ON public.grupo_permissoes FOR ALL USING (
  grupo_id IN (SELECT id FROM public.grupos_acesso WHERE escritorio_id = public.get_user_escritorio_id())
);

-- FIM DA CORREÇÃO
