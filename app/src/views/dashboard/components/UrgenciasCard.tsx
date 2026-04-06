import React, { useEffect, useMemo, useState } from 'react';
import { CalendarEvent } from '../types/dashboard.types';
import { toLocalDate } from '../utils/date';
import { Pagination } from './Pagination';
import { completePrazo, remove } from '../../../services/supabase';
import { confirmDark, notifyDark } from '../../prazos/utils/alerts';

type Props = {
    events: CalendarEvent[];
    processosList: any[];
    onSelect: (event: CalendarEvent) => void;
    onRefresh?: () => void | Promise<void>;
};

export const UrgenciasCard: React.FC<Props> = ({ events, processosList, onSelect, onRefresh }) => {
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    const [busca, setBusca] = useState('');

    type SortField = 'data_fatal' | 'tarefa' | 'processo' | 'responsavel' | null;
    type SortOrder = 'asc' | 'desc';
    const [orderBy, setOrderBy] = useState<SortField>(null);
    const [orderDir, setOrderDir] = useState<SortOrder>('asc');

    // Ajuste fino: altura máxima da tabela antes de aparecer a rolagem
    const TABLE_MAX_HEIGHT = 420;

    const concluirPrazo = async (id: number) => {
        const ok = await confirmDark({
            title: 'Concluir?',
            text: 'Isso marcará como FEITO.',
            confirmText: 'Sim, concluir',
        });
        if (!ok) return;

        try {
            const { error } = await completePrazo(id);
            if (error) throw error;

            await notifyDark({
                icon: 'success',
                title: 'Concluído!',
                text: 'Marcado como FEITO.',
            });

            if (onRefresh) onRefresh();
        } catch (e) {
            console.error(e);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível concluir.',
            });
        }
    };

    const excluirPrazo = async (id: number) => {
        const ok = await confirmDark({
            title: 'Excluir?',
            text: 'Essa ação não pode ser desfeita.',
            confirmText: 'Sim, excluir',
            danger: true,
        });
        if (!ok) return;

        try {
            const { error } = await remove('Jur_Prazos', id);
            if (error) throw error;

            await notifyDark({
                icon: 'success',
                title: 'Excluído!',
                text: 'Removido com sucesso.',
            });

            if (onRefresh) onRefresh();
        } catch (e) {
            console.error(e);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível excluir.',
            });
        }
    };

    const urgentes = useMemo(() => {
        const hojeStr = new Date().toISOString().split('T')[0];

        const base = events.filter((e) => {
            const status = (e.resource.status || '').toUpperCase();
            if (status === 'FEITO') return false;
            
            const targetDate = e.resource.data_final || e.resource.data_fatal;
            if (!targetDate) return false;

            const diffTime = new Date(targetDate).getTime() - new Date(hojeStr).getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 3) return false;

            if (busca) {
                const termo = busca.toLowerCase();
                const matchBusca =
                    (e.resource.tarefa?.toLowerCase().includes(termo)) ||
                    (e.resource.responsavel?.toLowerCase().includes(termo)) ||
                    (e.resource.processo?.toString().toLowerCase().includes(termo));
                if (!matchBusca) return false;
            }

            return true;
        });

        // 1) Hoje no topo
        const doDia = base
            .filter((e) => (e.resource.data_final || e.resource.data_fatal) === hojeStr)
            .sort(
                (a, b) =>
                    new Date(a.resource.data_final || a.resource.data_fatal).getTime() - new Date(b.resource.data_final || b.resource.data_fatal).getTime()
            );

        // 2) Atrasados depois (mais antigo -> mais recente)
        const atrasados = base
            .filter((e) => (e.resource.data_final || e.resource.data_fatal) < hojeStr)
            .sort(
                (a, b) =>
                    new Date(a.resource.data_final || a.resource.data_fatal).getTime() - new Date(b.resource.data_final || b.resource.data_fatal).getTime()
            );

        // 3) Próximos 3 dias (mais próximo -> mais distante)
        const proximos = base
            .filter((e) => (e.resource.data_final || e.resource.data_fatal) > hojeStr)
            .sort(
                (a, b) =>
                    new Date(a.resource.data_final || a.resource.data_fatal).getTime() - new Date(b.resource.data_final || b.resource.data_fatal).getTime()
            );

        const result = [...doDia, ...atrasados, ...proximos];

        if (orderBy) {
            result.sort((a, b) => {
                let valA = a.resource[orderBy];
                let valB = b.resource[orderBy];

                if (valA === null || valA === undefined) valA = '';
                if (valB === null || valB === undefined) valB = '';

                let resultCompare = 0;
                if (typeof valA === 'string' && typeof valB === 'string') {
                    resultCompare = valA.localeCompare(valB);
                } else {
                    if (valA < valB) resultCompare = -1;
                    else if (valA > valB) resultCompare = 1;
                }

                return orderDir === 'asc' ? resultCompare : -resultCompare;
            });
        }

        return result;
    }, [events, orderBy, orderDir, busca]);

    useEffect(() => {
        setPage(1);
    }, [urgentes.length, orderBy, orderDir, busca]);

    const handleRequestSort = (field: SortField) => {
        const isAsc = orderBy === field && orderDir === 'asc';
        setOrderDir(isAsc ? 'desc' : 'asc');
        setOrderBy(field);
    };

    const columns: Array<{ label: string; field: SortField }> = [
        { label: 'DATA FINAL', field: 'data_fatal' },
        { label: 'TAREFA', field: 'tarefa' },
        { label: 'PROCESSO', field: 'processo' },
        { label: 'RESPONSÁVEL', field: 'responsavel' },
        { label: 'AÇÃO', field: null },
    ];

    const totalPages = Math.max(1, Math.ceil(urgentes.length / PAGE_SIZE));

    const paginados = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return urgentes.slice(start, start + PAGE_SIZE);
    }, [urgentes, page]);

    return (
        <div
            className="card"
            style={{
                padding: '1.5rem',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    marginBottom: '1.25rem',
                }}
            >
                <h3
                    style={{
                        color: 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        justifyContent: 'flex-start',
                        margin: 0,
                    }}
                >
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span> Tarefas Urgentes / Vencidas (3 dias)
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Buscar tarefa..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{
                            padding: '0.45rem 0.9rem',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            borderRadius: '999px',
                            outline: 'none',
                            fontSize: '0.85rem'
                        }}
                    />

                    {urgentes.length > 0 && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Mostrando {(page - 1) * PAGE_SIZE + 1}-
                            {Math.min(page * PAGE_SIZE, urgentes.length)} de {urgentes.length}
                        </div>
                    )}
                </div>
            </div>

            {urgentes.length === 0 ? (
                <div
                    style={{
                        padding: '2rem',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'var(--table-stripe)',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-color)',
                    }}
                >
                    Nenhuma tarefa pendente com risco de prazo. Excelente trabalho! 🎉
                </div>
            ) : (
                <>
                    <div
                        style={{
                            overflowX: 'auto',
                            overflowY: 'auto',
                            maxHeight: `${TABLE_MAX_HEIGHT}px`,
                            background: 'var(--bg-panel)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                        }}
                    >
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                textAlign: 'center',
                                minWidth: '700px',
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        borderBottom: '2px solid var(--border-color)',
                                        color: 'var(--text-muted)',
                                        fontSize: '0.85rem',
                                        background: 'var(--table-stripe)',
                                    }}
                                >
                                    {columns.map((col, idx) => (
                                        <th
                                            key={col.label}
                                            onClick={() => { if (col.field) handleRequestSort(col.field); }}
                                            style={{
                                                padding: '1rem',
                                                fontWeight: 600,
                                                textAlign: idx === 1 ? 'left' : 'center',
                                                position: 'sticky',
                                                top: 0,
                                                zIndex: 2,
                                                background: 'var(--bg-darker)',
                                                cursor: col.field ? 'pointer' : 'default',
                                                userSelect: 'none'
                                            }}
                                        >
                                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: idx === 1 ? 'flex-start' : 'center', gap: '4px', width: '100%' }}>
                                                {col.label}
                                                {orderBy === col.field && col.field !== null && (
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--info)' }}>
                                                        {orderDir === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {paginados.map((u) => {
                                    const p = u.resource;
                                    const hojeStr = new Date().toISOString().split('T')[0];

                                    const targetDate = p.data_final || p.data_fatal || '';
                                    const diffTime =
                                        new Date(targetDate).getTime() - new Date(hojeStr).getTime();
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                    let statusColor = '#10b981'; // Perto de vencer (Verde default)
                                    let statusBg = 'rgba(16, 185, 129, 0.05)';

                                    if (diffDays < 0) {
                                        statusColor = '#ef4444'; // Vencido (Vermelho)
                                        statusBg = 'rgba(239, 68, 68, 0.05)';
                                    } else if (diffDays === 0) {
                                        statusColor = '#f59e0b'; // Hoje (Amarelo)
                                        statusBg = 'rgba(245, 158, 11, 0.05)';
                                    }

                                    return (
                                        <tr
                                            key={u.id}
                                            style={{
                                                borderBottom: '1px solid var(--border-color)',
                                                transition: 'background 0.2s',
                                                background: statusBg,
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding: '1rem',
                                                    color: statusColor,
                                                    fontWeight: 'bold',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {toLocalDate(targetDate).toLocaleDateString('pt-BR')}
                                                {targetDate === hojeStr && (
                                                    <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.85 }}>
                                                        Hoje
                                                    </span>
                                                )}
                                                {diffDays < 0 && (
                                                    <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8 }}>
                                                        Vencido
                                                    </span>
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding: '1rem',
                                                    color: 'var(--text-main)',
                                                    fontWeight: 500,
                                                    textAlign: 'left',
                                                    maxWidth: '220px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                                title={p.tarefa}
                                            >
                                                {p.tarefa}
                                            </td>

                                            <td
                                                style={{
                                                    padding: '1rem',
                                                    color: 'var(--text-main)',
                                                    textAlign: 'center',
                                                    maxWidth: '180px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                                title={(() => {
                                                    const matchProc = processosList.find(
                                                        (proc: any) => (proc.numero || proc.id) == p.processo
                                                    );
                                                    return matchProc
                                                        ? matchProc.numero_autos || matchProc.numero || matchProc.id
                                                        : p.processo || '-';
                                                })()}
                                            >
                                                {(() => {
                                                    const matchProc = processosList.find(
                                                        (proc: any) => (proc.numero || proc.id) == p.processo
                                                    );
                                                    return matchProc
                                                        ? matchProc.numero_autos || matchProc.numero || matchProc.id
                                                        : p.processo || '-';
                                                })()}
                                            </td>

                                            <td style={{ padding: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>
                                                {p.responsavel || 'Geral'}
                                            </td>

                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                                                    <button
                                                        title="Concluir"
                                                        onClick={(e) => { e.stopPropagation(); p.id && concluirPrazo(p.id); }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            borderRadius: 10,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(16,185,129,0.14)',
                                                            border: '1px solid rgba(16,185,129,0.28)',
                                                            color: '#10b981',
                                                            cursor: 'pointer',
                                                            transition: 'transform .15s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M20 6 9 17l-5-5" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        title="Visualizar / Editar"
                                                        onClick={(e) => { e.stopPropagation(); onSelect(u); }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            borderRadius: 10,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(59,130,246,0.14)',
                                                            border: '1px solid rgba(59,130,246,0.28)',
                                                            color: '#3b82f6',
                                                            cursor: 'pointer',
                                                            transition: 'transform .15s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>

                                                    <button
                                                        title="Remover"
                                                        onClick={(e) => { e.stopPropagation(); p.id && excluirPrazo(p.id); }}
                                                        style={{
                                                            width: 30,
                                                            height: 30,
                                                            borderRadius: 10,
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: 'rgba(239,68,68,0.12)',
                                                            border: '1px solid rgba(239,68,68,0.22)',
                                                            color: '#ef4444',
                                                            cursor: 'pointer',
                                                            transition: 'transform .15s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18" />
                                                            <path d="M8 6V4h8v2" />
                                                            <path d="M19 6l-1 14H6L5 6" />
                                                            <path d="M10 11v6" />
                                                            <path d="M14 11v6" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </>
            )}
        </div>
    );
};