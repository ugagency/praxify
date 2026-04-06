import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Cliente, ClienteFormState } from "../types/clientes.types";

import { ClienteModalTabAcolhimento } from "./ClienteModalTabAcolhimento";
import { ClienteModalTabDados } from "./ClienteModalTabDados";
import { ClienteModalTabDocumentos } from "./ClienteModalTabDocumentos";
import { ClienteModalTabGerador } from "./ClienteModalTabGerador";
import { TabButton } from "./ClienteModalUI";

import { uploadArquivosCliente, listArquivosByCliente, getSignedUrl } from "../api/arquivos.api";
import { showAlert } from "../../../utils/alert";

type AcolhimentoFormState = { relato: string };

type SubmitResult = void | boolean | { ok: boolean; id: number | null };

type Props = {
    open: boolean;
    editing: boolean;
    saving: boolean;
    form: ClienteFormState;
    clientes: Cliente[]; // mantido por compatibilidade

    // ✅ opcionais (para não quebrar o Clientes.tsx antigo)
    escritorioId?: number | null;
    clienteId?: number | null; // quando editando
    userId?: string | null;

    onChange: (next: ClienteFormState) => void;
    onClose: () => void;
    onSaved?: (id: number) => void; // chamado após salvar com sucesso (sem fechar o modal)

    // ✅ aceita assinatura antiga e nova
    onSubmit: () => Promise<SubmitResult>;
};

export type TabId = "acolhimento" | "dados" | "documentos" | "gerar_peticao";

function normalizeSubmitResult(res: SubmitResult, fallbackId: number | null): { ok: boolean; id: number | null } {
    if (typeof res === "boolean") return { ok: res, id: res ? fallbackId : null };
    if (res && typeof res === "object" && "ok" in res) return res as { ok: boolean; id: number | null };
    // void -> assume OK, mas sem id garantido
    return { ok: true, id: fallbackId };
}

export const ClienteModal: React.FC<Props> = ({
    open,
    editing,
    saving,
    form,
    // clientes,
    escritorioId = null,
    clienteId = null,
    userId = null,
    onChange,
    onClose,
    onSaved,
    onSubmit,
}) => {
    if (!open) return null;

    const initialAcolhimento = useMemo<AcolhimentoFormState>(() => ({ relato: "" }), []);
    const [tab, setTab] = useState<TabId>("dados");
    const [acolhimento, setAcolhimento] = useState<AcolhimentoFormState>(initialAcolhimento);

    const [expPessoais, setExpPessoais] = useState(true);
    const [expContato, setExpContato] = useState(false);
    const [expEndereco, setExpEndereco] = useState(false);
    const [expGov, setExpGov] = useState(false);
    const [expObservacao, setExpObservacao] = useState(false);

    // Documentos pendentes (em memória)
    const [docs, setDocs] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Speech
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Auto-load most recent acolhimento when editing a client
    useEffect(() => {
        if (!open) return;

        setTab("dados");
        setAcolhimento(initialAcolhimento);
        setDocs([]);
        setIsRecording(false);

        setExpPessoais(true);
        setExpContato(false);
        setExpEndereco(false);
        setExpGov(false);
        setExpObservacao(false);

        try {
            recognitionRef.current?.stop?.();
        } catch {
            // ignore
        }

        // Pre-load the latest saved acolhimento so petition tab always has the facts
        if (editing && clienteId) {
            listArquivosByCliente(clienteId)
                .then(async (list) => {
                    const acolhimentos = list.filter(d =>
                        (d.descricao || "").toUpperCase().includes("ACOLHIMENTO")
                    );
                    if (acolhimentos.length === 0) return;

                    // Most recent first (API returns sorted desc)
                    const latest = acolhimentos[0];
                    const url = await getSignedUrl(latest.url);
                    const res = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now());
                    if (!res.ok) return;

                    const texto = await res.text();
                    setAcolhimento({ relato: texto });
                })
                .catch(() => {
                    // Silent fail — user can still manually open acolhimento
                });
        }
    }, [open, editing, clienteId, initialAcolhimento]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, saving]);

    const close = () => {
        if (saving) return;
        try {
            recognitionRef.current?.stop?.();
        } catch {
            // ignore
        }
        setIsRecording(false);
        onClose();
    };

    const submitDados = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmitAll();
    };

    const handlePrimarySave = () => {
        if (saving) return;

        if (tab === "dados") {
            const btn = document.getElementById("cliente-modal-submit") as HTMLButtonElement | null;
            if (btn) {
                btn.click();
                return;
            }
        }

        // Se não for a aba "dados" (ou o botão sumolou), salva direto
        handleSubmitAll();
    };

    const handleSubmitAll = async () => {
        // 1) salva cliente
        let result: { ok: boolean; id: number | null };
        try {
            const raw = await onSubmit();
            result = normalizeSubmitResult(raw, editing ? clienteId : null);
        } catch (e: any) {
            showAlert("Erro", e?.message || "Erro ao salvar cliente", "error");
            return;
        }

        if (!result.ok) return;

        // 2) envia anexos pendentes (se houver) — só se tiver id + escritorioId
        const effectiveId = result.id ?? (editing ? clienteId : null);

        if (docs.length > 0) {
            if (!effectiveId) {
                showAlert("Atenção", "Salve o cliente primeiro para conseguir anexar documentos.", "warning");
                return;
            }
            if (!escritorioId) {
                showAlert("Atenção", "Escritório inválido. Não foi possível enviar anexos.", "warning");
                return;
            }

            try {
                await uploadArquivosCliente({
                    escritorioId,
                    clienteId: effectiveId,
                    usuarioId: userId ?? null,
                    files: docs,
                });
                setDocs([]);
            } catch (e: any) {
                console.error(e);
                showAlert("Erro", e?.message || "Falha ao enviar anexos", "error");
                return;
            }
        }

        // 3) notifica o pai para atualizar o estado (transição para modo edição se novo cliente)
        //    o modal permanece aberto — o usuário pode navegar para outras abas
        onSaved?.(effectiveId ?? 0);
    };

    // ====== layout
    const cardStyle: React.CSSProperties = {
        width: "100%",
        maxWidth: 620,
        background: "var(--bg-darker)",
        border: "1px solid var(--border-color)",
        maxHeight: "80vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: 14,
    };

    const contentStyle: React.CSSProperties = {
        flex: 1,
        overflowY: "auto",
        padding: "0.75rem 1rem",
        paddingRight: "1.35rem",
        scrollbarGutter: "stable",
    };

    const footerStyle: React.CSSProperties = {
        display: "flex",
        gap: "0.75rem",
        padding: "0.85rem 1rem",
        borderTop: "1px solid var(--border-color)",
        background: "var(--bg-darker)",
    };

    const buttonBase: React.CSSProperties = {
        flex: "1 1 200px",
        padding: "0.62rem",
        borderRadius: "0.6rem",
        fontWeight: 900,
    };

    const effectiveClienteIdForList = editing ? clienteId : null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                padding: "1.25rem",
            }}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div className="card" style={cardStyle}>
                <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                        <div>
                            <h3 style={{ margin: 0, color: "var(--text-main)" }}>{editing ? "Editar Cliente" : "Novo Cliente"}</h3>
                            <p style={{ margin: "0.35rem 0 0 0", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                {editing ? "Atualize dados, contatos, endereço e anexos." : "Dados do cliente, acolhimento e anexos."}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={close}
                            disabled={saving}
                            aria-label="Fechar"
                            style={{
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "var(--bg-surface)",
                                color: "var(--text-main)",
                                width: 36,
                                height: 36,
                                borderRadius: 12,
                                cursor: saving ? "not-allowed" : "pointer",
                                opacity: saving ? 0.6 : 1,
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.9rem", flexWrap: "nowrap", overflowX: "auto", paddingBottom: "0.5rem" }}>
                        <TabButton id="dados" label="Dados do cliente" active={tab === "dados"} onClick={setTab} />
                        <TabButton id="acolhimento" label="Acolhimento" active={tab === "acolhimento"} onClick={setTab} />
                        <TabButton id="documentos" label="Documentos anexados" active={tab === "documentos"} onClick={setTab} />
                        <TabButton id="gerar_peticao" label="Gerar Petição (IA)" active={tab === "gerar_peticao"} onClick={setTab} />
                    </div>
                </div>

                <div style={contentStyle}>
                    {tab === "acolhimento" && (
                        <ClienteModalTabAcolhimento
                            saving={saving}
                            acolhimento={acolhimento}
                            setAcolhimento={setAcolhimento}
                            isRecording={isRecording}
                            setIsRecording={setIsRecording}
                            recognitionRef={recognitionRef}
                            clienteId={effectiveClienteIdForList}
                            escritorioId={escritorioId}
                            userId={userId}
                        />
                    )}

                    {tab === "dados" && (
                        <ClienteModalTabDados
                            form={form}
                            onChange={onChange}
                            onSubmit={submitDados}
                            expPessoais={expPessoais}
                            setExpPessoais={setExpPessoais}
                            expContato={expContato}
                            setExpContato={setExpContato}
                            expEndereco={expEndereco}
                            setExpEndereco={setExpEndereco}
                            expGov={expGov}
                            setExpGov={setExpGov}
                            expObservacao={expObservacao}
                            setExpObservacao={setExpObservacao}
                        />
                    )}

                    {tab === "documentos" && (
                        <ClienteModalTabDocumentos
                            saving={saving}
                            docs={docs}
                            setDocs={setDocs}
                            fileInputRef={fileInputRef}
                            clienteId={effectiveClienteIdForList}
                        />
                    )}

                    {tab === "gerar_peticao" && (
                        <ClienteModalTabGerador
                            clienteId={effectiveClienteIdForList}
                            escritorioId={escritorioId}
                            fatosIniciais={acolhimento.relato || "[Fatos não registrados neste cliente]"}
                            dadosCliente={form}
                            onClose={close}
                            userId={userId}
                        />
                    )}
                </div>

                <div style={footerStyle}>
                    <button
                        type="button"
                        onClick={close}
                        disabled={saving}
                        style={{
                            ...buttonBase,
                            background: "transparent",
                            border: "1px solid var(--border-color)",
                            color: "var(--text-main)",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.7 : 1,
                        }}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handlePrimarySave}
                        disabled={saving}
                        style={{
                            ...buttonBase,
                            background: "#10b981",
                            border: "none",
                            color: "var(--text-main)",
                            cursor: saving ? "not-allowed" : "pointer",
                            opacity: saving ? 0.85 : 1,
                        }}
                    >
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
            </div>
        </div>
    );
};