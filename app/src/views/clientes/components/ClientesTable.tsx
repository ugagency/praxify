import React from "react";

import type { Cliente } from "../types/clientes.types";
import { formatarCelular, formatarCpfCnpj, formatarData } from "../utils/clientes.formatters";

function IconButton(props: {
    title: string;
    onClick: () => void;
    variant: "primary" | "neutral" | "danger";
    children: React.ReactNode;
}) {
    const { title, onClick, variant, children } = props;

    const styles =
        variant === "primary"
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
                transition: "transform .15s, background .15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
            {children}
        </button>
    );
}

type Props = {
    loading: boolean;
    items: Cliente[];
    onEditar: (c: Cliente) => void;
    onExcluir: (id: number, nome: string) => void;
};

export const ClientesTable: React.FC<Props> = ({ loading, items, onEditar, onExcluir }) => {
    return (
        <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                        <th style={{ padding: "0.95rem 1rem" }}>Nome do cliente</th>
                        <th style={{ padding: "0.95rem 1rem", width: 140 }}>Celular</th>
                        <th style={{ padding: "0.95rem 1rem", width: 140 }}>CPF</th>
                        <th style={{ padding: "0.95rem 1rem", width: 140 }}>Entrada</th>
                        <th style={{ padding: "0.95rem 1rem", width: 120 }}>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "2.1rem", color: "var(--text-muted)" }}>
                                Carregando clientes…
                            </td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "2.1rem", color: "var(--text-muted)" }}>
                                Nenhum cliente encontrado.
                            </td>
                        </tr>
                    ) : (
                        items.map((c) => (
                            <tr key={c.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <td style={{ padding: "0.95rem 1rem", color: "var(--text-main)", fontWeight: 700 }}>{c.nome}</td>
                                <td style={{ padding: "0.95rem 1rem", color: "var(--text-main)" }}>{formatarCelular(c.celular || null) || "-"}</td>
                                <td style={{ padding: "0.95rem 1rem", color: "var(--text-main)" }}>{formatarCpfCnpj(c.cpf_cnpj) || "-"}</td>
                                <td style={{ padding: "0.95rem 1rem", color: "var(--text-main)" }}>{formatarData(c.criado_em)}</td>
                                <td style={{ padding: "0.95rem 1rem" }}>
                                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                                        <IconButton title="Editar" variant="primary" onClick={() => onEditar(c)}>
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </IconButton>
                                        <IconButton title="Deletar" variant="danger" onClick={() => onExcluir(c.id, c.nome)}>
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
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};