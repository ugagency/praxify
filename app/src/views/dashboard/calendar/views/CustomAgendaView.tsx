import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { subDays } from 'date-fns/subDays';
import { ptBR } from 'date-fns/locale';

import { Pagination } from "../../components/Pagination";

export const CustomAgendaView = ({ events, onSelectEvent, date }: any) => {
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);

    // Altura máxima do “grid” (tabela de prazos) antes de aparecer a rolagem.
    // Ajuste aqui se quiser mais/menos linhas visíveis.
    const TABLE_MAX_HEIGHT = 420;

    const sortedEvents = useMemo(() => {
        const list = Array.isArray(events) ? [...events] : [];
        const filteredList = list.filter((e: any) => {
            if (!date || !e.start) return true;
            return e.start.getMonth() === date.getMonth() && e.start.getFullYear() === date.getFullYear();
        });

        return filteredList.sort((a: any, b: any) => {
            const at = a?.start?.getTime?.() ?? 0;
            const bt = b?.start?.getTime?.() ?? 0;
            return at - bt;
        });
    }, [events, date]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(sortedEvents.length / PAGE_SIZE));
    }, [sortedEvents.length]);

    // Quando a lista mudar (navegação, refresh etc), volta pra primeira página
    useEffect(() => {
        setPage(1);
    }, [sortedEvents.length]);

    // Se a página atual ficar inválida por mudança de dados, corrige
    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const pageEvents = useMemo(() => {
        const startIdx = (page - 1) * PAGE_SIZE;
        return sortedEvents.slice(startIdx, startIdx + PAGE_SIZE);
    }, [sortedEvents, page]);

    const showingFrom = sortedEvents.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const showingTo = Math.min(page * PAGE_SIZE, sortedEvents.length);

    return (
        <div
            style={{
                padding: '1rem',
                overflowX: 'auto',
                background: 'var(--bg-panel)',
                borderRadius: '12px',
                marginTop: '0.5rem',
                border: '1px solid var(--border-color)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
            }}
        >
            {/* Indicador discreto de paginação */}
            {sortedEvents.length > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    Mostrando {showingFrom}-{showingTo} de {sortedEvents.length}
                </div>
            )}

            {/* Tabela (com rolagem vertical) */}
            <div
                style={{
                    overflowX: 'auto',
                    overflowY: 'auto',
                    maxHeight: `${TABLE_MAX_HEIGHT}px`,
                    minHeight: 0,
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                }}
            >
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left',
                        minWidth: '700px',
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                borderBottom: '2px solid var(--border-color)',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                            }}
                        >
                            <th
                                style={{
                                    padding: '1rem',
                                    fontWeight: 600,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    background: 'var(--bg-darker)',
                                }}
                            >
                                DATA
                            </th>
                            <th
                                style={{
                                    padding: '1rem',
                                    fontWeight: 600,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    background: 'var(--bg-darker)',
                                }}
                            >
                                COMPROMISSO
                            </th>
                            <th
                                style={{
                                    padding: '1rem',
                                    fontWeight: 600,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    background: 'var(--bg-darker)',
                                }}
                            >
                                STATUS
                            </th>
                            <th
                                style={{
                                    padding: '1rem',
                                    fontWeight: 600,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    background: 'var(--bg-darker)',
                                }}
                            >
                                PROCESSO
                            </th>
                            <th
                                style={{
                                    padding: '1rem',
                                    fontWeight: 600,
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    background: 'var(--bg-darker)',
                                }}
                            >
                                RESPONSÁVEL
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {pageEvents.map((e: any) => {
                            const p = e.resource;
                            const hojeStr = new Date().toISOString().split('T')[0];
                            const targetDateStr = p.data_final || p.data_fatal;

                            const statusLabel =
                                p.status === 'FEITO'
                                    ? 'FEITO'
                                    : (new Date(targetDateStr as string) < new Date(hojeStr) ? 'ATRASADO' : 'PENDENTE');

                            const color =
                                p.status === 'FEITO'
                                    ? '#10b981'
                                    : (statusLabel === 'ATRASADO' ? '#ef4444' : '#f59e0b');

                            return (
                                <tr
                                    key={e.id}
                                    onClick={() => onSelectEvent && onSelectEvent(e)}
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseOver={(ev) => (ev.currentTarget.style.background = 'var(--table-stripe)')}
                                    onMouseOut={(ev) => (ev.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                        {format(e.start, 'dd/MM/yyyy')}
                                    </td>

                                    {/* ✅ SEM DESCRIÇÃO: apenas o título */}
                                    <td style={{ padding: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>
                                        {p.tarefa}
                                    </td>

                                    <td style={{ padding: '1rem', color, fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        [{statusLabel}]
                                    </td>

                                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                                        {p.processoLabel || p.processo || 'N/A'}
                                    </td>

                                    <td style={{ padding: '1rem', color: 'var(--text-main)' }}>
                                        {p.responsavel || 'Geral'}
                                    </td>
                                </tr>
                            );
                        })}

                        {sortedEvents.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    Nenhum compromisso neste período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {sortedEvents.length > PAGE_SIZE && (
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
        </div>
    );
};

CustomAgendaView.title = (date: Date) => {
    const month = format(date, 'MMMM yyyy', { locale: ptBR });
    return `Agenda - ${month.charAt(0).toUpperCase() + month.slice(1)}`;
};

CustomAgendaView.navigate = (date: Date, action: string) => {
    switch (action) {
        case 'PREV': return subDays(date, 30);
        case 'NEXT': return addDays(date, 30);
        default: return date;
    }
};