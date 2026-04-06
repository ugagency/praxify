# PRAXIFY - Inteligência Jurídica & CRM

O PRAXIFY é um sistema Paralegal Digital focado no controle automatizado de processos jurídicos, gestão de prazos (com suporte a inteligência artificial para sumarização processual) e CRM voltado para escritórios de advocacia.

A aplicação foi projetada como uma **Single-Page Application (SPA)** moderna, separando de forma clara o código-fonte (Frontend e integrações de serviço) da infraestrutura de deploy do servidor.

---

## 🛠 Arquitetura e Estrutura Técnica

O repositório adota a separação padrão de projeto (infraestrutura na raiz e software na subpasta raiz da aplicação):

```text
/
├── app/                      # 👉 Código-fonte da aplicação Frontend (SPA)
│   ├── public/               # Assets estáticos (imagens, arquivos base)
│   ├── src/                  # Diretório principal de desenvolvimento
│   │   ├── core/             # Estado Global (Store), Configurações e Roteador SPA
│   │   ├── services/         # Integrações com backend (ex: Supabase, Inteligência Artificial)
│   │   ├── styles/           # CSS unificado
│   │   └── views/            # Telas da aplicação componentizadas em HTML/JS (Dashboard, Prazos, CRM...)
│   ├── index.html            # Landing Page
│   ├── package.json          # Dependências do NodeJS (Vite)
│   └── vite.config.js        # Configuração do Bundler/Dev Server
│
├── arquivos_olds/            # Backup de componentes obsoletos da arquitetura legada
├── docker-compose.yml        # Orquestrador de contêineres para Produção
├── Dockerfile                # Imagem do servidor Nginx contendo a aplicação otimizada
├── nginx.conf                # Configuração do Nginx (Fallbacks de SPA para Production)
└── deploy_nginx.sh           # Script de setup de certificado SSL e proxy-reverso para produção real
```

**Principais Tecnologias (Stack)**
- **UI / Core:** HTML5, CSS Nativo, Vanilla JavaScript (ES Modules).
- **Tooling:** Vite (Bundler, Dev Server e Optimization).
- **Roteamento:** Roteador SPA Próprio injetando views via `fetch()` (Dynamic DOM Injection) a partir do arquivo root (`src/index.html`).
- **Autenticação & Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Produção (Infra):** Nginx & Docker.

---

## 🚀 Como Rodar a Aplicação

A aplicação possui dois fluxos distintos dependendo do seu objetivo.

### 1️⃣ Ambiente de Desenvolvimento (Vite / Local)
Indicado para programar, alterar telas ou modificar lógicas JavaScript com recarregamento rápido (Hot Module Replacement).

**Pré-requisitos:** Ter o [Node.js](https://nodejs.org/) instalado.

1. Abra o Terminal e **entre na pasta de código-fonte**:
   ```bash
   cd app
   ```
2. Instale as dependências caso seja a primeira vez:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. A aplicação estará rodando no endereço: `http://localhost:3000/`.

*Dica:* Em modo local, caso deseje testar sem internet/banco de dados real, você pode ativar o `CONFIG.DEBUG = true` dentro do arquivo `app/src/core/config.js`.

---

### 2️⃣ Ambiente de Produção (Docker Nginx)
Indicado para testar como o sistema rodará em um servidor live ou para efetuar o deploy nativo conteinerizado.

**Pré-requisitos:** Ter o [Docker](https://www.docker.com/) e [Docker Compose] instalados.

1. Permaneça na **pasta raiz** do repositório (fora do `app/`).
2. Execute o orquestrador para fazer o build e levantar o servidor (em background use o `-d`):
   ```bash
   docker-compose up --build -d
   ```
3. O Docker lerá as configurações, pegará todos os arquivos estáveis do frontend dentro de `app/` e os colocará num servidor Nginx local.
4. A aplicação de produção estará acessível via porta mapeada no `docker-compose`, ex: `http://localhost:5005/` (ou qual for a porta definida no host).

**Atenção Nginx/SPA**: Nessa infraestrutura do Docker, regras customizadas do arquivo `nginx.conf` já são injetadas. Elas impedem erros "404" e resolvem links limpos nativamente redirecionando o escopo estático ao roteador interno do index (ex: acessar `/prazos` carregará a tela de prazos pelo JS ao invés de procurar uma subpasta que não existe).

---

## 🧩 Funcionalidades Principais

* **Modo Bypass Integrado:** Possibilidade de rodar a SPA e gerar massa de dados mocados (processos fantasma) via `CONFIG.DEBUG`, poupando chamadas a APIs pagas durante desenvolvimentos paralelos.
* **Componentização via Fetch:** Renderização levíssima injetando trechos da View e destruindo contextos prévios quando o navegador troca de página sem emitir Reload.
* **Painel Inteligente (Dashboard):** Métricas totalizadoras em cards atrelados ao estado global do usuário.
* **Kanban CRM Jurídico:** Tela de arrastar-e-soltar para tickets de captação e relacionamento com chumbo/lead.
* **Leitor de IA (Mock)**: Interação de upload processual na tela de Processos permitindo gerar resumos a partir de IA na estrutura base.
