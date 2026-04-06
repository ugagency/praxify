import React, { useEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { getClient } from './services/supabase';
import { handleAuthChange } from './services/auth';
import { useAppStore } from './core/store';

import { Dashboard } from './views/dashboard/Dashboard';
import { Configuracoes } from './views/configuracao/Configuracoes';

// Lazy load implementation for code splitting and route transition loaders
const Prazos = React.lazy(() =>
    import('./views/prazos/Prazos').then((module) => ({ default: module.Prazos }))
);
const Processos = React.lazy(() =>
    import('./views/processos/Processos').then((module) => ({ default: module.Processos }))
);
const ProcessoDetalhe = React.lazy(() =>
    import('./views/processos/ProcessoDetalhe').then((module) => ({
        default: module.ProcessoDetalhe
    }))
);
const Crm = React.lazy(() =>
    import('./views/crm/Crm').then((module) => ({ default: module.Crm }))
);
const Clientes = React.lazy(() =>
    import('./views/clientes/Clientes').then((module) => ({ default: module.Clientes }))
);

// =============================================
// AUTH PROVIDER
// Escuta mudanças de sessão do Supabase e atualiza o store.
// Chama onReady() uma única vez após a verificação inicial.
// =============================================
const AuthProvider: React.FC<{
    children: React.ReactNode;
    onReady: (authenticated: boolean) => void;
}> = ({ children, onReady }) => {
    const readyCalled = useRef(false);

    useEffect(() => {
        let subscription: { unsubscribe: () => void } | null = null;

        const init = async () => {
            try {
                const client = getClient();

                // Verificar sessão inicial uma única vez
                const { data: { session } } = await client.auth.getSession();
                const user = session?.user ?? null;

                if (user) {
                    await handleAuthChange(user as unknown as null);
                } else {
                    handleAuthChange(null);
                }

                // Sinalizar que a verificação inicial terminou
                if (!readyCalled.current) {
                    readyCalled.current = true;
                    onReady(!!user);
                }

                // Escutar mudanças futuras (login/logout)
                const { data } = client.auth.onAuthStateChange((_event, sess) => {
                    const u = sess?.user ?? null;
                    handleAuthChange(u as unknown as null);
                });
                subscription = data.subscription;
            } catch (e) {
                console.error('Critical AuthProvider Error:', e);
                handleAuthChange(null);
                if (!readyCalled.current) {
                    readyCalled.current = true;
                    onReady(false);
                }
            }
        };

        init();

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return <>{children}</>;
};

// =============================================
// PROTECTED ROUTE
// Aguarda a verificação inicial e redireciona para login se não autenticado.
// O redirect é feito em useEffect para evitar side-effects durante o render.
// =============================================
const ProtectedRoute: React.FC<{
    children: React.ReactNode;
    isReady: boolean;
    isAuthenticated: boolean;
}> = ({ children, isReady, isAuthenticated }) => {

    useEffect(() => {
        if (isReady && !isAuthenticated) {
            window.location.href = '/src/login.html';
        }
    }, [isReady, isAuthenticated]);

    // Tela de carregamento enquanto verifica a sessão, ou enquanto redireciona
    if (!isReady || (isReady && !isAuthenticated)) {
        return (
            <div
                style={{
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: 'var(--bg-darker)'
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid var(--border-color)',
                        borderTopColor: 'var(--accent)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span
                    style={{
                        color: 'var(--accent)',
                        fontWeight: 600,
                        letterSpacing: '2px',
                        fontSize: '14px'
                    }}
                >
                    {!isReady ? 'VERIFICANDO SESSÃO...' : 'REDIRECIONANDO...'}
                </span>
            </div>
        );
    }

    return <>{children}</>;
};

// =============================================
// APP ROOT
// =============================================
export default function App() {
    const [authState, setAuthState] = useState<{
        isReady: boolean;
        isAuthenticated: boolean;
    }>({ isReady: false, isAuthenticated: false });

    const isAuthenticated = useAppStore((state) => state.isAuthenticated);
    const theme = useAppStore((state) => state.theme);

    useEffect(() => {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [theme]);

    return (
        <HashRouter>
            <AuthProvider
                onReady={(authenticated) =>
                    setAuthState({ isReady: true, isAuthenticated: authenticated })
                }
            >
                <ProtectedRoute
                    isReady={authState.isReady}
                    isAuthenticated={authState.isAuthenticated || isAuthenticated}
                >
                    <Layout>
                        <React.Suspense
                            fallback={
                                <div
                                    style={{
                                        display: 'flex',
                                        height: '100vh',
                                        width: '100%',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexDirection: 'column',
                                        gap: '1rem'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            border: '3px solid var(--border-color)',
                                            borderTopColor: 'var(--accent)',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }}
                                    />
                                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                    <span
                                        style={{
                                            color: 'var(--accent)',
                                            fontWeight: 600,
                                            letterSpacing: '2px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        CARREGANDO MÓDULO...
                                    </span>
                                </div>
                            }
                        >
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="/prazos" element={<Prazos />} />
                                <Route path="/processos" element={<Processos />} />
                                <Route path="/processo/:id" element={<ProcessoDetalhe />} />
                                <Route path="/crm" element={<Crm />} />
                                <Route path="/clientes" element={<Clientes />} />
                                <Route path="/configuracao" element={<Configuracoes />} />
                                <Route path="/config" element={<Configuracoes />} />
                            </Routes>
                        </React.Suspense>
                    </Layout>
                </ProtectedRoute>
            </AuthProvider>
        </HashRouter>
    );
}