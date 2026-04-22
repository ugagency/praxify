-- =========================================================
-- Função para Administradores Redefinirem Senha de Usuários
-- =========================================================

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1) Verificar se quem está chamando a função (auth.uid) é um ADMIN na tabela Jur_Usuarios
  IF NOT EXISTS (
    SELECT 1 FROM public."Jur_Usuarios" 
    WHERE id = auth.uid() 
      AND role = 'ADMIN'
      AND ativo = true
  ) THEN
    -- Se não for ADMIN (ou a conta estiver inativada), rejeitamos a ação
    RAISE EXCEPTION 'Ação bloqueada: Apenas administradores ativos podem redefinir senhas.';
  END IF;

  -- 2) Atualizar a senha (encrypted_password) na tabela principal de autenticação do Supabase (auth.users)
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_user_id;
  
  -- Se o usuário não existir na auth.users, nada será atualizado
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuário alvo não encontrado no Auth.';
  END IF;

END;
$$;
