import React from "react";

type Props = {
    total: number;
    shown: number;
    filtroTexto: string;
    onChangeFiltroTexto: (v: string) => void;
    onNovoProcesso: () => void;
};

export const ProcessosHeader: React.FC<Props> = ({
    total,
    shown,
    filtroTexto,
    onChangeFiltroTexto,
    onNovoProcesso,
}) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "flex-start",
            }}
        >
            <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.25rem", fontWeight: 750 }}>
                        Meus Processos
                    </h2>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        {shown} de {total}
                    </span>
                </div>

                <p style={{ margin: "0.25rem 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                    Gerenciamento de processos jurídicos e atendimentos
                </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ position: "relative" }}>
                    <input
                        type="text"
                        placeholder="Buscar por número, cliente ou tribunal..."
                        value={filtroTexto}
                        onChange={(e) => onChangeFiltroTexto(e.target.value)}
                        style={{
                            padding: "0.62rem 0.95rem 0.62rem 2.15rem",
                            border: "1px solid rgba(148,163,184,0.18)",
                            borderRadius: "999px",
                            minWidth: 320,
                            background: "var(--bg-panel)",
                            color: "var(--text-main)",
                            outline: "none",
                        }}
                    />
                    <span
                        style={{
                            position: "absolute",
                            left: 12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)",
                            fontSize: "0.95rem",
                            pointerEvents: "none",
                        }}
                    >
                        🔎
                    </span>
                </div>

                <button
                    onClick={onNovoProcesso}
                    style={{
                        padding: "0.58rem 0.95rem",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.20)",
                        background: "var(--bg-surface)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    + Novo Processo
                </button>
            </div>
        </div>
    );
};