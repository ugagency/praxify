-- ==========================================
-- GESTÃO DE ACESSOS (RBAC) - POSTGRESQL
-- ==========================================
-- Tabelas: grupos_acesso, permissoes, grupo_permissoes
-- Alteração: Tabela Jur_Usuarios

-- 1. Criação da Tabela de Grupos de Acesso
CREATE TABLE IF NOT EXISTS public.grupos_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escritorio_id BIGINT NOT NULL, -- Corrigido para BIGINT para mapear Jur_Escritorios
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(50) DEFAULT 'ativo', -- 'ativo' ou 'inativo'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Criação da Tabela de Permissões Catálogo
-- Esta tabela guarda todas as permissões possíveis no sistema
CREATE TABLE IF NOT EXISTS public.permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modulo VARCHAR(100) NOT NULL, -- Ex: 'dashboard', 'clientes', 'processos', etc.
    chave VARCHAR(100) NOT NULL UNIQUE, -- Ex: 'dashboard.visualizar'
    nome VARCHAR(100) NOT NULL, -- Ex: 'Visualizar', 'Editar', 'Gerenciar'
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Criação da Tabela de Vínculo: Grupo x Permissões
CREATE TABLE IF NOT EXISTS public.grupo_permissoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grupo_id UUID NOT NULL REFERENCES public.grupos_acesso(id) ON DELETE CASCADE,
    permissao_id UUID NOT NULL REFERENCES public.permissoes(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(grupo_id, permissao_id) -- Impede que um grupo tenha a mesma permissão duplicada
);

-- 4. Adicionar a coluna grupo_acesso_id em Jur_Usuarios
-- Caso a coluna já exista, essa alteração em PostgreSQL ignorará se usarmos IF NOT EXISTS ou precisamos fazer um bloco DO
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Jur_Usuarios' AND column_name = 'grupo_acesso_id') THEN
        ALTER TABLE public."Jur_Usuarios" ADD COLUMN grupo_acesso_id UUID REFERENCES public.grupos_acesso(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Criação de Índices para performance
CREATE INDEX IF NOT EXISTS idx_grupos_acesso_escritorio ON public.grupos_acesso(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_permissoes_modulo ON public.permissoes(modulo);
CREATE INDEX IF NOT EXISTS idx_jur_usuarios_grupo ON public."Jur_Usuarios"(grupo_acesso_id);

-- ==========================================
-- 6. Populando a Tabela de Permissões
-- ==========================================
INSERT INTO public.permissoes (modulo, chave, nome, descricao) VALUES 
-- Dashboard
('Dashboard', 'dashboard.visualizar', 'visualizar', 'Permite visualizar dados e gráficos do dashboard'),

-- Clientes
('Clientes', 'clientes.visualizar', 'visualizar', 'Permite visualizar a lista e detalhes de clientes'),
('Clientes', 'clientes.editar', 'editar', 'Permite cadastrar e alterar dados de clientes'),
('Clientes', 'clientes.gerenciar', 'gerenciar', 'Permite arquivar, excluir e ter controle total dos clientes'),

-- Processos
('Processos', 'processos.visualizar', 'visualizar', 'Permite consultar processos do escritório'),
('Processos', 'processos.editar', 'editar', 'Permite cadastrar ou atualizar andamentos e processos'),
('Processos', 'processos.gerenciar', 'gerenciar', 'Permite exclusão e controle total de processos'),

-- Prazos
('Prazos', 'prazos.visualizar', 'visualizar', 'Permite visualizar o calendário de prazos'),
('Prazos', 'prazos.editar', 'editar', 'Permite concluir ou remarcar prazos'),
('Prazos', 'prazos.gerenciar', 'gerenciar', 'Controle total, exclusão ou reatribuição de prazos a outros'),

-- CRM
('CRM', 'crm.visualizar', 'visualizar', 'Permite visualizar funil e leads'),
('CRM', 'crm.editar', 'editar', 'Permite mover leads e atualizar oportunidades'),
('CRM', 'crm.gerenciar', 'gerenciar', 'Permite configurar etapas do funil e excluir deals'),

-- Configurações
('Configuracoes', 'configuracoes.visualizar', 'visualizar', 'Permite ver configurações gerais do escritório'),
('Configuracoes', 'configuracoes.equipe', 'gerenciar equipe', 'Permite convidar e inativar membros da equipe'),
('Configuracoes', 'configuracoes.acessos', 'gerenciar acessos', 'Permite criar grupos e alterar permissões (RBAC)')
ON CONFLICT (chave) DO NOTHING;

-- ==========================================
-- 7. RLS (Row Level Security) - SUPABASE
-- ==========================================
-- Ativar RLS
ALTER TABLE public.grupos_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupo_permissoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- A tabela de permissões é estática e todos podem ver
CREATE POLICY "Permissoes visiveis para usuarios autenticados" 
ON public.permissoes FOR SELECT USING (auth.role() = 'authenticated');

-- Grupos de Acesso: O usuário só pode ver/editar grupos do mesmo escritório
-- Nota: Aqui estamos assumindo que há uma forma de saber o escritório do usuário (ex: auth.jwt()->>'escritorio_id' ou join na tabela de usuarios)
-- Exemplo de politica basica caso vc use um RPC `get_user_escritorio_id()` no Supabase
-- A função de pegar escritório retorna BIGINT pois em Jur_Usuarios escritorio_id é int8 (BIGINT)
CREATE OR REPLACE FUNCTION public.get_user_escritorio_id()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT escritorio_id::bigint FROM public."Jur_Usuarios" WHERE id = auth.uid() LIMIT 1;
$$;

CREATE POLICY "Ver grupos do proprio escritorio" 
ON public.grupos_acesso FOR SELECT USING (escritorio_id = public.get_user_escritorio_id());

CREATE POLICY "Inserir grupos no proprio escritorio" 
ON public.grupos_acesso FOR INSERT WITH CHECK (escritorio_id = public.get_user_escritorio_id());

CREATE POLICY "Atualizar grupos do proprio escritorio" 
ON public.grupos_acesso FOR UPDATE USING (escritorio_id = public.get_user_escritorio_id());

-- Grupo_permissoes acompanha as mesmas regras do grupo_id correspondente
CREATE POLICY "Vínculos visiveis do proprio escritorio" 
ON public.grupo_permissoes FOR ALL USING (
  grupo_id IN (SELECT id FROM public.grupos_acesso WHERE escritorio_id = public.get_user_escritorio_id())
);

-- ==========================================
-- 8. TRIGGER DE UPDATED_AT
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_grupos_acesso_updated_at
BEFORE UPDATE ON public.grupos_acesso
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
