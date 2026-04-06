-- ==============================================================
-- SCRIPT: CONCEDER ACESSO ADMINISTRATIVO TOTAL AO USUÁRIO 
-- Usuário: Dudu (0e342b49-10dd-4fc5-8280-cc75350352da)
-- ==============================================================

DO $$
DECLARE
    -- ID do usuário informado
    v_user_id UUID := '0e342b49-10dd-4fc5-8280-cc75350352da';
    -- Escritório do usuário informado
    v_escritorio_id BIGINT := 1;
    -- Variável para guardar o ID do grupo
    v_grupo_id UUID;
BEGIN
    -- 1. Verifica se já existe um grupo "Administradores" para este escritório
    SELECT id INTO v_grupo_id 
    FROM public.grupos_acesso 
    WHERE nome = 'Administradores' AND escritorio_id = v_escritorio_id 
    LIMIT 1;
    
    -- 2. Se o grupo não existir, vamos criá-lo
    IF v_grupo_id IS NULL THEN
        INSERT INTO public.grupos_acesso (escritorio_id, nome, descricao, status)
        VALUES (v_escritorio_id, 'Administradores', 'Acesso total ao sistema (RBAC)', 'ativo')
        RETURNING id INTO v_grupo_id;
    END IF;

    -- 3. Vincular TODAS as permissões do sistema a este grupo Administradores
    -- (O "ON CONFLICT" evita erro caso você rode o script duas vezes)
    INSERT INTO public.grupo_permissoes (grupo_id, permissao_id)
    SELECT v_grupo_id, id FROM public.permissoes
    ON CONFLICT (grupo_id, permissao_id) DO NOTHING;

    -- 4. Atualizar o usuário Dudu:
    --    a) Vinculando ele ao grupo de acesso recém-criado
    --    b) (Opcional/Recomendado) Mudando a "role" legada para ADMIN
    UPDATE public."Jur_Usuarios"
    SET 
        grupo_acesso_id = v_grupo_id,
        role = 'ADMIN'
    WHERE id = v_user_id;

END $$;
