import { create } from 'zustand';

const getInitialTheme = (): 'light' | 'dark' => {
    const saved = localStorage.getItem('praxify_theme');
    return (saved === 'light') ? 'light' : 'dark';
};


// Basic Types based on old state
export interface User {
    id: string;
    email: string;
    nome?: string;
    role: 'ADMIN' | 'ADVOGADO' | 'ESTAGIARIO';
    grupo_acesso_id?: string | null;
    permissions?: string[];
}

export interface Escritorio {
    id: number;
    nome: string;
    cnpj?: string;
    endereco?: string;
}

export interface Prazo {
    id: number;
    tarefa: string;
    processo: string;
    data_fatal: string;
    status: 'PENDENTE' | 'URGENTE' | 'ATRASADO' | 'FEITO';
    responsavel: string;
}

export interface Processo {
    id: number;
    numero_autos: string;
    cliente_id: number;
    status: 'ATIVO' | 'ARQUIVADO';
}

export interface Cliente {
    id: number;
    nome: string;
    email?: string;
}

interface AppState {
    // Auth
    user: User | null;
    escritorio: Escritorio | null;
    isAuthenticated: boolean;

    // Data
    prazos: Prazo[];
    processos: Processo[];
    clientes: Cliente[];
    usuarios: User[];

    // UI State
    theme: 'light' | 'dark';
    currentView: string;
    currentFilter: string;
    loading: boolean;
    error: string | null;
    logs: string[];

    // Actions
    setUser: (user: User | null) => void;
    setEscritorio: (escritorio: Escritorio | null) => void;
    setPrazos: (prazos: Prazo[]) => void;
    setProcessos: (processos: Processo[]) => void;
    setClientes: (clientes: Cliente[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    resetState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: null,
    escritorio: null,
    isAuthenticated: false,

    prazos: [],
    processos: [],
    clientes: [],
    usuarios: [],

    theme: getInitialTheme(),
    currentView: 'prazos',
    currentFilter: 'all',
    loading: false,
    error: null,
    logs: [],

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setEscritorio: (escritorio) => set({ escritorio }),
    setPrazos: (prazos) => set({ prazos }),
    setProcessos: (processos) => set({ processos }),
    setClientes: (clientes) => set({ clientes }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setTheme: (theme) => {
        localStorage.setItem('praxify_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') document.documentElement.removeAttribute('data-theme');
        set({ theme });
    },

    resetState: () => set({
        user: null,
        escritorio: null,
        isAuthenticated: false,
        prazos: [],
        processos: [],
        clientes: [],
        usuarios: [],
        error: null
    })
}));
