import React from 'react';
import type { PrazoFiltro } from '../hooks/usePrazosState';

type Props = {
    filtro: PrazoFiltro;
    onChangeFiltro: (f: PrazoFiltro) => void;
    busca: string;
    onChangeBusca: (b: string) => void;
    filtroDataInicio: string;
    onChangeFiltroDataInicio: (v: string) => void;
    filtroDataFim: string;
    onChangeFiltroDataFim: (v: string) => void;
    onAddClick?: () => void;
};

export const PrazosHeader: React.FC<Props> = ({
    filtro, onChangeFiltro,
    busca, onChangeBusca,
    filtroDataInicio, onChangeFiltroDataInicio,
    filtroDataFim, onChangeFiltroDataFim,
    onAddClick
}) => {
    const filtros = [
        { key: 'hoje', label: 'Hoje', bg: 'rgba(16,185,129,0.22)', border: 'rgba(16,185,129,0.55)' },
        { key: 'mes', label: 'Mês', bg: 'rgba(59,130,246,0.25)', border: 'rgba(59,130,246,0.55)' },
        { key: 'semana', label: 'Semana', bg: 'rgba(245,158,11,0.22)', border: 'rgba(245,158,11,0.55)' },
        { key: 'atrasados', label: 'Atrasados', bg: 'rgba(239,68,68,0.20)', border: 'rgba(239,68,68,0.55)' },
    ] as const;

    return (
        <div
            className="card"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                borderRadius: '16px',
                background: 'var(--bg-panel)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.1rem'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <button
                    onClick={onAddClick}
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(16,185,129,0.35)',
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                    }}
                    title="Adicionar Novo Prazo"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Tarefas e Compromissos</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                        Gerenciamento de datas fatais e compromissos
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Buscar prazo..."
                    value={busca}
                    onChange={(e) => onChangeBusca(e.target.value)}
                    style={{
                        padding: '0.45rem 0.9rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'var(--text-main)',
                        borderRadius: '999px',
                        outline: 'none',
                        fontSize: '0.85rem'
                    }}
                />
                {filtros.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => onChangeFiltro(f.key as any)}
                        style={{
                            padding: '0.45rem 0.9rem',
                            background: filtro === f.key ? f.bg : 'transparent',
                            border: `1px solid ${filtro === f.key ? f.border : 'rgba(148,163,184,0.25)'}`,
                            color: filtro === f.key ? '#fff' : '#9ca3af',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            transition: 'all .2s',
                            fontSize: '0.85rem',
                            fontWeight: 700
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>De</span>
                    <input
                        type="date"
                        value={filtroDataInicio}
                        onChange={(e) => onChangeFiltroDataInicio(e.target.value)}
                        style={{
                            padding: "0.45rem 0.85rem",
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.22)",
                            background: "var(--bg-panel)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "0.85rem",
                            colorScheme: "dark"
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Até</span>
                    <input
                        type="date"
                        value={filtroDataFim}
                        onChange={(e) => onChangeFiltroDataFim(e.target.value)}
                        style={{
                            padding: "0.45rem 0.85rem",
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.22)",
                            background: "var(--bg-panel)",
                            color: "var(--text-main)",
                            outline: "none",
                            fontSize: "0.85rem",
                            colorScheme: "dark"
                        }}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", justifyContent: "flex-end" }}>
                    <button
                        onClick={() => onChangeFiltro('periodo' as any)}
                        style={{
                            padding: "0.58rem 0.95rem",
                            borderRadius: 12,
                            border: filtro === 'periodo' ? '1px solid rgba(16,185,129,0.55)' : '1px solid rgba(148,163,184,0.20)',
                            background: filtro === 'periodo' ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.06)',
                            color: filtro === 'periodo' ? '#fff' : '#e5e7eb',
                            cursor: 'pointer',
                            fontWeight: 650,
                            whiteSpace: 'nowrap',
                            transition: 'all .2s'
                        }}
                    >
                        Aplicar
                    </button>
                </div>
            </div>
        </div >
    );
};