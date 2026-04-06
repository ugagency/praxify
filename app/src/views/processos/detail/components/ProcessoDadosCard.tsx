import React from "react";
import type { ProcessoDetalhe } from "../types/processoDetalhe.types";

type Props = {
    processo: ProcessoDetalhe;
    onEdit?: () => void;
    onUpdated?: () => void; // ✅ optional callback after save
};

function Field(props: { label: string; value: React.ReactNode }) {
    return (
        <div
            style={{
                padding: "0.75rem 0.85rem",
                borderRadius: 14,
                border: "1px solid rgba(148,163,184,0.12)",
                background: "rgba(2,6,23,0.30)",
            }}
        >
            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 850, letterSpacing: 0.35 }}>
                {props.label}
            </div>
            <div style={{ marginTop: 6, color: "var(--text-main)", fontWeight: 750, fontSize: "0.95rem" }}>
                {props.value}
            </div>
        </div>
    );
}

function v(val: unknown) {
    const s = String(val ?? "").trim();
    return s ? s : "-";
}

export const ProcessoDadosCard: React.FC<Props> = ({ processo, onEdit }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid rgba(148,163,184,0.14)",
                background: "var(--bg-panel)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
                minWidth: 0,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                        📌 Dados do processo
                    </h4>
                </div>
                <button
                    onClick={() => onEdit?.()}
                    style={{
                        padding: "0.45rem 0.85rem",
                        borderRadius: 10,
                        border: "1px solid rgba(148,163,184,0.18)",
                        background: "var(--bg-surface)",
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontWeight: 850,
                        fontSize: "0.82rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = "rgba(0, 217, 255, 0.1)")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
                >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar Status/Advogado
                </button>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                }}
            >
                <Field label="Número do processo" value={v(processo.numero_autos)} />
                <Field label="Tribunal" value={v(processo.tribunal)} />
                <Field label="Status atual" value={v(processo.status)} />
                <Field label="Advogado do caso" value={v(processo.responsavel?.nome)} />

                {isExpanded && (
                    <>
                        <Field
                            label="Data de cadastro"
                            value={processo.criado_em ? new Date(String(processo.criado_em)).toLocaleString("pt-BR") : "-"}
                        />
                        <Field label="ID no sistema" value={`#${processo.id}`} />
                        <Field label="Código do cliente" value={processo.cliente_id} />
                    </>
                )}
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: "0.5rem" }}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    {isExpanded ? (
                        <>
                            <span>▲ Ocultar detalhes</span>
                        </>
                    ) : (
                        <>
                            <span>▼ Mostrar mais detalhes</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};