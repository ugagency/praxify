import React, { useMemo, useState } from "react";
import type { ProcessoCliente } from "../types/processoDetalhe.types";

type Props = {
    cliente?: ProcessoCliente | null;
};

const LIST_MAX_HEIGHT = 260;

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

export const ProcessoClienteDadosCard: React.FC<Props> = ({ cliente }) => {
    // ✅ começa minimizado
    const [collapsed, setCollapsed] = useState(true);

    const resumo = useMemo(() => {
        if (!cliente) return null;

        return {
            nome: v(cliente.nome),
            doc: v(cliente.cpf_cnpj),
            celular: v(cliente.celular),
            email: v(cliente.email),
        };
    }, [cliente]);

    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid rgba(148,163,184,0.14)",
                background: "var(--bg-panel)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                minWidth: 0,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "1rem", fontWeight: 900 }}>
                    👤 Dados do cliente
                </h4>

                <button
                    type="button"
                    onClick={() => setCollapsed((s) => !s)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "0.45rem 0.75rem",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.18)",
                        background: "var(--bg-surface)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: 850,
                        whiteSpace: "nowrap",
                    }}
                    title={collapsed ? "Mostrar (maximizar)" : "Minimizar"}
                    aria-label={collapsed ? "Mostrar dados do cliente" : "Minimizar dados do cliente"}
                >
                    <span style={{ fontSize: "0.95rem" }}>{collapsed ? "Mostrar" : "Minimizar"}</span>
                    <span
                        style={{
                            fontSize: "1rem",
                            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
                            transition: "transform 150ms ease",
                        }}
                    >
                        ⌃
                    </span>
                </button>
            </div>

            {!cliente ? (
                <div
                    style={{
                        borderRadius: 14,
                        border: "1px solid rgba(148,163,184,0.12)",
                        background: "rgba(2,6,23,0.30)",
                        padding: "0.85rem",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                    }}
                >
                    Cliente não carregado.
                </div>
            ) : collapsed ? (
                // ✅ Minimizado: 4 campos, duas fileiras (2 colunas)
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "0.75rem",
                    }}
                >
                    <Field label="Nome" value={resumo?.nome ?? "-"} />
                    <Field label="CPF/CNPJ" value={resumo?.doc ?? "-"} />
                    <Field label="Celular" value={resumo?.celular ?? "-"} />
                    <Field label="E-mail" value={resumo?.email ?? "-"} />
                </div>
            ) : (
                // ✅ Expandido: tudo com scroll
                <>
                    <div
                        style={{
                            maxHeight: LIST_MAX_HEIGHT,
                            overflowY: "auto",
                            paddingRight: 6,
                            scrollbarWidth: "thin",
                            scrollbarColor: "rgba(148,163,184,0.35) rgba(2,6,23,0.25)",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                gap: "0.75rem",
                            }}
                        >
                            {/* Principais */}
                            <Field label="Nome" value={v(cliente.nome)} />
                            <Field label="CPF/CNPJ" value={v(cliente.cpf_cnpj)} />

                            {/* Contatos */}
                            <Field label="Celular" value={v(cliente.celular)} />
                            <Field label="Contato fixo" value={v(cliente.contato_fixo)} />
                            <Field label="Contato comercial" value={v(cliente.contato_comercial)} />
                            <Field label="E-mail" value={v(cliente.email)} />

                            {/* Endereço */}
                            <Field label="CEP" value={v(cliente.cep)} />
                            <Field label="Endereço" value={v(cliente.endereco)} />
                            <Field label="Número" value={v(cliente.numero)} />
                            <Field label="Complemento" value={v(cliente.complemento)} />
                            <Field label="Bairro" value={v(cliente.bairro)} />
                            <Field label="Cidade" value={v(cliente.cidade)} />
                            <Field label="Estado" value={v(cliente.estado)} />

                            <Field
                                label="Criado em"
                                value={cliente.criado_em ? new Date(String(cliente.criado_em)).toLocaleDateString("pt-BR") : "-"}
                            />
                        </div>
                    </div>

                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Role para ver todos os dados do cliente.</div>
                </>
            )}
        </div>
    );
};