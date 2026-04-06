-- ==========================================
-- SCRIPT PARA ADICIONAR NOVAS PERMISSÕES GRANULARES
-- ==========================================

INSERT INTO public.permissoes (modulo, chave, nome, descricao) VALUES 
-- Clientes (Modais e Exclusão)
('Clientes', 'clientes.visualizar_modal', 'visualizar modal', 'Permite visualizar as informações dentro do modal do cliente'),
('Clientes', 'clientes.editar_modal', 'editar modal', 'Permite editar as informações dentro do modal do cliente'),
('Clientes', 'clientes.excluir', 'excluir', 'Permite excluir registros de clientes do sistema'),

-- Processos (Modais e Exclusão)
('Processos', 'processos.visualizar_modal', 'visualizar modal', 'Permite visualizar as informações detalhadas no modal do processo'),
('Processos', 'processos.editar_modal', 'editar modal', 'Permite editar as informações e abas dentro do modal do processo'),
('Processos', 'processos.excluir', 'excluir', 'Permite excluir registros de processos do sistema')

ON CONFLICT (chave) DO NOTHING;
