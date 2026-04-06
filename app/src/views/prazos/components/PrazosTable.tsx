import React from 'react';
import type { Prazo } from '../hooks/usePrazosData';
import { formatDateBR, getProcessLabel, getStatusStyles } from '../utils/prazos.utils';
import type { SortField, SortOrder } from '../hooks/usePrazosState';
type Props = {
    loading: boolean;
    hojeISO: string;
    processosList: any[];
    items: Prazo[];
    onRowClick: (p: Prazo) => void;
    onConcluir: (id: number) => void;
    onExcluir: (id: number) => void;
    orderBy: SortField;
    orderDir: SortOrder;
    onRequestSort: (field: SortField) => void;
};

export const PrazosTable: React.FC<Props> = ({
    loading,
    hojeISO,
    processosList,
    items,
    onRowClick,
    onConcluir,
    onExcluir,
    orderBy,
    orderDir,
    onRequestSort,
}) => {
    const columns: Array<{ label: string; field: SortField }> = [
        { label: 'Processo', field: 'processo' },
        { label: 'Tarefa', field: 'tarefa' },
        { label: 'Responsável', field: 'responsavel' },
        { label: 'Data Fatal', field: 'data_fatal' },
        { label: 'Status', field: 'status' },
        { label: 'Conclusão', field: 'data_conclusao' },
        { label: 'Ações', field: null },
    ];
    return (
        <div style={{ maxHeight: '62vh', overflowY: 'auto', overflowX: 'auto', paddingRight: '0.25rem' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', minWidth: 900 }}>
                <thead>
                    <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {columns.map((col, idx) => (
                            <th
                                key={col.label}
                                onClick={() => { if (col.field) onRequestSort(col.field); }}
                                style={{
                                    padding: '0.6rem 0.85rem',
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 2,
                                    background: 'var(--bg-darker)',
                                    textAlign: idx === 6 ? 'right' : 'left',
                                    cursor: col.field ? 'pointer' : 'default',
                                    userSelect: 'none'
                                }}
                            >
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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

                <tbody style={{ fontSize: '0.86rem' }}>
                    {loading ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Carregando prazos...
                            </td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                Nenhum prazo encontrado nesta visão.
                            </td>
                        </tr>
                    ) : (
                        items.map((p) => {
                            const { statusBg, statusColor } = getStatusStyles(p, hojeISO);

                            const cellBase: React.CSSProperties = {
                                padding: '0.65rem 0.85rem',
                                background: 'var(--bg-panel)',
                                borderTop: '1px solid var(--border-color)',
                                borderBottom: '1px solid var(--border-color)',
                                lineHeight: 1.25
                            };

                            return (
                                <tr
                                    key={p.id}
                                    onClick={() => onRowClick(p)}
                                    style={{
                                        opacity: p.status === 'FEITO' ? 0.75 : 1,
                                        cursor: 'pointer',
                                        transition: 'transform .15s, background .15s'
                                    }}
                                    onMouseOver={(e) => {
                                        (e.currentTarget as HTMLTableRowElement).style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseOut={(e) => {
                                        (e.currentTarget as HTMLTableRowElement).style.transform = 'translateY(0)';
                                    }}
                                >
                                    <td style={{ ...cellBase, color: 'var(--text-main)', borderTopLeftRadius: 14, borderBottomLeftRadius: 14, maxWidth: 170, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {getProcessLabel(p.processo, processosList) ?? '-'}
                                    </td>

                                    <td style={{ ...cellBase, color: 'var(--text-main)', maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.tarefa}
                                    </td>

                                    <td style={{ ...cellBase, color: 'var(--text-main)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.responsavel || '-'}
                                    </td>

                                    <td style={{ ...cellBase, color: 'var(--text-main)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                        {formatDateBR(p.data_fatal, false)}
                                    </td>

                                    <td style={cellBase}>
                                        <span
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '0.18rem 0.55rem',
                                                borderRadius: '999px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                background: statusBg,
                                                color: statusColor,
                                                border: `1px solid ${statusColor}33`
                                            }}
                                        >
                                            {p.status}
                                        </span>
                                    </td>

                                    <td style={{ ...cellBase, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {p.data_conclusao ? formatDateBR(p.data_conclusao) : '-'}
                                    </td>

                                    <td style={{ ...cellBase, borderTopRightRadius: 14, borderBottomRightRadius: 14, textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                                            {p.status !== 'FEITO' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onConcluir(p.id); }}
                                                    title="Concluir prazo"
                                                    aria-label="Concluir prazo"
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
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 6 9 17l-5-5" />
                                                    </svg>
                                                </button>
                                            )}

                                            <button
                                                onClick={(e) => { e.stopPropagation(); onExcluir(p.id); }}
                                                title="Excluir prazo"
                                                aria-label="Excluir prazo"
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
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
};