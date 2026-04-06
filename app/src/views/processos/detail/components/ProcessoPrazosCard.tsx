import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PrazoItem } from "../types/processoDetalhe.types";

import { openPrazoDetailsModal } from "../../../../components/modals/prazoDetailsModal";

type Props = {
    prazos: PrazoItem[];
    processoId: number;
    processoLabel?: string;
};

export const ProcessoPrazosCard: React.FC<Props> = ({ prazos, processoId, processoLabel }) => {
    const navigate = useNavigate();

    const [openAll, setOpenAll] = useState(false);

    // Quando um detalhe estiver aberto, “rebaixa” o modal de lista para não atrapalhar cliques
    const [detailOpen, setDetailOpen] = useState(false);

    const prazosOrdenados = useMemo(() => {
        const list = Array.isArray(prazos) ? [...prazos] : [];
        list.sort((a: any, b: any) => {
            const da = a?.data_fatal ? new Date(String(a.data_fatal)).getTime() : Number.MAX_SAFE_INTEGER;
            const db = b?.data_fatal ? new Date(String(b.data_fatal)).getTime() : Number.MAX_SAFE_INTEGER;
            return da - db;
        });
        return list;
    }, [prazos]);

    const openDetailsModal = (prazo: PrazoItem) => {
        const prazoForModal: any = {
            ...prazo,
            processo: String(processoId),
            tarefa: (prazo as any)?.tarefa ?? "-",
            status: (prazo as any)?.status ?? "-",
        };

        const processosList: any[] = [
            {
                id: processoId,
                numero_autos: processoLabel ?? processoId,
                numero: processoLabel ?? processoId,
            },
        ];

        setDetailOpen(true);

        // Abre o modal existente (o da tela de prazos)
        openPrazoDetailsModal({
            prazo: prazoForModal,
            processosList,
            onOpenProcess: () => navigate(`/processo/${processoId}`),
        });

        /**
         * Como o openPrazoDetailsModal não expõe callback de close,
         * a gente “observa” o DOM para detectar quando ele some e
         * então libera o modal de lista novamente.
         *
         * Isso evita fechar o modal de lista e mantém os dois abertos.
         */
        const start = Date.now();
        const timer = window.setInterval(() => {
            // SweetAlert2 normalmente cria .swal2-container
            const swalContainer = document.querySelector(".swal2-container");
            const stillThere = !!swalContainer;

            // Se não existe mais, detalhe foi fechado
            if (!stillThere) {
                window.clearInterval(timer);
                setDetailOpen(false);
            }

            // fallback: não fica preso se algo der errado
            if (Date.now() - start > 60_000) {
                window.clearInterval(timer);
                setDetailOpen(false);
            }
        }, 300);
    };

    // Fechar o modal “Ver todos” no ESC (somente se não estiver com detalhe aberto)
    useEffect(() => {
        if (!openAll) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (detailOpen) return; // deixa o detalhe lidar com ESC
                setOpenAll(false);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [openAll, detailOpen]);

    const cardSkin: React.CSSProperties = {
        borderRadius: 16,
        border: "1px solid var(--border-color)",
        background: "var(--bg-panel)",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.9rem",
    };

    const subtlePanel: React.CSSProperties = {
        background: "var(--bg-panel)",
        border: "1px solid var(--border-color)",
        borderRadius: 12,
    };

    return (
        <>
            <div style={cardSkin}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                        ⏰ Prazos ativos do processo
                    </h4>

                    <span
                        style={{
                            padding: "0.18rem 0.6rem",
                            borderRadius: 999,
                            border: "1px solid rgba(239,68,68,0.35)",
                            background: "rgba(239,68,68,0.14)",
                            color: "var(--text-main)",
                            fontWeight: 900,
                            fontSize: "0.75rem",
                        }}
                        title="Quantidade de prazos"
                    >
                        {prazosOrdenados.length}
                    </span>
                </div>

                {prazosOrdenados.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "0.88rem" }}>Nenhum prazo pendente.</p>
                ) : (
                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.6rem",
                            maxHeight: 180,
                            overflow: "auto",
                            paddingRight: 6,
                        }}
                    >
                        {prazosOrdenados.slice(0, 3).map((prazo: any) => (
                            <li
                                key={String(prazo.id)}
                                onClick={() => openDetailsModal(prazo)}
                                style={{
                                    ...subtlePanel,
                                    padding: "0.75rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 10,
                                    cursor: "pointer",
                                }}
                                title="Abrir detalhes"
                            >
                                <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                                    <strong
                                        style={{
                                            color: "var(--text-main)",
                                            fontSize: "0.9rem",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {prazo.tarefa || "-"}
                                    </strong>
                                    <span style={{ color: "var(--danger)", fontSize: "0.78rem", fontWeight: 800 }}>
                                        Vence em{" "}
                                        {prazo.data_fatal ? new Date(String(prazo.data_fatal)).toLocaleDateString("pt-BR") : "-"}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openDetailsModal(prazo);
                                    }}
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 12,
                                        border: "1px solid rgba(148,163,184,0.18)",
                                        background: "var(--bg-surface)",
                                        color: "var(--text-main)",
                                        cursor: "pointer",
                                    }}
                                    title="Ver detalhes"
                                    aria-label="Ver detalhes"
                                >
                                    👁
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="button"
                    onClick={() => setOpenAll(true)}
                    style={{
                        width: "100%",
                        padding: "0.6rem 0.85rem",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.18)",
                        background: "var(--bg-surface)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: 850,
                    }}
                    title="Ver todos os prazos deste processo"
                    disabled={prazosOrdenados.length === 0}
                >
                    Ver todos os prazos
                </button>
            </div>

            {/* MODAL: Todos os prazos do processo (permanece aberto) */}
            {openAll && (
                <div
                    onClick={() => {
                        if (detailOpen) return; // se o detalhe estiver aberto, evita fechar ao clicar fora
                        setOpenAll(false);
                    }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: detailOpen ? 1000 : 9500, // ✅ rebaixa quando detalhe abrir
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "1rem",
                        // ✅ quando detalhe abrir, o backdrop não deve capturar cliques por cima
                        pointerEvents: detailOpen ? "none" : "auto",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "min(720px, 95vw)",
                            maxHeight: "80vh",
                            overflow: "hidden",
                            borderRadius: 18,
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-darker)",
                            boxShadow: "0 20px 50px rgba(0,0,0,0.55)",
                            padding: "1rem",
                            display: "flex",
                            flexDirection: "column",
                            // ✅ o conteúdo continua interagível mesmo quando backdrop está pointer-events none
                            pointerEvents: "auto",
                        }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem", fontWeight: 900 }}>
                                    Prazos do processo {processoLabel ? `#${processoLabel}` : `#${processoId}`}
                                </h3>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                    Total: {prazosOrdenados.length}
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpenAll(false)}
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 12,
                                    border: "1px solid rgba(148,163,184,0.18)",
                                    background: "var(--bg-surface)",
                                    color: "var(--text-main)",
                                    cursor: "pointer",
                                    fontSize: "1.05rem",
                                }}
                                title="Fechar"
                                aria-label="Fechar"
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginTop: "0.9rem", ...subtlePanel, padding: "0.75rem", flex: 1, minHeight: 0 }}>
                            <div
                                style={{
                                    height: "100%",
                                    overflowY: "auto",
                                    paddingRight: 8,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.6rem",
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "rgba(148,163,184,0.35) rgba(2,6,23,0.25)",
                                }}
                            >
                                {prazosOrdenados.map((prazo: any) => (
                                    <div
                                        key={String(prazo.id)}
                                        onClick={() => openDetailsModal(prazo)}
                                        style={{
                                            background: "var(--bg-panel)",
                                            border: "1px solid var(--border-color)",
                                            borderRadius: 14,
                                            padding: "0.8rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            cursor: "pointer",
                                        }}
                                        title="Abrir detalhes"
                                    >
                                        <div style={{ minWidth: 0 }}>
                                            <div
                                                style={{
                                                    color: "var(--text-main)",
                                                    fontWeight: 900,
                                                    fontSize: "0.95rem",
                                                    whiteSpace: "nowrap",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                }}
                                            >
                                                {prazo.tarefa || "-"}
                                            </div>
                                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                                                <span style={{ color: "var(--danger)", fontSize: "0.8rem", fontWeight: 800 }}>
                                                    Vence em{" "}
                                                    {prazo.data_fatal
                                                        ? new Date(String(prazo.data_fatal)).toLocaleDateString("pt-BR")
                                                        : "-"}
                                                </span>
                                                {prazo.status && (
                                                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                                        Status: {String(prazo.status)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openDetailsModal(prazo);
                                            }}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 12,
                                                border: "1px solid rgba(148,163,184,0.18)",
                                                background: "var(--bg-surface)",
                                                color: "var(--text-main)",
                                                cursor: "pointer",
                                            }}
                                            title="Ver detalhes"
                                            aria-label="Ver detalhes"
                                        >
                                            👁
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.9rem" }}>
                            <button
                                type="button"
                                onClick={() => setOpenAll(false)}
                                style={{
                                    padding: "0.65rem 1.6rem",
                                    borderRadius: 10,
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    background: "transparent",
                                    color: "var(--text-main)",
                                    cursor: "pointer",
                                    fontWeight: 950,
                                    fontSize: "0.85rem",
                                    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
                                }}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};