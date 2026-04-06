import React from "react";

type Props = {
    filtroStatus: string;
    onChangeFiltroStatus: (v: string) => void;
    filtroDataInicio: string;
    onChangeFiltroDataInicio: (v: string) => void;
    filtroDataFim: string;
    onChangeFiltroDataFim: (v: string) => void;
};

function PillButton(props: { active: boolean; label: string; onClick: () => void }) {
    const { active, label, onClick } = props;

    return (
        <button
            onClick={onClick}
            style={{
                padding: "0.45rem 0.85rem",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.22)",
                background: active ? "rgba(56,189,248,0.18)" : "var(--bg-surface)",
                color: active ? "#e0f2fe" : "var(--text-main)",
                cursor: "pointer",
                fontWeight: 650,
                fontSize: "0.85rem",
                transition: "all 120ms ease",
            }}
        >
            {label}
        </button>
    );
}

export const ProcessosFilters: React.FC<Props> = ({
    filtroStatus, onChangeFiltroStatus,
    filtroDataInicio, onChangeFiltroDataInicio,
    filtroDataFim, onChangeFiltroDataFim
}) => {
    return (
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
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
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                <PillButton active={filtroStatus === "TODOS"} label="Todos" onClick={() => onChangeFiltroStatus("TODOS")} />
                <PillButton active={filtroStatus === "ATIVO"} label="Ativos" onClick={() => onChangeFiltroStatus("ATIVO")} />
                <PillButton
                    active={filtroStatus === "ARQUIVADO"}
                    label="Arquivados"
                    onClick={() => onChangeFiltroStatus("ARQUIVADO")}
                />
            </div>
        </div>
    );
};