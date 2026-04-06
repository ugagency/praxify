// =============================================
// AUTENTICAÇÃO - PRAXIFY
// Gerenciamento de autenticação com Supabase
// =============================================

import { getClient } from './supabase';
import { useAppStore } from '../core/store';
import { CONFIG, debug } from '../core/config';
import type { User, Session } from '@supabase/supabase-js';

// =============================================
// MODO DESENVOLVIMENTO - BYPASS AUTH
// =============================================

/**
 * Login bypass para desenvolvimento (SEM SUPABASE)
 * Aceita qualquer email/senha ou campos vazios
 */
export async function devLogin(email = '', _password = '') {
    debug('🔓 DEV MODE: Login bypass ativado');

    // Criar usuário fake para desenvolvimento
    const fakeUser = {
        id: 'dev-user-uuid-12345',
        email: email || 'dev@praxify.com',
        nome: 'Usuário Desenvolvimento',
        role: 'ADMIN',
        created_at: new Date().toISOString()
    };

    const fakeEscritorio = {
        id: 1,
        nome: 'Escritório Demo - Desenvolvimento',
        cnpj: '00.000.000/0000-00',
        plano: 'BASIC'
    };

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Atualizar state diretamente (sem Supabase)
    useAppStore.getState().setUser(fakeUser as unknown as import('../core/store').User);
    useAppStore.getState().setEscritorio(fakeEscritorio as import('../core/store').Escritorio);

    debug('✅ DEV MODE: Login fake realizado (localStorage handle moved to Zustand/React)', fakeUser);

    return {
        data: {
            user: fakeUser,
            session: { access_token: 'fake-dev-token' }
        },
        error: null
    };
}

// =============================================
// AUTENTICAÇÃO
// =============================================

/**
 * Faz login com email e senha
 * Em modo DEBUG, aceita campos vazios e usa devLogin
 * HARDCODED: teste@teste.com.br / 123 sempre funcionará
 */
export async function login(email: string = '', password: string = '') {
    // ⭐ HARDCODED LOGIN REMOVIDO
    // Apenas login real ou devLogin explícito via CONFIG.DEBUG serão aceitos.


    // MODO DESENVOLVIMENTO: Aceitar login vazio ou emails de teste
    const isTestEmail = email === 'user@oliveirai.com' || email === 'admin@oliveirai.com';
    const isEmpty = (!email || !password || email.trim() === '' || password.trim() === '');

    if (CONFIG.DEBUG && (isEmpty || isTestEmail)) {
        debug('⚠️ Modo DEBUG: Campos vazios ou email de teste detectados - usando devLogin');
        return devLogin(email, password);
    }

    try {
        const client = getClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        debug('Login bem-sucedido:', data.user?.email);

        // Não chamar handleAuthChange aqui - onAuthStateChange já faz isso
        // Evita race condition com a chamada dupla

        return { data, error: null };
    } catch (error) {
        debug('Erro no login:', error);
        return { data: null, error };
    }
}

/**
 * Faz logout
 */
export async function logout() {
    try {
        const client = getClient();
        const { error } = await client.auth.signOut();

        if (error) throw error;

        debug('Logout bem-sucedido');
        useAppStore.getState().resetState();

        // Limpar storage
        localStorage.removeItem('oliveirai_state');

        return { error: null };
    } catch (error) {
        debug('Erro no logout:', error);
        return { error };
    }
}

/**
 * Registra novo usuário
 */
export async function register(email: string, password: string, metadata: Record<string, unknown> = {}) {
    try {
        const client = getClient();
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });

        if (error) throw error;

        debug('Registro bem-sucedido:', data.user?.email);

        return { data, error: null };
    } catch (error) {
        debug('Erro no registro:', error);
        return { data: null, error };
    }
}

/**
 * Recupera senha
 */
export async function resetPassword(email: string) {
    try {
        const client = getClient();
        const { data, error } = await client.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;

        debug('Email de recuperação enviado para:', email);

        return { data, error: null };
    } catch (error) {
        debug('Erro ao recuperar senha:', error);
        return { data: null, error };
    }
}

/**
 * Atualiza senha do usuário
 */
export async function updatePassword(newPassword: string) {
    try {
        const client = getClient();
        const { data, error } = await client.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        debug('Senha atualizada com sucesso');

        return { data, error: null };
    } catch (error) {
        debug('Erro ao atualizar senha:', error);
        return { data: null, error };
    }
}

/**
 * Obtém usuário atual
 */
export async function getCurrentUser() {
    try {
        const client = getClient();
        const { data: { user }, error } = await client.auth.getUser();

        if (error) throw error;

        return { user, error: null };
    } catch (error) {
        debug('Erro ao obter usuário atual:', error);
        return { user: null, error };
    }
}

/**
 * Obtém sessão atual
 */
export async function getSession() {
    try {
        const client = getClient();
        const { data: { session }, error } = await client.auth.getSession();

        if (error) throw error;

        return { session, error: null };
    } catch (error) {
        debug('Erro ao obter sessão:', error);
        return { session: null, error };
    }
}

// =============================================
// DADOS DO USUÁRIO NO BANCO
// =============================================

/**
 * Busca dados completos do usuário na tabela Jur_Usuarios
 */
export async function getUserData(userId: string) {
    try {
        const client = getClient();


        // Timeout de 5s para evitar travar init
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout busca dados usuario')), 5000)
        );

        const { data, error } = (await Promise.race([
            client.from('Jur_Usuarios').select(`*,escritorio:escritorio_id(id,nome,cnpj,plano)`).eq('id', userId).single(),
            timeoutPromise
        ])) as { data: Record<string, unknown>; error: Error | null };


        if (error) throw error;

        debug('Dados do usuário carregados:', data);
        return { data, error: null };
    } catch (error) {
        debug('Erro ao buscar dados do usuário:', error);
        return { data: null, error };
    }
}

/**
 * Atualiza state quando autenticação muda
 */
export async function handleAuthChange(user: User | null) {
    if (!user) {
        useAppStore.getState().resetState();
        return;
    }

    useAppStore.getState().setUser(user as unknown as import('../core/store').User);

    // Buscar dados completos do usuário
    let { data: userData } = await getUserData(user.id);

    // ⭐ ONBOARDING: Se não achou usuário pelo ID, pode ser um CONVITE (buscar por email)
    if (!userData && user.email) {
        debug('Usuário não encontrado pelo ID. Verificando convites por email:', user.email);
        userData = await linkInviteProfile(user);
    }

    if (userData) {
        let permissions: string[] = [];
        if (userData.grupo_acesso_id) {
            const client = getClient();
            const { data: perms } = await client
                .from('grupo_permissoes')
                .select('permissoes(chave)')
                .eq('grupo_id', userData.grupo_acesso_id);
            if (perms) {
                permissions = perms.map((p: any) => p.permissoes?.chave).filter(Boolean);
            }
        }

        useAppStore.getState().setUser({
            ...user,
            ...userData,
            permissions
        } as unknown as import('../core/store').User);

        if (userData.escritorio) {
            useAppStore.getState().setEscritorio(userData.escritorio as import('../core/store').Escritorio);
        }
    }
}

/**
 * Tenta vincular um perfil de convite (existente apenas por email)
 * ao novo ID de autenticação do usuário.
 */
async function linkInviteProfile(authUser: User) {
    try {
        const client = getClient();
        console.log('[DEBUG] linkInviteProfile: Iniciando busca por', authUser.email);

        // 1. Buscar se existe usuário com este email
        // Timeout de 3s para a busca
        const searchPromise = client
            .from('Jur_Usuarios')
            .select('*')
            .eq('email', authUser.email)
            .single();

        const searchTimeout = new Promise<{ data: Record<string, unknown> | null; error: { code?: string } | null }>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout busca usuario')), 3000)
        );

        const { data: inviteUser, error: searchError } = (await Promise.race([searchPromise, searchTimeout])) as { data: Record<string, unknown> | null; error: { code?: string; message?: string } | null };

        if (searchError) {
            // .single() retorna erro se não encontrar, o que é normal aqui
            if (searchError.code !== 'PGRST116') {
                console.error('[CRITICAL] Erro ao buscar usuario:', searchError);
            } else {
                debug('Nenhum convite encontrado para este email.');
            }
            return null;
        }

        if (!inviteUser) return null;

        console.log('[DEBUG] Convite encontrado! ID Antigo:', inviteUser.id, 'Tentando atualizar para:', authUser.id);

        // 2. Atualizar o ID do registro para bater com o Auth ID
        // Isso permite que as regras de RLS (que usam auth.uid()) funcionem
        // NOTE: Adicionando timeout manual para evitar hang infinito

        const updatePromise = client
            .from('Jur_Usuarios')
            .update({ id: authUser.id }) // Mudar PK para Auth UID
            .eq('email', authUser.email)
            .select(`
                *,
                escritorio:escritorio_id (*)
            `)
            .single();

        // Race com timeout de 5s
        const timeoutPromise = new Promise<{ data: Record<string, unknown> | null; error: { code?: string, message?: string } | null }>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout ao vincular perfil')), 5000)
        );

        const { data: updatedUser, error: updateError } = await Promise.race([updatePromise, timeoutPromise]);

        if (updateError) {
            console.error('[CRITICAL] Erro ao atualizar ID (VINCULAÇÃO FALHOU):', updateError);
            console.warn('Possível causa: Constraints de chave estrangeira. Rode fix_onboarding_db.sql');

            // Fallback: Retorna o usuário do convite mesmo sem linkar (modo leitura)
            // IMPORTANTE: Isso pode causar problemas de permissão se RLS estiver ativo, pois o ID não bate.
            return inviteUser;
        }

        console.log('[SUCCESS] Vinculação concluída com sucesso! Novo ID:', updatedUser.id);
        return updatedUser;

    } catch (e) {
        console.error('[EXCEPTION] Erro fatal em linkInviteProfile:', e);
        return null;
    }
}

// =============================================
// LISTENERS DE AUTENTICAÇÃO
// =============================================

/**
 * Configura listeners para mudanças de autenticação
 */
export function setupAuthListener() {
    // ⭐ MODO DEBUG: NÃO configurar listener do Supabase!
    // Isso evita que eventos SIGNED_OUT limpem o state do devLogin
    if (CONFIG.DEBUG) {
        debug('⚠️ DEV MODE: Pulando setupAuthListener - usando login fake');
        return;
    }

    const client = getClient();

    client.auth.onAuthStateChange(async (event: string, session: Session | null) => {
        debug('Auth state changed:', event);

        switch (event) {
            case 'SIGNED_IN':
                await handleAuthChange(session?.user || null);
                break;
            case 'SIGNED_OUT':
                useAppStore.getState().resetState();
                break;
            case 'TOKEN_REFRESHED':
                debug('Token refreshed');
                break;
            case 'USER_UPDATED':
                await handleAuthChange(session?.user || null);
                break;
            default:
                break;
        }
    });
}

// =============================================
// PROTEÇÃO DE ROTAS
// =============================================

/**
 * Verifica se usuário está autenticado
 * Redireciona para login se não estiver
 * Em modo DEBUG, verifica se há usuário fake no state
 */
export async function requireAuth() {
    // Em modo DEBUG, verificar se há usuário no state (pode ser fake)
    if (CONFIG.DEBUG) {
        const user = useAppStore.getState().user;
        if (user) {
            debug('✅ DEV MODE: Usuário fake encontrado no state');
            return true;
        }
    }

    const { session } = await getSession();

    if (!session) {
        debug('Usuário não autenticado. (Redirecionamento desativado para Integração LP)');
        // OLD: window.location.href = '/login.html';
        return false;
    }

    return true;
}

/**
 * Verifica se usuário tem permissão (role)
 * Usa o state síncrono para evitar promessas na UI
 */
export function hasRole(requiredRole: string) {
    const user = useAppStore.getState().user;

    // Se não tem usuário, não tem permissão
    if (!user) return false;

    // Admin tem acesso a tudo
    if (user.role === 'ADMIN') return true;

    // Verifica role específica
    return user.role === requiredRole;
}

/**
 * Verifica se usuário é admin
 */
export function isAdmin() {
    return hasRole('ADMIN');
}

// =============================================
// INICIALIZAÇÃO
// =============================================

/**
 * Inicializa autenticação
 * Verifica se já existe sessão ativa
 * Em modo DEBUG, pula autenticação se já existe usuário no state
 */
export async function initAuth() {
    debug('Inicializando autenticação...');

    // ⭐ MODO DEBUG: Se já tem usuário no state, pular auth completamente
    if (CONFIG.DEBUG) {
        const user = useAppStore.getState().user;
        if (user) {
            debug('✅ DEV MODE: Usuário fake já existe, pulando initAuth completamente');
            return true; // Simular que tem sessão
        }
    }

    // Configurar listener
    setupAuthListener();

    // Verificar sessão existente
    const { session } = await getSession();
    if (session?.user) {
        await handleAuthChange(session.user);
        debug('Sessão ativa encontrada');
    } else {
        debug('Nenhuma sessão ativa');
    }

    return !!session;
}

export default {
    devLogin,
    login,
    logout,
    register,
    resetPassword,
    updatePassword,
    getCurrentUser,
    getSession,
    getUserData,
    setupAuthListener,
    requireAuth,
    hasRole,
    isAdmin,
    initAuth
};
