// =============================================
// MÓDULO SUPABASE - PRAXIFY
// Cliente e queries centralizadas
// =============================================

import { CONFIG, debug } from '../core/config';
import type { SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase
let supabaseClient: SupabaseClient | null = null;

// =============================================
// INICIALIZAÇÃO
// =============================================

export function initSupabase(supabaseLib: { createClient: (url: string, key: string) => SupabaseClient }) {
    if (!supabaseLib) {
        throw new Error('Supabase library não fornecida');
    }

    supabaseClient = supabaseLib.createClient(
        CONFIG.SUPABASE_URL,
        CONFIG.SUPABASE_ANON_KEY
    );

    debug('Supabase client inicializado');
    return supabaseClient;
}

export function getClient(): SupabaseClient {
    if (!supabaseClient) {
        throw new Error('Supabase client não inicializado. Chame initSupabase() primeiro.');
    }
    return supabaseClient;
}

// =============================================
// QUERIES GENÉRICAS
// =============================================

/**
 * Buscar todos os registros de uma tabela
 * @param {string} table - Nome da tabela
 * @param {object} options - Opções de query (select, order, filters)
 */
export async function getAll<T = Record<string, unknown>>(table: string, options: Record<string, unknown> = {}) {
    // ⭐ MOCK DATA FOR DEBUG MODE (DISABLED PARA TRAZER DO BANCO REAL)
    // if (CONFIG.DEBUG) {
    //    debug(`[MOCK] Returning data for ${table}`);
    //    let mockData = getMockData(table);
    //
    //    if (options.filters) {
    //        Object.entries(options.filters).forEach(([key, value]) => {
    //            mockData = mockData.filter((item: any) => item[key] == value);
    //        });
    //    }
    //    return { data: mockData, error: null };
    // }

    const { select = '*', order, filters = {} } = options as { select?: string, order?: { column: string, ascending?: boolean }, filters?: Record<string, unknown> };

    try {
        let query = getClient().from(table).select(select);

        // Aplicar filtros
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                query = query.eq(key, value);
            }
        });

        // Aplicar ordenação
        if (order) {
            const { column, ascending = true } = order;
            query = query.order(column, { ascending });
        }

        const { data, error } = await query;

        if (error) throw error;

        debug(`getAll(${table}):`, data?.length || 0, 'registros');
        return { data: data as T[], error: null };
    } catch (error) {
        debug(`Erro em getAll(${table}):`, error);
        return { data: null, error: error as Error };
    }
}

// Helper: Get Mock Data (returning reference to store)
// function getMockData(table: string) {
//     if (!(MOCK_STORE as any)[table]) (MOCK_STORE as any)[table] = [];
//     return (MOCK_STORE as any)[table];
// }

/**
 * Buscar um registro por ID
 */
export async function getById(table: string, id: string | number) {
    // ⭐ MOCK FOR DEBUG (DISABLED PARA TRAZER DO BANCO REAL)
    // if (CONFIG.DEBUG) {
    //    debug(`[MOCK] getById(${table}, ${id})`);
    //    const mockData = getMockData(table);
    //    const item = mockData.find((i: any) => i.id == id);
    //    return { data: item || null, error: item ? null : { message: 'Not found' } };
    // }

    try {
        const { data, error } = await getClient()
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        debug(`getById(${table}, ${id}):`, data);
        return { data, error: null };
    } catch (error) {
        debug(`Erro em getById(${table}, ${id}):`, error);
        return { data: null, error };
    }
}

// Helper to get formatted date for mocks
// const getMockDate = () => new Date().toISOString();

/**
 * Inserir novo registro
 */
export async function insert<T = Record<string, unknown>>(table: string, record: Record<string, unknown>) {
    try {
        const { data, error } = await getClient()
            .from(table)
            .insert(record)
            .select()
            .single();

        if (error) throw error;

        debug(`insert(${table}):`, data);
        return { data: data as T, error: null };
    } catch (error) {
        debug(`Erro em insert(${table}):`, error);
        return { data: null, error: error as Error };
    }
}

/**
 * Atualizar registro
 */
export async function update<T = Record<string, unknown>>(table: string, id: string | number, updates: Record<string, unknown>) {
    try {
        const { data, error } = await getClient()
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        debug(`update(${table}, ${id}):`, data);
        return { data: data as T, error: null };
    } catch (error) {
        debug(`Erro em update(${table}, ${id}):`, error);
        return { data: null, error: error as Error };
    }
}

/**
 * Deletar registro
 */
export async function remove(table: string, id: string | number) {
    // ⭐ MOCK FOR DEBUG (DISABLED)
    // if (CONFIG.DEBUG) {
    //    debug(`[MOCK] remove(${table}, ${id})`);
    //    const store = getMockData(table);
    //    const index = store.findIndex((i: any) => i.id == id);
    //    if (index > -1) {
    //        store.splice(index, 1);
    //    }
    //    return { error: null };
    // }

    try {
        const { error } = await getClient()
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;

        debug(`remove(${table}, ${id}): sucesso`);
        return { error: null };
    } catch (error) {
        debug(`Erro em remove(${table}, ${id}):`, error);
        return { error };
    }
}

// =============================================
// QUERIES ESPECÍFICAS - PRAZOS
// =============================================

export async function getPrazos<T = Record<string, unknown>>(filters = {}) {
    return getAll<T>(CONFIG.TABLES.PRAZOS, {
        order: { column: 'data_fatal', ascending: true },
        filters: { ...filters, tipo: true }
    });
}

export async function getCompromissos<T = Record<string, unknown>>(filters = {}) {
    return getAll<T>(CONFIG.TABLES.PRAZOS, {
        order: { column: 'data_fatal', ascending: true },
        filters: { ...filters, tipo: false }
    });
}

export async function createPrazo(prazo: Record<string, unknown>) {
    return insert(CONFIG.TABLES.PRAZOS, {
        ...prazo,
        status: prazo.status || CONFIG.STATUS_PRAZO.PENDENTE,
        data_conclusao: null
    });
}

export async function completePrazo(id: string | number) {
    const hoje = new Date().toISOString().slice(0, 10);
    return update(CONFIG.TABLES.PRAZOS, id, {
        status: CONFIG.STATUS_PRAZO.FEITO,
        data_conclusao: hoje
    });
}

// =============================================
// QUERIES ESPECÍFICAS - PROCESSOS
// =============================================

export async function getProcessos<T = Record<string, unknown>>(escritorioId: string | number | null = null) {
    const filters = escritorioId ? { escritorio_id: escritorioId } : {};
    return getAll<T>(CONFIG.TABLES.PROCESSOS, {
        select: `
      *,
      cliente:cliente_id (id, nome, cpf_cnpj)
    `,
        order: { column: 'criado_em', ascending: false },
        filters
    });
}

export async function getProcessoById(id: string | number) {
    try {
        const { data, error } = await getClient()
            .from(CONFIG.TABLES.PROCESSOS)
            .select(`
        *,
        cliente:cliente_id (id, nome, cpf_cnpj),
        escritorio:escritorio_id (id, nome)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        return { data: null, error };
    }
}

export async function createProcesso(processo: Record<string, unknown>) {
    return insert(CONFIG.TABLES.PROCESSOS, {
        ...processo,
        status: processo.status || CONFIG.STATUS_PROCESSO.ATIVO
    });
}

// =============================================
// QUERIES ESPECÍFICAS - CLIENTES
// =============================================

export async function getClientes<T = Record<string, unknown>>(escritorioId: string | number | null = null) {
    const filters = escritorioId ? { escritorio_id: escritorioId } : {};
    return getAll<T>(CONFIG.TABLES.CLIENTES, {
        order: { column: 'nome', ascending: true },
        filters
    });
}

export async function createCliente(cliente: Record<string, unknown>) {
    return insert(CONFIG.TABLES.CLIENTES, cliente);
}

// =============================================
// QUERIES ESPECÍFICAS - USUÁRIOS
// =============================================

export async function getUsuarios<T = Record<string, unknown>>(escritorioId: string | number | null = null) {
    const filters = escritorioId ? { escritorio_id: escritorioId } : {};
    return getAll<T>(CONFIG.TABLES.USUARIOS, {
        select: 'id, nome, email, role',
        order: { column: 'nome', ascending: true },
        filters
    });
}

// =============================================
// QUERIES ESPECÍFICAS - HISTÓRICO
// =============================================

export async function getHistoricoProcesso(processoId: string | number) {
    return getAll(CONFIG.TABLES.HISTORICO, {
        order: { column: 'criado_em', ascending: false },
        filters: { processo: processoId }
    });
}

export async function createHistorico(historico: Record<string, unknown>) {
    return insert(CONFIG.TABLES.HISTORICO, historico);
}

// =============================================
// QUERIES ESPECÍFICAS - ARQUIVOS
// =============================================

export async function getArquivosProcesso(processoId: string | number) {
    return getAll(CONFIG.TABLES.ARQUIVOS, {
        order: { column: 'criado_em', ascending: false },
        filters: { processo: processoId }
    });
}

export async function uploadArquivo(file: File, metadata: Record<string, unknown>) {
    try {
        const client = getClient();
        // Sanitizar nome do arquivo (remover acentos e caracteres especiais)
        const cleanName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${Date.now()}_${cleanName}`;
        const filePath = `${metadata.escritorio_id}/${metadata.processo_id || 'geral'}/${fileName}`;

        // Upload para Supabase Storage
        const { error: uploadError } = await client.storage
            .from('arquivos') // bucket name
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: urlData } = client.storage
            .from('arquivos')
            .getPublicUrl(filePath);

        // Criar registro na tabela Jur_Arquivos
        const arquivo = {
            ...metadata,
            url: urlData.publicUrl,
            descricao: metadata.descricao || file.name
        };

        const { data, error } = await insert(CONFIG.TABLES.ARQUIVOS, arquivo);

        if (error) throw error;

        return { data, error: null };
    } catch (error) {
        debug('Erro em uploadArquivo:', error);
        return { data: null, error };
    }
}

// =============================================
// LOGS
// =============================================

export async function createLog(log: Record<string, unknown>) {
    return insert(CONFIG.TABLES.LOGS, {
        ...log,
        criado_em: new Date().toISOString()
    });
}

export default {
    initSupabase,
    getClient,
    getAll,
    getById,
    insert,
    update,
    remove,
    getPrazos,
    getCompromissos,
    createPrazo,
    completePrazo,
    getProcessos,
    getProcessoById,
    createProcesso,
    getClientes,
    createCliente,
    getUsuarios,
    getHistoricoProcesso,
    createHistorico,
    getArquivosProcesso,
    uploadArquivo,
    createLog
};
