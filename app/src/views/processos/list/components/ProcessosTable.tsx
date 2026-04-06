import React, { useEffect, useMemo, useState } from "react";
import type { Processo } from "../types/processos.types";

type Props = {
    loading: boolean;
    items: Processo[];
    onDetalhes: (id: number) => void;
    onToggleStatus: (p: Processo) => void;
    onExcluir: (id: number) => void;
};

function StatusBadge({ status }: { status: string }) {
    const s = (status || "").toUpperCase();

    const map: Record<string, { bg: string; border: string; color: string; label: string }> = {
        ATIVO: { bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.35)", color: "var(--text-main)", label: "ATIVO" },
        ARQUIVADO: {
            bg: "rgba(239,68,68,0.14)",
            border: "rgba(239,68,68,0.35)",
            color: "var(--text-main)",
            label: "ARQUIVADO",
        },
        PRE_PROCESSUAL: {
            bg: "rgba(56,189,248,0.14)",
            border: "rgba(56,189,248,0.35)",
            color: "var(--text-main)",
            label: "PRÉ-PROCESSUAL",
        },
    };

    const cfg = map[s] || {
        bg: "var(--border-color)",
        border: "var(--border-color)",
        color: "var(--text-main)",
        label: s || "-",
    };

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.18rem 0.55rem",
                borderRadius: 999,
                border: `1px solid ${cfg.border}`,
                background: cfg.bg,
                color: cfg.color,
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: 0.3,
                whiteSpace: "nowrap",
            }}
        >
            {cfg.label}
        </span>
    );
}

function IconButton(props: {
    title: string;
    onClick: () => void;
    variant: "primary" | "neutral" | "danger" | "success";
    children: React.ReactNode;
}) {
    const { title, onClick, variant, children } = props;

    const styles =
        variant === "success"
            ? {
                bg: "rgba(16,185,129,0.14)",
                border: "rgba(16,185,129,0.28)",
                color: "#10b981",
            }
            : variant === "primary"
                ? {
                    bg: "rgba(59,130,246,0.14)",
                    border: "rgba(59,130,246,0.28)",
                    color: "#3b82f6",
                }
                : variant === "danger"
                    ? {
                        bg: "rgba(239,68,68,0.12)",
                        border: "rgba(239,68,68,0.22)",
                        color: "#ef4444",
                    }
                    : {
                        bg: "var(--bg-surface)",
                        border: "var(--bg-surface)",
                        color: "var(--text-muted)",
                    };

    return (
        <button
            title={title}
            onClick={onClick}
            style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                border: `1px solid ${styles.border}`,
                background: styles.bg,
                color: styles.color,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            {children}
        </button>
    );
}

function PaginationButton(props: { disabled?: boolean; active?: boolean; onClick: () => void; children: React.ReactNode }) {
    const { disabled, active, onClick, children } = props;

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.18)",
                background: active ? "rgba(56,189,248,0.18)" : "var(--bg-surface)",
                color: active ? "#e0f2fe" : "var(--text-main)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.45 : 1,
                fontWeight: 800,
            }}
        >
            {children}
        </button>
    );
}

export const ProcessosTable: React.FC<Props> = ({ loading, items, onDetalhes, onToggleStatus, onExcluir }) => {
    // ===============================
    // Paginação
    // ===============================
    const PAGE_SIZE = 10; // <= ajuste aqui se quiser 15, 20, etc.
    const MAX_VISIBLE = 5;

    const [page, setPage] = useState(1);

    // sempre que items mudar (busca/filtro), volta pra primeira página
    useEffect(() => {
        setPage(1);
    }, [items]);

    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const pageSafe = Math.min(Math.max(page, 1), pages);

    const startIdx = (pageSafe - 1) * PAGE_SIZE;
    const endIdxExclusive = Math.min(startIdx + PAGE_SIZE, total);

    const pagedItems = useMemo(() => {
        return items.slice(startIdx, endIdxExclusive);
    }, [items, startIdx, endIdxExclusive]);

    const rangeLabel = useMemo(() => {
        if (total === 0) return "Exibindo 0 - 0 de 0";
        return `Exibindo ${startIdx + 1} - ${endIdxExclusive} de ${total}`;
    }, [total, startIdx, endIdxExclusive]);

    const visiblePages = useMemo(() => {
        if (pages <= MAX_VISIBLE) return Array.from({ length: pages }, (_, i) => i + 1);

        const half = Math.floor(MAX_VISIBLE / 2);
        let start = pageSafe - half;
        let end = pageSafe + half;

        if (start < 1) {
            start = 1;
            end = MAX_VISIBLE;
        }
        if (end > pages) {
            end = pages;
            start = pages - MAX_VISIBLE + 1;
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [pages, pageSafe]);

    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid rgba(148,163,184,0.14)",
                background: "var(--bg-panel)",
                overflow: "hidden",
            }}
        >
            {/* ===============================
                Área com scroll interno (barra lateral)
               =============================== */}
            <div
                style={{
                    maxHeight: 560,
                    overflowY: "auto",
                    overflowX: "auto",

                    // deixa a scrollbar mais discreta em navegadores compatíveis
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(148,163,184,0.35) rgba(2,6,23,0.25)",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: "0 10px",
                        minWidth: 900,
                        padding: "0.5rem 0.75rem 0.75rem",
                    }}
                >
                    <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
                        <tr>
                            {[
                                { label: "PROCESSO", align: "left" as const },
                                { label: "CLIENTE", align: "left" as const },
                                { label: "TRIBUNAL", align: "left" as const },
                                { label: "STATUS", align: "left" as const },
                                { label: "CRIADO EM", align: "left" as const },
                                { label: "AÇÕES", align: "right" as const },
                            ].map((h) => (
                                <th
                                    key={h.label}
                                    style={{
                                        textAlign: h.align,
                                        padding: "0.75rem 0.75rem",
                                        color: "var(--text-muted)",
                                        fontSize: "0.78rem",
                                        fontWeight: 800,
                                        background: "var(--bg-darker)",
                                        backdropFilter: "blur(8px)",
                                    }}
                                >
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                                    Carregando processos...
                                </td>
                            </tr>
                        ) : pagedItems.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                                    Nenhum processo encontrado.
                                </td>
                            </tr>
                        ) : (
                            pagedItems.map((p) => {
                                const isArquivado = (p.status || "").toUpperCase() === "ARQUIVADO";

                                return (
                                    <tr key={p.id} style={{ opacity: isArquivado ? 0.7 : 1 }}>
                                        {/* col 1 */}
                                        <td
                                            style={{
                                                padding: "0.95rem 0.75rem",
                                                background: "var(--bg-panel)",
                                                border: "1px solid rgba(148,163,184,0.12)",
                                                borderRight: "none",
                                                borderTopLeftRadius: 16,
                                                borderBottomLeftRadius: 16,
                                                color: "var(--text-main)",
                                                fontWeight: 750,
                                            }}
                                        >
                                            {p.numero_autos || "Sem Número"}
                                            <div style={{ marginTop: 4, color: "var(--text-muted)", fontWeight: 600, fontSize: "0.82rem" }}>
                                                {p.id ? `ID: ${p.id}` : ""}
                                            </div>
                                        </td>

                                        {/* col 2 */}
                                        <td
                                            style={{
                                                padding: "0.95rem 0.75rem",
                                                background: "var(--bg-panel)",
                                                borderTop: "1px solid rgba(148,163,184,0.12)",
                                                borderBottom: "1px solid rgba(148,163,184,0.12)",
                                                color: "var(--text-main)",
                                            }}
                                        >
                                            {p.cliente?.nome || "-"}
                                        </td>

                                        {/* col 3 */}
                                        <td
                                            style={{
                                                padding: "0.95rem 0.75rem",
                                                background: "var(--bg-panel)",
                                                borderTop: "1px solid rgba(148,163,184,0.12)",
                                                borderBottom: "1px solid rgba(148,163,184,0.12)",
                                                color: "var(--text-main)",
                                            }}
                                        >
                                            {p.tribunal || "-"}
                                        </td>

                                        {/* col 4 */}
                                        <td
                                            style={{
                                                padding: "0.95rem 0.75rem",
                                                background: "var(--bg-panel)",
                                                borderTop: "1px solid rgba(148,163,184,0.12)",
                                                borderBottom: "1px solid rgba(148,163,184,0.12)",
                                                color: "var(--text-main)",
                                            }}
                                        >
                                            <StatusBadge status={p.status} />
                                        </td>

                                        {/* col 5 */}
                                        <td
                                            style={{
                                                padding: "0.95rem 0.75rem",
                                                background: "var(--bg-panel)",
                                                borderTop: "1px solid rgba(148,163,184,0.12)",
                                                borderBottom: "1px solid rgba(148,163,184,0.12)",
                                                color: "var(--text-main)",
                                                fontWeight: 650,
                                            }}
                                        >
                                            {p.criado_em ? new Date(p.criado_em).toLocaleDateString() : "-"}
                                        </td>

                                        {/* col 6 */}
                                        <td
                                            style={{
                                                padding: "0.85rem 0.75rem",
                                                background: "var(--bg-panel)",
                                                border: "1px solid rgba(148,163,184,0.12)",
                                                borderLeft: "none",
                                                borderTopRightRadius: 16,
                                                borderBottomRightRadius: 16,
                                                textAlign: "right",
                                            }}
                                        >
                                            <div style={{ display: "inline-flex", gap: 8 }}>
                                                <IconButton title="Detalhes" variant="primary" onClick={() => onDetalhes(p.id)}>
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </IconButton>

                                                <IconButton
                                                    title={p.status === "ATIVO" ? "Arquivar" : "Reativar"}
                                                    variant="neutral"
                                                    onClick={() => onToggleStatus(p)}
                                                >
                                                    {p.status === "ATIVO" ? (
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 8v13H3V8" />
                                                            <path d="M1 3h22v5H1z" />
                                                            <path d="M10 12h4" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                    )}
                                                </IconButton>
                                                <IconButton title="Excluir" variant="danger" onClick={() => onExcluir(p.id)}>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4h8v2" />
                                                        <path d="M19 6l-1 14H6L5 6" />
                                                        <path d="M10 11v6" />
                                                        <path d="M14 11v6" />
                                                    </svg>
                                                </IconButton>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ===============================
                Rodapé + paginação
               =============================== */}
            <div
                style={{
                    padding: "0.75rem 1rem",
                    borderTop: "1px solid rgba(148,163,184,0.12)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                    color: "var(--text-muted)",
                    fontSize: "0.85rem",
                }}
            >
                <span>
                    {rangeLabel}
                </span>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <PaginationButton disabled={pageSafe <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        ‹
                    </PaginationButton>

                    {visiblePages.map((p) => (
                        <PaginationButton
                            key={p}
                            active={p === pageSafe}
                            disabled={loading}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </PaginationButton>
                    ))}

                    <PaginationButton
                        disabled={pageSafe >= pages || loading}
                        onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    >
                        ›
                    </PaginationButton>
                </div>
            </div>
        </div>
    );
};