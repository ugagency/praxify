import type { Prazo } from '../hooks/usePrazosData';

export type PaginationModelItem = number | '...';

export type RangeInfo = {
    start: number;
    end: number;
    total: number;
};

export const formatDateBR = (iso: string, utc = false) => {
    try {
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '-';
        
        // If the date string has a time component (contains 'T' and isn't midnight without meaning to be)
        if (iso.includes('T') && iso.length > 11) {
             const pad = (n: number) => n.toString().padStart(2, '0');
             const datePart = d.toLocaleDateString('pt-BR', utc ? { timeZone: 'UTC' } : undefined as any);
             const h = utc ? d.getUTCHours() : d.getHours();
             const m = utc ? d.getUTCMinutes() : d.getMinutes();
             return `${datePart} às ${pad(h)}:${pad(m)}`;
        }
        
        return d.toLocaleDateString('pt-BR', utc ? { timeZone: 'UTC' } : undefined as any);
    } catch {
        return '-';
    }
};

export const filterPrazos = (prazos: any[], filtro: string, busca: string, hojeISO: string, dataInicio?: string, dataFim?: string) => {
    return prazos.filter((p) => {

        let matchBusca = true;
        if (busca) {
            const termo = busca.toLowerCase();
            matchBusca =
                (p.tarefa?.toLowerCase().includes(termo)) ||
                (p.responsavel?.toLowerCase().includes(termo)) ||
                (p.processo?.toString().toLowerCase().includes(termo));
        }
        if (!matchBusca) return false;

        let matchData = true;
        if (dataInicio && p.data_fatal) {
            if (new Date(p.data_fatal) < new Date(dataInicio)) matchData = false;
        }
        if (dataFim && p.data_fatal) {
            if (new Date(p.data_fatal) > new Date(dataFim)) matchData = false;
        }
        if (!matchData) return false;

        if (filtro === 'periodo') {
            return matchData;
        }

        if (filtro === 'mes') {
            const dateStr = p.data_fatal;
            if (!dateStr) return false;
            const [pYear, pMonth] = dateStr.split('T')[0].split('-');
            const [hYear, hMonth] = hojeISO.split('-');
            return pYear === hYear && pMonth === hMonth;
        }
        
        const dataFatalApenasData = p.data_fatal ? p.data_fatal.split('T')[0] : '';
        
        if (filtro === 'hoje') return dataFatalApenasData === hojeISO;
        if (filtro === 'atrasados') return dataFatalApenasData < hojeISO && p.status !== 'FEITO';
        if (filtro === 'semana') {
            const diff = (new Date(p.data_fatal).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return diff >= 0 && diff <= 7;
        }
        return true;
    });
};

export const getProcessLabel = (processo: any, processosList: any[]) => {
    const match = processosList?.find((proc: any) => (proc.numero || proc.id) == processo);
    return match ? (match.numero_autos || match.numero || match.id) : processo;
};

export const getStatusStyles = (p: Prazo, hojeISO: string) => {
    const dataFatalApenasData = p.data_fatal ? p.data_fatal.split('T')[0] : '';
    const atrasado = dataFatalApenasData < hojeISO && p.status !== 'FEITO';
    const hj = dataFatalApenasData === hojeISO && p.status !== 'FEITO';

    const statusBg =
        p.status === 'FEITO'
            ? 'rgba(16,185,129,0.18)'
            : atrasado
                ? 'rgba(239,68,68,0.18)'
                : hj
                    ? 'rgba(245,158,11,0.18)'
                    : 'rgba(59,130,246,0.18)';

    const statusColor =
        p.status === 'FEITO'
            ? '#10b981'
            : atrasado
                ? '#ef4444'
                : hj
                    ? '#f59e0b'
                    : '#60a5fa';

    return { statusBg, statusColor };
};

export const buildPaginationModel = (totalPaginas: number, paginaAtual: number): PaginationModelItem[] => {
    const pages: PaginationModelItem[] = [];

    if (totalPaginas <= 7) {
        for (let i = 1; i <= totalPaginas; i++) pages.push(i);
        return pages;
    }

    pages.push(1);

    if (paginaAtual > 3) pages.push('...');

    const start = Math.max(2, paginaAtual - 1);
    const end = Math.min(totalPaginas - 1, paginaAtual + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (paginaAtual < totalPaginas - 2) pages.push('...');

    pages.push(totalPaginas);

    return pages;
};

export const computeRangeInfo = ({ page, perPage, total }: { page: number; perPage: number; total: number }): RangeInfo => {
    if (total === 0) return { start: 0, end: 0, total: 0 };
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);
    return { start, end, total };
};