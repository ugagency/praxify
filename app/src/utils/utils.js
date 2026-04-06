// =============================================
// UTILITÁRIOS - PRAXIFY
// Funções utilitárias gerais
// =============================================

import { CONFIG } from '../core/config.js';

// =============================================
// DATAS
// =============================================

/**
 * Parse ISO date string para Date
 */
export function parseISO(str) {
    if (!str) return null;
    return new Date(str + 'T00:00:00');
}

/**
 * Converte Date para string ISO (YYYY-MM-DD)
 */
export function toISODate(date) {
    if (!date) return null;
    if (typeof date === 'string') return date.split('T')[0];
    return date.toISOString().split('T')[0];
}

/**
 * Verifica se data é hoje
 */
export function isToday(dateString) {
    if (!dateString) return false;

    const today = new Date();
    const date = parseISO(dateString);

    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Verifica se data está na semana atual
 */
export function isThisWeek(dateString) {
    if (!dateString) return false;

    const today = new Date();
    const date = parseISO(dateString);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return date >= weekStart && date <= weekEnd;
}

/**
 * Calcula diferença em dias entre duas datas
 */
export function daysDiff(date1, date2) {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;

    const diffTime = d2 - d1;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Adiciona dias a uma data
 */
export function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Retorna data de hoje no formato ISO
 */
export function getToday() {
    return toISODate(new Date());
}

// =============================================
// PRAZOS
// =============================================

/**
 * Calcula status de um prazo
 */
export function getStatusPrazo(prazo) {
    if (!prazo) return CONFIG.STATUS_PRAZO.PENDENTE;

    // Se já está marcado como FEITO
    if (prazo.status === CONFIG.STATUS_PRAZO.FEITO) {
        return CONFIG.STATUS_PRAZO.FEITO;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataFatal = parseISO(prazo.data_fatal);
    dataFatal.setHours(0, 0, 0, 0);

    // Atrasado
    if (dataFatal < hoje) {
        return CONFIG.STATUS_PRAZO.ATRASADO;
    }

    // Urgente (hoje)
    if (dataFatal.getTime() === hoje.getTime()) {
        return CONFIG.STATUS_PRAZO.URGENTE;
    }

    // Pendente
    return CONFIG.STATUS_PRAZO.PENDENTE;
}

/**
 * Filtra prazos por tipo
 */
export function filterPrazos(prazos, filter) {
    if (!prazos) return [];

    switch (filter) {
        case 'today':
            return prazos.filter(p => getStatusPrazo(p) === CONFIG.STATUS_PRAZO.URGENTE);

        case 'late':
            return prazos.filter(p => getStatusPrazo(p) === CONFIG.STATUS_PRAZO.ATRASADO);

        case 'week':
            return prazos.filter(p => {
                const status = getStatusPrazo(p);
                if (status === CONFIG.STATUS_PRAZO.FEITO) return false;
                return isThisWeek(p.data_fatal);
            });

        case 'done':
            return prazos.filter(p => p.status === CONFIG.STATUS_PRAZO.FEITO);

        case 'all':
        default:
            return prazos;
    }
}

/**
 * Conta prazos por status
 */
export function countPrazosByStatus(prazos) {
    const counts = {
        [CONFIG.STATUS_PRAZO.PENDENTE]: 0,
        [CONFIG.STATUS_PRAZO.URGENTE]: 0,
        [CONFIG.STATUS_PRAZO.ATRASADO]: 0,
        [CONFIG.STATUS_PRAZO.FEITO]: 0
    };

    prazos.forEach(prazo => {
        const status = getStatusPrazo(prazo);
        counts[status]++;
    });

    return counts;
}

// =============================================
// STRINGS
// =============================================

/**
 * Capitaliza primeira letra
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Gera slug a partir de string
 */
export function slugify(str) {
    if (!str) return '';

    return str
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/--+/g, '-') // Remove hífens duplicados
        .trim();
}

/**
 * Remove acentos
 */
export function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Busca case-insensitive com suporte a acentos
 */
export function searchMatch(text, query) {
    if (!text || !query) return false;

    const normalizedText = removeAccents(text.toLowerCase());
    const normalizedQuery = removeAccents(query.toLowerCase());

    return normalizedText.includes(normalizedQuery);
}

// =============================================
// ARRAYS
// =============================================

/**
 * Ordena array por campo
 */
export function sortBy(array, field, ascending = true) {
    if (!array || !Array.isArray(array)) return [];

    const sorted = [...array].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });

    return sorted;
}

/**
 * Agrupa array por campo
 */
export function groupBy(array, field) {
    if (!array || !Array.isArray(array)) return {};

    return array.reduce((groups, item) => {
        const key = item[field];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * Remove duplicatas de array
 */
export function unique(array, field = null) {
    if (!array || !Array.isArray(array)) return [];

    if (field) {
        const seen = new Set();
        return array.filter(item => {
            const value = item[field];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }

    return [...new Set(array)];
}

/**
 * Pagina array
 */
export function paginate(array, page = 1, perPage = 20) {
    if (!array || !Array.isArray(array)) return [];

    const start = (page - 1) * perPage;
    const end = start + perPage;

    return array.slice(start, end);
}

// =============================================
// OBJETOS
// =============================================

/**
 * Deep clone de objeto
 */
export function cloneDeep(obj) {
    if (obj === null || typeof obj !== 'object') return obj;

    try {
        return JSON.parse(JSON.stringify(obj));
    } catch {
        return obj;
    }
}

/**
 * Merge profundo de objetos
 */
export function mergeDeep(target, ...sources) {
    if (!sources.length) return target;

    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Pega valor aninhado de objeto
 */
export function getNestedValue(obj, path) {
    if (!obj || !path) return undefined;

    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// =============================================
// NÚMEROS
// =============================================

/**
 * Formata número como moeda BRL
 */
export function formatCurrency(value) {
    if (value === null || value === undefined) return 'R$ 0,00';

    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

/**
 * Formata número com separadores de milhar
 */
export function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined) return '0';

    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value);
}

/**
 * Gera número aleatório entre min e max
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =============================================
// ASYNC
// =============================================

/**
 * Sleep (delay) assíncrono
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry de função assíncrona
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await sleep(delay * attempt);
            }
        }
    }

    throw lastError;
}

// =============================================
// EXPORTS
// =============================================

export default {
    parseISO,
    toISODate,
    isToday,
    isThisWeek,
    daysDiff,
    addDays,
    getToday,
    getStatusPrazo,
    filterPrazos,
    countPrazosByStatus,
    capitalize,
    slugify,
    removeAccents,
    searchMatch,
    sortBy,
    groupBy,
    unique,
    paginate,
    cloneDeep,
    mergeDeep,
    getNestedValue,
    formatCurrency,
    formatNumber,
    randomInt,
    sleep,
    retry
};
