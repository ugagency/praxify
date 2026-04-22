// =============================================
// CONFIGURAÇÃO CENTRALIZADA - PRAXIFY
// =============================================

export const CONFIG = {
    // Supabase
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",

    // Tabelas do banco
    TABLES: {
        ESCRITORIOS: "Jur_Escritorios",
        USUARIOS: "Jur_Usuarios",
        CLIENTES: "Jur_Clientes",
        PROCESSOS: "Jur_Processos",
        PRAZOS: "Jur_Prazos",
        HISTORICO: "Jur_Historico",
        DOCUMENTOS: "Jur_Documentos",
        ARQUIVOS: "Jur_Arquivos",
        LOGS: "Jur_Logs"
    },

    // Roles de usuários
    ROLES: {
        ADMIN: "ADMIN",
        ADVOGADO: "ADVOGADO",
        ESTAGIARIO: "ESTAGIARIO"
    },

    // Status de processos
    STATUS_PROCESSO: {
        ATIVO: "ATIVO",
        ARQUIVADO: "ARQUIVADO"
    },

    // Status de prazos
    STATUS_PRAZO: {
        PENDENTE: "PENDENTE",
        URGENTE: "URGENTE",
        ATRASADO: "ATRASADO",
        FEITO: "FEITO"
    },

    // Tipos de histórico
    TIPO_HISTORICO: {
        REUNIAO: "REUNIAO",
        AUDIO: "AUDIO",
        WHATSAPP: "WHATSAPP",
        IMPORTACAO: "IMPORTACAO",
        NOTA: "NOTA",
        IA: "IA"
    },

    // Tipos de arquivos
    TIPO_ARQUIVO: {
        AUDIO: "AUDIO",
        DOCUMENTO: "DOCUMENTO",
        IMAGEM: "IMAGEM",
        OUTRO: "OUTRO"
    },

    // Configurações de UI
    UI: {
        ITEMS_PER_PAGE: 20,
        DEBOUNCE_DELAY: 300,
        TOAST_DURATION: 3000,
        THEME_KEY: "praxify_theme"
    },

    // API Externa - IA

    // API Externa - IA
    API: {
        GEMINI_KEY: import.meta.env.VITE_GEMINI_KEY || "",
        GEMINI_MODEL: "gemini-2.5-flash", // Versao atualizada, veloz e de baixo custo
        GEMINI_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models"
    },

    // Versão da aplicação
    VERSION: "1.0.0",

    // Modo de desenvolvimento
    DEBUG: false
};

// Helper para debug
export function debug(...args: unknown[]) {
    if (CONFIG.DEBUG) {
        console.log('[PRAXIFY]', ...args);
    }
}

export default CONFIG;
