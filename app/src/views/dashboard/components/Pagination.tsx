import React from 'react';

type Props = {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
};

export const Pagination: React.FC<Props> = ({ page, totalPages, onChange }) => {
    const safeTotal = Math.max(1, totalPages);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <button
                onClick={() => onChange(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: page === 1 ? 'var(--text-dim)' : '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
            >
                ‹ Anterior
            </button>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                {Array.from({ length: safeTotal }).slice(0, 50).map((_, idx) => {
                    const p = idx + 1;
                    const active = p === page;
                    return (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            style={{
                                background: active ? 'rgba(0,217,255,0.15)' : 'rgba(255,255,255,0.05)',
                                color: active ? '#00d9ff' : '#d1d5db',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 10px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                minWidth: '38px',
                                fontWeight: 700,
                            }}
                        >
                            {p}
                        </button>
                    );
                })}
            </div>

            <button
                onClick={() => onChange(Math.min(safeTotal, page + 1))}
                disabled={page === safeTotal}
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: page === safeTotal ? 'var(--text-dim)' : '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: page === safeTotal ? 'not-allowed' : 'pointer',
                }}
            >
                Próximo ›
            </button>
        </div>
    );
};