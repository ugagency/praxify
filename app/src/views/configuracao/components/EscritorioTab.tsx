import React from 'react';
import type { FormEscritorio } from '../Configuracoes';

interface Props {
    formEsc: FormEscritorio;
    savingEsc: boolean;
    onChange: (next: FormEscritorio) => void;
    onSubmit: (event: React.FormEvent) => void;
}

export const EscritorioTab: React.FC<Props> = ({
    formEsc,
    savingEsc,
    onChange,
    onSubmit
}) => {
    const fieldStyle: React.CSSProperties = {
        padding: '0.75rem 1rem',
        background: 'var(--bg-surface)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        width: '100%',
        fontSize: '0.9rem',
        transition: 'border-color 0.2s',
        outline: 'none'
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.6rem',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
    };

    return (
        <div className="animation-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header Section */}
            <div
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                }}
            >
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>
                    🏢 Dados do Escritório
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>
                    Informações cadastrais e de contato do seu escritório.
                </p>
            </div>

            {/* Content Section */}
            <div
                className="card"
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.5rem',
                }}
            >
                <form
                    onSubmit={onSubmit}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}
                >
                    <div>
                        <label style={labelStyle}>
                            Nome do Escritório
                        </label>
                        <input
                            required
                            type="text"
                            value={formEsc.nome}
                            onChange={(e) =>
                                onChange({
                                    ...formEsc,
                                    nome: e.target.value
                                })
                            }
                            style={{ ...fieldStyle, boxSizing: 'border-box' }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(208,168,79,0.5)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1.25rem',
                            width: '100%'
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={labelStyle}>
                                CNPJ
                            </label>
                            <input
                                type="text"
                                value={formEsc.cnpj}
                                onChange={(e) =>
                                    onChange({
                                        ...formEsc,
                                        cnpj: e.target.value
                                    })
                                }
                                placeholder="00.000.000/0000-00"
                                style={{ ...fieldStyle, boxSizing: 'border-box' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(208,168,79,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={labelStyle}>
                                Endereço
                            </label>
                            <input
                                type="text"
                                value={formEsc.endereco}
                                onChange={(e) =>
                                    onChange({
                                        ...formEsc,
                                        endereco: e.target.value
                                    })
                                }
                                placeholder="Rua, Número, Bairro, Cidade - UF"
                                style={{ ...fieldStyle, boxSizing: 'border-box' }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(208,168,79,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            paddingTop: '0.5rem',
                            borderTop: '"1px solid var(--border-color)"'
                        }}
                    >
                        <button
                            type="submit"
                            disabled={savingEsc}
                            style={{
                                padding: "0.58rem 1.25rem",
                                borderRadius: 12,
                                border: "1px solid rgba(148,163,184,0.20)",
                                background: "var(--bg-surface)",
                                color: "var(--text-main)",
                                cursor: "pointer",
                                fontWeight: 650,
                                whiteSpace: "nowrap",
                                opacity: savingEsc ? 0.7 : 1
                            }}
                        >
                            {savingEsc ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};