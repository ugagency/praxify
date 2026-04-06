import React from 'react';
import type { PaginationModelItem, RangeInfo } from '../utils/prazos.utils';

type Props = {
    loading: boolean;
    totalItens: number;
    rangeInfo: RangeInfo;
    paginaAtual: number;
    totalPaginas: number;
    pages: PaginationModelItem[];
    onChangePage: (p: number) => void;
};

export const PrazosPagination: React.FC<Props> = ({
    loading,
    totalItens,
    rangeInfo,
    paginaAtual,
    totalPaginas,
    pages,
    onChangePage,
}) => {
    if (loading || totalItens === 0) return null;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.65rem 0.35rem 0.25rem 0.35rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
                fontSize: '0.85rem'
            }}
        >
            <div>
                Exibindo{' '}
                <strong style={{ color: 'var(--text-main)' }}>{rangeInfo.start}</strong>
                {' - '}
                <strong style={{ color: 'var(--text-main)' }}>{rangeInfo.end}</strong>{' '}
                de <strong style={{ color: 'var(--text-main)' }}>{rangeInfo.total}</strong>
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button
                    onClick={() => onChangePage(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    title="Página anterior"
                    aria-label="Página anterior"
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.05)',
                        color: paginaAtual === 1 ? 'var(--text-dim)' : '#f3f4f6',
                        cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {pages.map((p, idx) =>
                    p === '...' ? (
                        <span key={`dots-${idx}`} style={{ padding: '0 0.35rem', opacity: 0.7 }}>
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onChangePage(p)}
                            title={`Ir para página ${p}`}
                            aria-label={`Ir para página ${p}`}
                            style={{
                                minWidth: 34,
                                height: 34,
                                padding: '0 0.5rem',
                                borderRadius: 10,
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: p === paginaAtual ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.05)',
                                color: p === paginaAtual ? '#00d9ff' : '#f3f4f6',
                                cursor: 'pointer',
                                fontWeight: 800
                            }}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onChangePage(paginaAtual + 1)}
                    disabled={paginaAtual === totalPaginas}
                    title="Próxima página"
                    aria-label="Próxima página"
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.12)',
                        background: 'rgba(255,255,255,0.05)',
                        color: paginaAtual === totalPaginas ? 'var(--text-dim)' : '#f3f4f6',
                        cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>
        </div>
    );
};