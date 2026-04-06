import React, { useMemo } from "react";
import type { ProcessoDetalhe } from "../types/processoDetalhe.types";

type Props = {
    processo: ProcessoDetalhe;
    onBack: () => void;
};

function StatusPill({ label }: { label: string }) {
    const s = (label || "").toUpperCase();

    const map: Record<string, { bg: string; border: string; color: string }> = {
        ATIVO: { bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.35)", color: "var(--text-main)" },
        ARQUIVADO: { bg: "rgba(239,68,68,0.14)", border: "rgba(239,68,68,0.35)", color: "var(--text-main)" },
        PRE_PROCESSUAL: { bg: "rgba(56,189,248,0.14)", border: "rgba(56,189,248,0.35)", color: "var(--text-main)" },
        PENDENTE: { bg: "rgba(239,68,68,0.14)", border: "rgba(239,68,68,0.35)", color: "var(--text-main)" },
        ABERTO: { bg: "rgba(56,189,248,0.14)", border: "rgba(56,189,248,0.35)", color: "var(--text-main)" },
    };

    const cfg = map[s] || { bg: "var(--border-color)", border: "var(--border-color)", color: "var(--text-main)" };

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.18rem 0.6rem",
                borderRadius: 999,
                border: `1px solid ${cfg.border}`,
                background: cfg.bg,
                color: cfg.color,
                fontSize: "0.72rem",
                fontWeight: 900,
                letterSpacing: 0.35,
                whiteSpace: "nowrap",
            }}
        >
            {s || "-"}
        </span>
    );
}

function ActionButton(props: {
    onClick?: () => void;
    variant: "primary" | "success" | "neutral";
    children: React.ReactNode;
}) {
    const { onClick, variant, children } = props;

    const styles =
        variant === "success"
            ? { bg: "rgba(16,185,129,0.16)", border: "rgba(16,185,129,0.45)", color: "var(--success)" }
            : variant === "primary"
                ? { bg: "rgba(56,189,248,0.16)", border: "rgba(56,189,248,0.45)", color: "var(--accent)" }
                : { bg: "var(--bg-surface)", border: "var(--border-color)", color: "var(--text-main)" };

    return (
        <button
            onClick={onClick}
            style={{
                padding: "0.55rem 0.85rem",
                borderRadius: 12,
                border: `1px solid ${styles.border}`,
                background: styles.bg,
                color: styles.color,
                cursor: "pointer",
                fontWeight: 800,
                whiteSpace: "nowrap",
            }}
        >
            {children}
        </button>
    );
}

export const ProcessoDetalheHeader: React.FC<Props> = ({ processo, onBack }) => {
    const isPre = useMemo(() => {
        return !processo.numero_autos || processo.status === "PRE_PROCESSUAL";
    }, [processo.numero_autos, processo.status]);

    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid var(--border-color)",
                background: "var(--bg-panel)",
                padding: "0.9rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                flexWrap: "wrap",
            }}
        >
            <div style={{ minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button
                        onClick={onBack}
                        aria-label="Voltar"
                        title="Voltar"
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 12,
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-surface)",
                            color: "var(--text-main)",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        ←
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem", fontWeight: 900 }}>
                                {processo.numero_autos
                                    ? `Processo nº ${processo.numero_autos}`
                                    : "Atendimento Pré-Processual (Sem número)"}
                            </h3>

                            <StatusPill label={String(processo.status || "-")} />
                            {isPre && <StatusPill label="Aguardando Protocolo" />}
                            {processo.tribunal === "FECHADO" && <StatusPill label="Contrato Fechado" />}
                        </div>

                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                            <span>🏛 {processo.tribunal || "Tribunal não informado"}</span>
                            <span>•</span>
                            <span>👤 {processo.cliente?.nome || "Cliente não informado"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {isPre && !processo.cliente?.cpf_cnpj && (
                    <ActionButton variant="primary" onClick={() => { }}>
                        🤝 Completar Cadastro
                    </ActionButton>
                )}

                {!isPre && (
                    <ActionButton
                        variant="neutral"
                        onClick={() => window.open("https://esaj.tjsp.jus.br/cpopg/open.do", "_blank")}
                    >
                        Ver no tribunal
                    </ActionButton>
                )}

                {isPre && (
                    <ActionButton variant="success" onClick={() => { }}>
                        ✅ Protocolar Ação
                    </ActionButton>
                )}
            </div>
        </div>
    );
};