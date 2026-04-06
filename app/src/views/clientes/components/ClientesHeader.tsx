import React from "react";

type Props = {
    loading: boolean;
    total: number;
    filteredTotal: number;
    busca: string;
    onBuscaChange: (v: string) => void;
    onNovo: () => void;
};

export const ClientesHeader: React.FC<Props> = ({ loading, total, filteredTotal, busca, onBuscaChange, onNovo }) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "1rem",
                padding: "0.25rem 0.25rem 0.75rem 0.25rem",
                borderBottom: "1px solid var(--border-color)",
                marginBottom: "0.9rem",
            }}
        >
            <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            background: "rgba(16,185,129,0.14)",
                            border: "1px solid rgba(16,185,129,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-main)",
                            fontWeight: 800,
                        }}
                    >
                        👥
                    </div>

                    <div>
                        <h3 style={{ margin: 0, color: "var(--text-main)" }}>Clientes</h3>
                        <p style={{ color: "var(--text-muted)", margin: "0.25rem 0 0 0", fontSize: "0.875rem" }}>
                            {loading ? (
                                "Carregando…"
                            ) : (
                                <>
                                    <b style={{ color: "var(--text-main)" }}>{filteredTotal}</b> encontrado(s) • Total{" "}
                                    <b style={{ color: "var(--text-main)" }}>{total}</b>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.55rem 0.8rem",
                        background: "var(--bg-surface)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        borderRadius: "0.75rem",
                        minWidth: 320,
                    }}
                >
                    <span style={{ color: "var(--text-muted)" }}>🔎</span>
                    <input
                        value={busca}
                        onChange={(e) => onBuscaChange(e.target.value)}
                        placeholder="Buscar por nome ou CPF/CNPJ…"
                        style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            color: "var(--text-main)",
                            fontSize: "0.95rem",
                        }}
                    />
                    {!!busca && (
                        <button
                            type="button"
                            onClick={() => onBuscaChange("")}
                            title="Limpar"
                            style={{
                                border: "none",
                                background: "transparent",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                padding: 0,
                                fontSize: "1.05rem",
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>

                <button 
                    type="button"
                    onClick={onNovo} 
                    style={{
                        padding: "0.58rem 1.25rem",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.20)",
                        background: "var(--bg-surface)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    + Novo Cliente
                </button>
            </div>
        </div>
    );
};