# Guia de Uso da Plataforma PRAXIFY

> **Bem-vindo(a) ao PRAXIFY!** Este guia apresenta cada tela do sistema com orientações práticas para o uso no dia a dia — desde o primeiro acesso até a geração de petições por Inteligência Artificial.

---

## Índice de Telas

| # | Tela | Seção |
|---|------|-------|
| 01 | [Login / Acesso](#tela-01--login--acesso) | Autenticação |
| 02 | [Dashboard](#tela-02--dashboard) | Painel Principal |
| 03 | [Dashboard — Novo Compromisso](#tela-03--dashboard--modal-novo-compromisso) | Painel Principal |
| 04 | [Clientes — Lista](#tela-04--clientes--lista) | Gestão de Clientes |
| 05 | [Clientes — Modal: Dados](#tela-05--clientes--modal-dados) | Gestão de Clientes |
| 06 | [Clientes — Modal: Acolhimento](#tela-06--clientes--modal-acolhimento) | Gestão de Clientes |
| 07 | [Clientes — Modal: Documentos](#tela-07--clientes--modal-documentos) | Gestão de Clientes |
| 08 | [Clientes — Modal: Gerador de Petição](#tela-08--clientes--modal-gerador-de-petição) | Gestão de Clientes |
| 09 | [Processos — Lista](#tela-09--processos--lista) | Gestão de Processos |
| 10 | [Processos — Modal: Novo Processo](#tela-10--processos--modal-novo-processo) | Gestão de Processos |
| 11 | [Processos — Modal: Acolhimento](#tela-11--processos--modal-acolhimento) | Gestão de Processos |
| 12 | [Processos — Detalhe do Processo](#tela-12--processos--detalhe-do-processo) | Gestão de Processos |
| 13 | [Prazos — Lista](#tela-13--prazos--lista) | Controle de Prazos |
| 14 | [CRM — Kanban](#tela-14--crm--kanban) | Relacionamento |
| 15 | [Configurações — Escritório](#tela-15--configurações--aba-escritório) | Administração |
| 16 | [Configurações — Identidade](#tela-16--configurações--aba-identidade) | Administração |
| 17 | [Configurações — Equipe](#tela-17--configurações--aba-equipe) | Administração |
| 18 | [Configurações — Gestão de Acessos](#tela-18--configurações--aba-gestão-de-acessos) | Administração |

---

## AUTENTICAÇÃO

---

### Tela 01 — Login / Acesso

**O que é:** Porta de entrada segura da plataforma. O usuário informa suas credenciais para acessar o sistema do escritório.

**Elementos principais:**
- Campo de e-mail
- Campo de senha
- Botão **Entrar**
- Link **Criar Conta** (primeiro acesso)

**Fluxo:**
1. Acesse o link oficial do seu escritório.
2. Informe seu **E-mail** e **Senha**.
3. Clique em **Entrar**.

> _Dica: Na primeira vez, clique em "Criar Conta" para se registrar._

---

**📷 Print da Tela:**

<!-- Cole aqui o print da tela de Login -->

---

## PAINEL PRINCIPAL

---

### Tela 02 — Dashboard

**O que é:** Visão geral e operacional do escritório. Centraliza compromissos, prazos urgentes e o calendário dinâmico.

**Elementos principais:**
- **Barra de busca** — pesquisa compromissos em tempo real
- **Filtros de Mês / Ano** — inclui filtro inteligente "Exibindo apenas meses com eventos"
- **Botão `+ Novo Compromisso`** — abre modal para agendar prazo/evento
- **Calendário Dinâmico** — exibe compromissos por dia com navegação entre modos (Mês, Semana, Dia, Agenda)
- **Painel de Urgências** — lista abaixo do calendário com prazos vencidos ou críticos

**Lógica de cores do calendário:**
| Cor | Significado |
|-----|-------------|
| 🔵 Azul-ciano | Prazo dentro do prazo, não concluído |
| 🔴 Vermelho | Prazo com data fatal vencida e não concluído |
| 🟢 Verde | Prazo marcado como "Feito" |

---

**📷 Print da Tela:**

<!-- Cole aqui o print da tela do Dashboard (visão geral do calendário) -->

---

### Tela 03 — Dashboard — Modal: Novo Compromisso

**O que é:** Formulário rápido para agendar um novo prazo ou evento diretamente pelo Dashboard.

**Elementos principais:**
- Campo de título / tarefa
- Seletor de data fatal
- Seletor de responsável
- Botão **Salvar**

---

**📷 Print da Tela:**

<!-- Cole aqui o print do modal de Novo Compromisso -->

---

## GESTÃO DE CLIENTES

---

### Tela 04 — Clientes — Lista

**O que é:** Listagem de todos os clientes cadastrados no escritório com ferramentas de busca e ações rápidas.

**Elementos principais:**
- Tabela de clientes (Nome, CPF/CNPJ, ações)
- **Barra de busca** por nome ou documento
- **Botão `+ Novo Cliente`**
- Paginação

**Fluxo para cadastrar:**
1. Clique em **Clientes** no menu lateral.
2. Clique em **+ Novo Cliente**.
3. Preencha o formulário (ver Tela 05).

---

**📷 Print da Tela:**

<!-- Cole aqui o print da tela de listagem de Clientes -->

---

### Tela 05 — Clientes — Modal: Dados

**O que é:** Aba principal do cadastro de cliente com os dados de identificação.

**Elementos principais:**
- Campo **Nome Completo** (obrigatório)
- Campo **CPF ou CNPJ** (opcional, formatado automaticamente)
- Botão **Salvar**

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Dados do modal de Cliente -->

---

### Tela 06 — Clientes — Modal: Acolhimento

**O que é:** Aba para registro do relato inicial e anotações do primeiro contato com o cliente.

**Elementos principais:**
- Campo de texto livre para relato de acolhimento
- Suporte a transcrições e notas de reunião
- Informação utilizada pela IA na geração de petições

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Acolhimento do modal de Cliente -->

---

### Tela 07 — Clientes — Modal: Documentos

**O que é:** Aba para upload e gerenciamento de documentos vinculados ao cliente (contratos, RG, procurações, etc.).

**Elementos principais:**
- Lista de documentos anexados
- Botão de upload de arquivo
- Ações: visualizar / remover

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Documentos do modal de Cliente -->

---

### Tela 08 — Clientes — Modal: Gerador de Petição

**O que é:** Aba com acesso direto ao gerador de petição por IA vinculado ao cliente selecionado.

**Elementos principais:**
- Campo **FATOS / BASE PARA ELABORAÇÃO**
- Botão **🚀 GERAR AGORA**
- Painel de exibição da minuta gerada
- Botões **📋 Copiar Texto** e **💾 Salvar em Documentos**

> _A IA usa os dados de acolhimento do cliente como base. Quanto mais detalhado o relato, mais rica a petição gerada._

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Gerador de Petição do modal de Cliente -->

---

## GESTÃO DE PROCESSOS

---

### Tela 09 — Processos — Lista

**O que é:** Listagem de todos os processos/casos judiciais do escritório com filtros avançados.

**Elementos principais:**
- Tabela de processos (Título, Cliente, Status, Comarca, ações)
- **Filtros** por status, data, cliente e comarca
- **Barra de busca** com suporte a voz (speech recognition)
- **Botão `+ Novo Processo`**

---

**📷 Print da Tela:**

<!-- Cole aqui o print da tela de listagem de Processos -->

---

### Tela 10 — Processos — Modal: Novo Processo

**O que é:** Formulário para criação de um novo processo judicial vinculado a um cliente.

**Elementos principais:**
- Campo de busca de **Cliente** (auto-complete)
- Campo **Título do Processo**
- Seletor de **Status** inicial
- Campo **Comarca**
- Botão **Salvar**

---

**📷 Print da Tela:**

<!-- Cole aqui o print do modal de Novo Processo -->

---

### Tela 11 — Processos — Modal: Acolhimento

**O que é:** Modal para registrar o relato inicial de acolhimento vinculado a um processo específico.

**Elementos principais:**
- Campo de texto para relato e fatos do caso
- Vinculação automática ao processo selecionado
- Base de dados usada pela IA estratégica

---

**📷 Print da Tela:**

<!-- Cole aqui o print do modal de Acolhimento do Processo -->

---

### Tela 12 — Processos — Detalhe do Processo

**O que é:** Visão completa e operacional de um processo específico. Concentra todas as informações, documentos, prazos e ações do caso.

**Elementos principais:**

| Card | Conteúdo |
|------|----------|
| **Cabeçalho** | Título, status, comarca e ações rápidas |
| **Dados do Processo** | Informações jurídicas principais |
| **Dados do Cliente** | Identificação e contato do cliente vinculado |
| **Ações** | Botões de ação (incluindo **⚡ Gerar Petição IA**) |
| **Prazos** | Prazos vinculados ao processo |
| **Documentos** | Arquivos e petições anexadas |
| **Timeline** | Linha do tempo com eventos, reuniões e anotações |

**Fluxo para gerar petição:**
1. Abra o processo desejado.
2. Clique em **⚡ Gerar Petição IA**.
3. Preencha os fatos no campo de base (mín. 20 caracteres).
4. Clique em **🚀 GERAR AGORA**.
5. Copie ou salve a minuta gerada.

---

**📷 Print da Tela — Visão Geral:**

<!-- Cole aqui o print da tela de Detalhe do Processo (visão completa) -->

---

**📷 Print da Tela — Gerador de Petição IA:**

<!-- Cole aqui o print do painel de Geração de Petição IA aberto -->

---

## CONTROLE DE PRAZOS

---

### Tela 13 — Prazos — Lista

**O que é:** Tabela centralizada de todos os prazos do escritório com alertas visuais de urgência e vencimento.

**Elementos principais:**
- Tabela de prazos (Título, Data Fatal, Status, Responsável, Processo)
- **Filtros** por status e intervalo de datas
- Indicadores visuais de urgência (vencido / próximo / concluído)
- **Botão `+ Novo Prazo`**
- Paginação

**Lógica de status:**
| Status | Situação |
|--------|----------|
| ✅ Feito | Tarefa concluída |
| ⏳ Pendente | Dentro do prazo |
| 🔴 Vencido | Data fatal ultrapassada |

---

**📷 Print da Tela:**

<!-- Cole aqui o print da tela de listagem de Prazos -->

---

## RELACIONAMENTO COM CLIENTES (CRM)

---

### Tela 14 — CRM — Kanban

**O que é:** Painel visual de arrastar e soltar para acompanhar leads e oportunidades de captação do escritório.

**Elementos principais:**
- Colunas de estágio do funil (ex: Novo Lead, Em Contato, Proposta, Fechado)
- Cards de leads com informações de contato
- Ação de mover cards entre estágios via drag-and-drop
- Botão para adicionar novo lead/oportunidade

---

**📷 Print da Tela:**

<!-- Cole aqui o print da tela do CRM (Kanban) -->

---

## ADMINISTRAÇÃO

---

### Tela 15 — Configurações — Aba: Escritório

**O que é:** Configurações gerais do escritório (dados institucionais, endereço, contato).

**Elementos principais:**
- Campos de dados do escritório (Razão Social, CNPJ, Endereço)
- Botão **Salvar**

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Escritório em Configurações -->

---

### Tela 16 — Configurações — Aba: Identidade

**O que é:** Personalização visual do escritório na plataforma (logotipo, cores, identidade da marca).

**Elementos principais:**
- Upload de logotipo
- Configurações de identidade visual
- Botão **Salvar**

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Identidade em Configurações -->

---

### Tela 17 — Configurações — Aba: Equipe

**O que é:** Gestão dos usuários/membros do escritório vinculados à conta.

**Elementos principais:**
- Lista de usuários com nome, e-mail e perfil
- Botão para **Convidar Membro**
- Ações: editar perfil / remover usuário

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Equipe em Configurações -->

---

### Tela 18 — Configurações — Aba: Gestão de Acessos

**O que é:** Controle de permissões por grupo (RBAC). Define quais módulos e ações cada perfil de usuário pode acessar.

**Elementos principais:**
- **Lista de Grupos de Acesso** (nome, descrição, nº de usuários, status)
- **Botão `+ Novo Grupo`**
- **Painel de Permissões do Grupo** — checkboxes por módulo (Dashboard, Clientes, Processos, Prazos, CRM, Configurações) e por nível (Visualizar, Editar, Gerenciar)
- Botão **Salvar Permissões**

---

**📷 Print da Tela:**

<!-- Cole aqui o print da aba Gestão de Acessos em Configurações -->

---

*Guia atualizado em: Abril/2026 — Versão 2.0*
