import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../../core/store';
import { openPrazoDetailsModal } from '../../components/modals/prazoDetailsModal';
import { openPrazoEditModal } from '../../components/modals/prazoEditModal';

import { usePrazosData } from './hooks/usePrazosData';
import { usePrazosState, type SortField } from './hooks/usePrazosState';

import { PrazosHeader } from './components/PrazosHeader';
import { PrazosTable } from './components/PrazosTable';
import { PrazosPagination } from './components/PrazosPagination';

export const Prazos: React.FC = () => {
    const navigate = useNavigate();
    const { escritorio } = useAppStore();

    const { loading, prazos, usuarios, processosList, reload, concluirPrazo, excluirPrazo } = usePrazosData({ escritorio });

    const {
        filtro,
        setFiltro,
        busca,
        setBusca,
        filtroDataInicio,
        setFiltroDataInicio,
        filtroDataFim,
        setFiltroDataFim,
        totalPaginas,
        paginaClamp,
        itensPaginados,
        totalItens,
        rangeInfo,
        irParaPagina,
        pageModel,
        hojeISO,
        orderBy,
        setOrderBy,
        orderDir,
        setOrderDir,
    } = usePrazosState({ prazos, itensPorPagina: 10 });

    const handleRequestSort = (field: SortField) => {
        const isAsc = orderBy === field && orderDir === 'asc';
        setOrderDir(isAsc ? 'desc' : 'asc');
        setOrderBy(field);
    };

    const abrirDetalhes = (p: any) => {
        openPrazoDetailsModal({
            prazo: p,
            processosList,
            onOpenProcess: (procId: any) => navigate(`/processo/${procId}`),
        });
    };

    const handleAdd = () => {
        openPrazoEditModal({
            processosList,
            usuariosList: usuarios,
            onSubmit: async (payload) => {
                try {
                    const { createPrazo } = await import('../../services/supabase');
                    const res = await createPrazo(payload);
                    if (res.error) return { error: res.error };
                    await reload();
                    return { error: null };
                } catch (err) {
                    return { error: err };
                }
            }
        });
    };

    return (
        <div className="animation-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <PrazosHeader
                filtro={filtro}
                onChangeFiltro={setFiltro}
                busca={busca}
                onChangeBusca={setBusca}
                filtroDataInicio={filtroDataInicio}
                onChangeFiltroDataInicio={setFiltroDataInicio}
                filtroDataFim={filtroDataFim}
                onChangeFiltroDataFim={setFiltroDataFim}
                onAddClick={handleAdd}
            />

            <div
                className="card"
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0.75rem',
                }}
            >
                <PrazosTable
                    loading={loading}
                    hojeISO={hojeISO}
                    processosList={processosList}
                    items={itensPaginados}
                    onRowClick={abrirDetalhes}
                    onConcluir={concluirPrazo}
                    onExcluir={excluirPrazo}
                    orderBy={orderBy}
                    orderDir={orderDir}
                    onRequestSort={handleRequestSort}
                />

                <PrazosPagination
                    loading={loading}
                    totalItens={totalItens}
                    rangeInfo={rangeInfo}
                    paginaAtual={paginaClamp}
                    totalPaginas={totalPaginas}
                    pages={pageModel}
                    onChangePage={irParaPagina}
                />
            </div>
        </div>
    );
};