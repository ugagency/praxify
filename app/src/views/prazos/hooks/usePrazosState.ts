import { useEffect, useMemo, useState } from 'react';
import type { Prazo } from './usePrazosData';
import { buildPaginationModel, computeRangeInfo, filterPrazos } from '../utils/prazos.utils';

export type PrazoFiltro = 'mes' | 'hoje' | 'semana' | 'atrasados' | 'periodo';
export type SortField = 'processo' | 'tarefa' | 'responsavel' | 'data_fatal' | 'status' | 'data_conclusao' | null;
export type SortOrder = 'asc' | 'desc';

type Props = {
    prazos: Prazo[];
    itensPorPagina: number;
};

export const usePrazosState = ({ prazos, itensPorPagina }: Props) => {
    const [filtro, setFiltro] = useState<PrazoFiltro>('mes');
    const [busca, setBusca] = useState('');
    const [filtroDataInicio, setFiltroDataInicio] = useState('');
    const [filtroDataFim, setFiltroDataFim] = useState('');
    const [orderBy, setOrderBy] = useState<SortField>(null);
    const [orderDir, setOrderDir] = useState<SortOrder>('asc');
    const [paginaAtual, setPaginaAtual] = useState(1);

    const hojeISO = useMemo(() => new Date().toISOString().split('T')[0], []);

    useEffect(() => {
        setPaginaAtual(1);
    }, [filtro, busca, filtroDataInicio, filtroDataFim]);

    const prazosFiltrados = useMemo(() => {
        let filtrados = filterPrazos(prazos, filtro, busca, hojeISO, filtroDataInicio, filtroDataFim);

        if (orderBy) {
            filtrados = [...filtrados].sort((a: any, b: any) => {
                let valA = a[orderBy];
                let valB = b[orderBy];

                if (valA === null || valA === undefined) valA = '';
                if (valB === null || valB === undefined) valB = '';

                if (typeof valA === 'string' && typeof valB === 'string') {
                    return orderDir === 'asc'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                }

                if (valA < valB) return orderDir === 'asc' ? -1 : 1;
                if (valA > valB) return orderDir === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtrados;
    }, [prazos, filtro, busca, hojeISO, filtroDataInicio, filtroDataFim, orderBy, orderDir]);

    const totalItens = prazosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    const paginaClamp = Math.min(Math.max(paginaAtual, 1), totalPaginas);

    const itensPaginados = useMemo(() => {
        const inicio = (paginaClamp - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return prazosFiltrados.slice(inicio, fim);
    }, [prazosFiltrados, paginaClamp, itensPorPagina]);

    const pageModel = useMemo(() => {
        return buildPaginationModel(totalPaginas, paginaClamp);
    }, [totalPaginas, paginaClamp]);

    const rangeInfo = useMemo(() => {
        return computeRangeInfo({
            page: paginaClamp,
            perPage: itensPorPagina,
            total: totalItens,
        });
    }, [paginaClamp, itensPorPagina, totalItens]);

    const irParaPagina = (p: number) => setPaginaAtual(Math.min(Math.max(p, 1), totalPaginas));

    return {
        filtro,
        setFiltro,
        busca,
        setBusca,
        filtroDataInicio,
        setFiltroDataInicio,
        filtroDataFim,
        setFiltroDataFim,
        paginaAtual,
        setPaginaAtual,
        totalPaginas,
        paginaClamp,
        prazosFiltrados,
        itensPaginados,
        totalItens,
        pageModel,
        rangeInfo,
        irParaPagina,
        hojeISO,
        orderBy,
        setOrderBy,
        orderDir,
        setOrderDir,
    };
};