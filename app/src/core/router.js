// =============================================
// ROUTER - PRAXIFY
// Sistema de rotas SPA (Single Page Application)
// =============================================

import { debug } from './config.js';
import { setCurrentView } from './state.js';

// =============================================
// CONFIGURAÇÃO DE ROTAS
// =============================================

const routes = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/prazos': 'prazos',
    '/processos': 'processos',
    '/processo/:id': 'processo-detalhe',
    '/clientes': 'clientes',
    '/crm': 'crm',
    '/config': 'config'
};

let currentRoute = null;
let currentParams = {};

// =============================================
// NAVEGAÇÃO
// =============================================

/**
 * Navega para uma rota
 */
export function navigate(path, pushState = true) {
    debug('Navigating to:', path);

    // Atualizar URL sem recarregar página
    if (pushState) {
        window.history.pushState({}, '', path);
    }

    // Encontrar rota correspondente
    const { route, params } = matchRoute(path);

    if (!route) {
        debug('Rota não encontrada:', path);
        showNotFound();
        return;
    }

    currentRoute = route;
    currentParams = params;

    // Renderizar view
    renderView(route, params);

    // Atualizar state
    setCurrentView(route);

    // Atualizar menu ativo
    updateActiveMenu(route);
}

/**
 * Volta para página anterior
 */
export function goBack() {
    window.history.back();
}

/**
 * Vai para próxima página
 */
export function goForward() {
    window.history.forward();
}

// =============================================
// MATCHING DE ROTAS
// =============================================

/**
 * Encontra rota que corresponde ao path
 */
const BASE_PATH = '/src/index.html';

/**
 * Encontra rota que corresponde ao path
 */
function matchRoute(path) {
    // Normalizar path (remover base path e trailing slash)
    let normalizedPath = path;

    if (normalizedPath.startsWith(BASE_PATH)) {
        normalizedPath = normalizedPath.substring(BASE_PATH.length);
    }

    // Garantir que começa com /
    if (!normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
    }

    // Remover trailing slash se não for raiz
    if (normalizedPath.length > 1 && normalizedPath.endsWith('/')) {
        normalizedPath = normalizedPath.slice(0, -1);
    }

    // Debug
    // debug('Matching route:', path, '->', normalizedPath);

    // Tentar match exato primeiro
    if (routes[normalizedPath]) {
        return { route: routes[normalizedPath], params: {} };
    }

    // Tentar match com parâmetros
    for (const [pattern, route] of Object.entries(routes)) {
        const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$');
        const match = normalizedPath.match(regex);

        if (match) {
            // Extrair nomes dos parâmetros
            const paramNames = (pattern.match(/:[^/]+/g) || []).map(p => p.slice(1));

            // Criar objeto de parâmetros
            const params = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });

            return { route, params };
        }
    }

    return { route: null, params: {} };
}

// =============================================
// RENDERIZAÇÃO
// =============================================

/**
 * Renderiza a view correspondente à rota
 */
async function renderView(view, params) {
    debug('Rendering view:', view, params);

    const appRoot = document.getElementById('app-root');
    if (!appRoot) {
        console.error('App root element (#app-root) not found.');
        return;
    }

    try {
        // Obter o template da View via Fetch 
        // Em um setup de build real do Vite usando public/ ou src/ poderíamos precisar resolver aliases.
        // Aqui assumimos a estrutura em src/views/[view]/[view].html
        const response = await fetch(`/src/views/${view}/${view}.html`);
        if (!response.ok) {
            throw new Error(`Failed to to load template for view: ${view}`);
        }

        const html = await response.text();
        appRoot.innerHTML = html;

        // Atualizar topbar
        updateTopbar(view);

        // Disparar evento customizado para controllers específicos
        // Necessário enviar logo após injetar o DOM para eles poderem rodar os Document.getElementById locais
        window.dispatchEvent(new CustomEvent('viewChanged', {
            detail: { view, params }
        }));

    } catch (err) {
        console.error('Erro ao renderizar view: ', err);
        appRoot.innerHTML = `<div style="padding:2rem;color:red;"><h3>Erro ao carregar a página</h3><p>${err.message}</p></div>`;
    }
}

/**
 * Atualiza topbar com título da página
 */
function updateTopbar(view) {
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');

    if (!title || !subtitle) return;

    const titles = {
        'dashboard': {
            title: 'Visão Geral',
            subtitle: 'Painel de controle do escritório'
        },
        'prazos': {
            title: 'Dashboard de Prazos',
            subtitle: 'Controle avançado de prazos jurídicos'
        },
        'processos': {
            title: 'Processos',
            subtitle: 'Gestão completa de processos jurídicos'
        },
        'processo-detalhe': {
            title: 'Detalhes do Processo',
            subtitle: 'Linha do tempo, prazos e documentos do caso'
        },
        'clientes': {
            title: 'Clientes',
            subtitle: 'Cadastro e gestão de clientes'
        },
        'crm': {
            title: 'CRM',
            subtitle: 'Atendimentos e captação de clientes'
        },
        'configuracoes': {
            title: 'Configurações',
            subtitle: 'Configurações do escritório e usuários'
        }
    };

    const info = titles[view] || { title: 'PRAXIFY', subtitle: '' };
    title.textContent = info.title;
    subtitle.textContent = info.subtitle;
}

/**
 * Atualiza menu lateral com item ativo
 */
function updateActiveMenu(view) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');

        const itemView = item.dataset.view;
        if (itemView === view || (view === 'processo-detalhe' && itemView === 'processos')) {
            item.classList.add('active');
        }
    });
}

/**
 * Mostra página 404
 */
function showNotFound() {
    const title = document.getElementById('page-title');
    const subtitle = document.getElementById('page-subtitle');

    if (title) title.textContent = '404 - Página não encontrada';
    if (subtitle) subtitle.textContent = 'A página que você procura não existe';

    const appRoot = document.getElementById('app-root');
    if (appRoot) {
        appRoot.innerHTML = `<div style="padding: 2rem; text-align: center;"><h2>Ops... Rota Inexistente.</h2><p>Parece que você se perdeu!</p></div>`;
    }
}

// =============================================
// LISTENERS
// =============================================

/**
 * Configura listeners de navegação
 */
export function setupRouter() {
    debug('Configurando router...');

    // Listener para botão voltar/avançar do navegador
    window.addEventListener('popstate', () => {
        navigate(window.location.pathname, false);
    });

    // Interceptar cliques em links
    document.addEventListener('click', (e) => {
        // Verificar se é um link interno
        const link = e.target.closest('a[href^="/"]');
        if (link) {
            e.preventDefault();
            navigate(link.getAttribute('href'));
        }
    });

    // Listener para itens do menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            if (item.disabled) return;

            const view = item.dataset.view;
            if (view) {
                // Dashboard vai para root, Prazos vai para /prazos
                const path = view === 'dashboard' ? '/' : `/${view}`;
                navigate(path);
            }
        });
    });

    debug('Router configurado');
}

/**
 * Inicializa router com rota inicial
 */
export function initRouter() {
    setupRouter();

    // Navegar para rota atual (ou raiz se não houver)
    const initialPath = window.location.pathname || '/';
    navigate(initialPath, false);

    debug('Router inicializado');
}

// =============================================
// HELPERS
// =============================================

/**
 * Obtém rota atual
 */
export function getCurrentRoute() {
    return currentRoute;
}

/**
 * Obtém parâmetros da rota atual
 */
export function getCurrentParams() {
    return { ...currentParams };
}

/**
 * Constrói URL com parâmetros
 */
export function buildUrl(route, params = {}) {
    let url = route;

    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
    });

    return url;
}

export default {
    navigate,
    goBack,
    goForward,
    setupRouter,
    initRouter,
    getCurrentRoute,
    getCurrentParams,
    buildUrl
};
