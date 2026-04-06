# Implementação de Controle de Acesso (RBAC)

## 1. Banco de Dados (SQL)
- [ ] Criar tabela de `grupos_acesso` com RLS por escritório.
- [ ] Criar tabela de `permissoes`.
- [ ] Criar tabela de `grupo_permissoes`.
- [ ] Adicionar coluna `grupo_acesso_id` na tabela `Jur_Usuarios`.
- [ ] Definir restrições, foreign keys e índices.
- [ ] Gerar inserts iniciais para organizar por módulo (Dashboard, Clientes, Processos, Prazos, CRM, Configurações) com níveis (visualizar, editar, gerenciar).
- [ ] Definir RLS para isolamento de tenants (`escritorio_id`).
- [ ] Lidar com a migração: Atribuir um grupo "Administrador" padrão para usuários existentes, evitando bloqueios na base atual.

## 2. Frontend (React + TypeScript)
- [ ] Criar botão e estrutura básica da aba "Gestão de Acessos" em `Configuracoes`.
- [ ] Criar componente `AcessosTab.tsx`.
- [ ] Bloco 1: Lista de Grupos de Acesso (nome, descrição, status, quantidade de usuários, ações + botão Novo Grupo).
- [ ] Bloco 2: Permissões do Grupo (checkboxes independentes por módulo e nível).
- [ ] Integrar com Supabase API para leitura e escrita (fetch/salvamento das permissões).
- [ ] Respeitar design clean e os padrões descritos.
