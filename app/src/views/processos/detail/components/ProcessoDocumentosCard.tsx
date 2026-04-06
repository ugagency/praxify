import React, { useEffect, useMemo, useRef, useState } from "react";
import type { DocumentoItem } from "../types/processoDetalhe.types";

import { showAlert, showConfirm } from "../../../../utils/alert";

import {
    getSignedUrl,
    listArquivosByCliente,
    uploadArquivosProcesso,
    deleteArquivo,
    type JurArquivo,
} from "../../list/api/arquivos.api";

type TabMode = "processo" | "cliente";

type Props = {
    documentos: DocumentoItem[]; // vindo do hook do detalhe (Processo)
    processoId: number;
    clienteId?: number | null;
    escritorioId: number;
    usuarioId?: string;
    onUploaded?: () => void;
};

const LIST_MAX_HEIGHT = 320; // ajuste como quiser (280/320/360)

function isUploadDoc(doc: DocumentoItem) {
    return doc.origem === "UPLOAD";
}

function getDocTitle(doc: DocumentoItem) {
    return String(doc.titulo || (isUploadDoc(doc) ? "Arquivo Anexo" : "Documento"));
}

function mapJurArquivoToDocumentoItem(a: JurArquivo): DocumentoItem {
    return {
        id: a.id,
        origem: "UPLOAD",
        titulo: a.descricao || "Arquivo",
        url: a.url,
        criado_em: a.criado_em,
        icon: "📎",
    } as DocumentoItem;
}

export const ProcessoDocumentosCard: React.FC<Props> = ({
    documentos,
    processoId,
    clienteId,
    escritorioId,
    usuarioId,
    onUploaded,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [mode, setMode] = useState<TabMode>("processo");
    const [uploading, setUploading] = useState(false);
    const [query, setQuery] = useState("");

    const [clienteUploads, setClienteUploads] = useState<DocumentoItem[]>([]);
    const [clienteLoading, setClienteLoading] = useState(false);
    const [clienteError, setClienteError] = useState<string | null>(null);

    const pickFiles = () => fileInputRef.current?.click();

    // Carrega uploads do cliente quando o toggle estiver em "cliente"
    useEffect(() => {
        let alive = true;

        async function loadClienteUploads() {
            if (mode !== "cliente") return;

            if (!clienteId) {
                setClienteUploads([]);
                setClienteError("Cliente não identificado para este processo.");
                return;
            }

            setClienteLoading(true);
            setClienteError(null);

            try {
                const rows = await listArquivosByCliente(clienteId);
                if (!alive) return;
                setClienteUploads((rows || []).map(mapJurArquivoToDocumentoItem));
            } catch (e: unknown) {
                if (!alive) return;
                setClienteError((e as Error)?.message || "Erro ao listar documentos do cliente.");
                setClienteUploads([]);
            } finally {
                if (alive) setClienteLoading(false);
            }
        }

        loadClienteUploads();

        return () => {
            alive = false;
        };
    }, [mode, clienteId]);

    const baseList = useMemo(() => {
        if (mode === "cliente") return clienteUploads;
        return documentos;
    }, [mode, clienteUploads, documentos]);

    const counts = useMemo(() => {
        const uploads = baseList.filter((d) => d.origem === "UPLOAD").length;
        const gerados = baseList.filter((d) => d.origem === "GERADO").length;
        return { uploads, gerados };
    }, [baseList]);

    const listFiltered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return baseList;

        return baseList.filter((d) => {
            const titulo = getDocTitle(d).toLowerCase();
            const origem = String(d.origem || "").toLowerCase();
            const url = String((d as any)?.url || "").toLowerCase();
            return titulo.includes(q) || origem.includes(q) || url.includes(q);
        });
    }, [baseList, query]);

    const handleFiles = async (filesList: FileList | File[]) => {
        const files = Array.from(filesList || []);
        if (!files.length) return;

        if (!usuarioId) {
            showAlert("Usuário não identificado", "Faça login novamente para anexar arquivos.", "warning");
            return;
        }

        setUploading(true);
        try {
            await uploadArquivosProcesso({
                escritorioId,
                processoId,
                clienteId: clienteId ?? null,
                usuarioId,
                files,
            });

            await onUploaded?.();

            if (mode === "cliente" && clienteId) {
                const rows = await listArquivosByCliente(clienteId);
                setClienteUploads((rows || []).map(mapJurArquivoToDocumentoItem));
            }

            showAlert("Anexo enviado", "O arquivo foi anexado com sucesso.", "success");
        } catch (e: unknown) {
            showAlert("Erro ao anexar", (e as Error)?.message || "Não foi possível anexar o arquivo.", "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (doc: DocumentoItem) => {
        if (doc.origem !== "UPLOAD") return;

        const titulo = getDocTitle(doc);

        const result = await showConfirm("Excluir anexo?", "Essa ação não pode ser desfeita.", "Sim, excluir");

        if (!result.isConfirmed) return;

        try {
            await deleteArquivo({
                id: Number(doc.id),
                path: (doc as any)?.url,
            });

            await onUploaded?.();

            if (mode === "cliente" && clienteId) {
                const rows = await listArquivosByCliente(clienteId);
                setClienteUploads((rows || []).map(mapJurArquivoToDocumentoItem));
            }

            showAlert("Anexo excluído", "O arquivo foi removido com sucesso.", "success");
        } catch (e: unknown) {
            showAlert("Erro ao excluir", (e as Error)?.message || "Não foi possível excluir o anexo.", "error");
        }
    };

    const openDocumento = async (doc: DocumentoItem) => {
        try {
            if (doc.origem === "UPLOAD") {
                const path = String((doc as any)?.url || "");
                if (!path) throw new Error("Arquivo sem path (url) no registro.");
                const signed = await getSignedUrl(path, 60 * 15);
                window.open(signed, "_blank", "noopener,noreferrer");
                return;
            }

            const url = String((doc as any)?.url || "");
            if (!url) throw new Error("Documento sem URL.");
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (e: unknown) {
            showAlert("Não foi possível abrir", (e as Error)?.message || "Tente novamente.", "error");
        }
    };

    // Skin padronizado
    const cardSkin: React.CSSProperties = {
        borderRadius: 16,
        border: "1px solid rgba(148,163,184,0.14)",
        background: "var(--bg-panel)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
        backdropFilter: "blur(8px)",
        padding: "0.95rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.9rem",
    };

    const subtlePanel: React.CSSProperties = {
        background: "var(--bg-panel)",
        border: "1px solid rgba(148,163,184,0.12)",
        borderRadius: 12,
    };

    return (
        <div className="card" style={cardSkin}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <h4 style={{ color: "var(--text-main)", margin: 0 }}>Documentos</h4>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    {/* Toggle Processo | Cliente */}
                    <div
                        style={{
                            display: "flex",
                            borderRadius: 999,
                            overflow: "hidden",
                            border: "1px solid rgba(148,163,184,0.18)",
                            background: "var(--bg-panel)",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setMode("processo")}
                            style={{
                                padding: "0.35rem 0.65rem",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                color: mode === "processo" ? "var(--bg-darker)" : "var(--text-main)",
                                background: mode === "processo" ? "rgba(56,189,248,0.85)" : "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                            title="Ver documentos do processo"
                        >
                            Processo
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("cliente")}
                            style={{
                                padding: "0.35rem 0.65rem",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                color: mode === "cliente" ? "var(--bg-darker)" : "var(--text-main)",
                                background: mode === "cliente" ? "rgba(16,185,129,0.85)" : "transparent",
                                border: "none",
                                cursor: "pointer",
                            }}
                            title="Ver documentos do cliente (mesmo lugar da tela de Cliente)"
                        >
                            Cliente
                        </button>
                    </div>

                    {/* Badges */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        <span style={{ background: "var(--bg-surface)", padding: "0.15rem 0.5rem", borderRadius: 999 }}>
                            📎 {counts.uploads}
                        </span>
                        <span style={{ background: "var(--bg-surface)", padding: "0.15rem 0.5rem", borderRadius: 999 }}>
                            📄 {counts.gerados}
                        </span>
                    </div>
                </div>
            </div>

            <input
                id="upload-doc-input-hidden"
                ref={fileInputRef}
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                    if (e.target.files?.length) handleFiles(e.target.files);
                }}
            />

            {/* Busca + botão upload */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", width: "100%" }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={mode === "cliente" ? "Buscar nos documentos do cliente..." : "Buscar nos documentos do processo..."}
                    style={{
                        flex: 1,
                        background: "rgba(2,6,23,0.40)",
                        border: "1px solid rgba(148,163,184,0.18)",
                        borderRadius: "0.6rem",
                        padding: "0.6rem 0.75rem",
                        color: "var(--text-main)",
                        outline: "none",
                        fontSize: "0.85rem",
                    }}
                />

                <button
                    className="btn-secondary"
                    style={{
                        height: "36px",
                        padding: "0 0.9rem",
                        fontSize: "0.8rem",
                        borderRadius: "0.6rem",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: uploading ? 0.7 : 1,
                        border: "1px solid rgba(148,163,184,0.18)",
                        background: "var(--bg-panel)",
                    }}
                    disabled={uploading}
                    onClick={pickFiles}
                    type="button"
                >
                    {uploading ? "Subindo..." : "Subir"}
                </button>
            </div>

            {/* Mensagens do modo cliente */}
            {mode === "cliente" && (clienteLoading || clienteError) && (
                <div
                    style={{
                        ...subtlePanel,
                        padding: "0.85rem",
                        color: clienteError ? "#ef4444" : "var(--text-muted)",
                        fontSize: "0.875rem",
                    }}
                >
                    {clienteLoading ? "Carregando documentos do cliente..." : clienteError}
                </div>
            )}

            {/* Listagem com rolagem */}
            <div style={{ maxHeight: LIST_MAX_HEIGHT, overflowY: "auto", paddingRight: 6 }}>
                {listFiltered.length > 0 ? (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                        {listFiltered.map((doc) => (
                            <li
                                key={doc.origem + String(doc.id)}
                                style={{
                                    ...subtlePanel,
                                    padding: "0.75rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    cursor: "pointer",
                                }}
                                title={getDocTitle(doc)}
                                onClick={() => openDocumento(doc)}
                            >
                                <span>{doc.icon}</span>

                                <div style={{ flex: 1, overflow: "hidden" }}>
                                    <div
                                        style={{
                                            color: "var(--text-main)",
                                            fontSize: "0.875rem",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {getDocTitle(doc)}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                        {new Date(doc.criado_em).toLocaleDateString("pt-BR")}
                                    </div>
                                </div>

                                {doc.origem === "UPLOAD" ? (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(doc);
                                        }}
                                        title="Remover anexo"
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#ef4444",
                                            fontSize: "1rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: "0.15rem 0.25rem",
                                            opacity: 0.92,
                                        }}
                                    >
                                        🗑️
                                    </button>
                                ) : (
                                    <div
                                        style={{
                                            color: "var(--text-muted)",
                                            fontSize: "0.75rem",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: 999,
                                            background: "var(--bg-surface)",
                                            border: "1px solid rgba(148,163,184,0.14)",
                                        }}
                                    >
                                        Gerado
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div style={{ ...subtlePanel, padding: "0.9rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                        {query.trim()
                            ? "Nenhum documento encontrado para a busca."
                            : mode === "cliente"
                                ? "Nenhum documento vinculado a este cliente."
                                : "Nenhum documento vinculado a este processo."}
                    </div>
                )}
            </div>
        </div>
    );
};