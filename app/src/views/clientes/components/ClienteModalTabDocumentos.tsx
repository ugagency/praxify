// src/views/clientes/components/ClienteModalTabDocumentos.tsx
import React, { useEffect, useMemo, useState } from "react";
import { deleteArquivo, getSignedUrl, listArquivosByCliente, type JurArquivo } from "../api/arquivos.api";
import { showAlert, showConfirm } from "../../../utils/alert";

export const ClienteModalTabDocumentos: React.FC<{
    saving: boolean;

    // pendentes (em memória; serão enviados ao salvar)
    docs: File[];
    setDocs: React.Dispatch<React.SetStateAction<File[]>>;
    fileInputRef: React.RefObject<HTMLInputElement>;

    // para listar/excluir/visualizar salvos
    clienteId: number | null;
}> = ({ saving, docs, setDocs, fileInputRef, clienteId }) => {
    const [loadingSaved, setLoadingSaved] = useState(false);
    const [saved, setSaved] = useState<JurArquivo[]>([]);

    const humanSize = (bytes: number) => {
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        if (mb < 1024) return `${mb.toFixed(1)} MB`;
        const gb = mb / 1024;
        return `${gb.toFixed(2)} GB`;
    };

    const loadSaved = async () => {
        if (!clienteId) {
            setSaved([]);
            return;
        }
        setLoadingSaved(true);
        try {
            const data = await listArquivosByCliente(clienteId);
            setSaved(data);
        } catch (e: any) {
            console.error(e);
            showAlert("Erro", e?.message || "Erro ao listar anexos", "error");
        } finally {
            setLoadingSaved(false);
        }
    };

    useEffect(() => {
        loadSaved();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [clienteId]);

    const handleAddFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const incoming = Array.from(files);

        setDocs((prev) => {
            const existingKeys = new Set(prev.map((f) => `${f.name}__${f.size}`));
            const filtered = incoming.filter((f) => !existingKeys.has(`${f.name}__${f.size}`));
            return [...prev, ...filtered];
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeDoc = (idx: number) => setDocs((prev) => prev.filter((_, i) => i !== idx));

    const downloadPendingDoc = (f: File) => {
        const url = URL.createObjectURL(f);
        const a = document.createElement("a");
        a.href = url;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const openSaved = async (a: JurArquivo) => {
        try {
            const url = await getSignedUrl(a.url, 60 * 10);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (e: any) {
            console.error(e);
            showAlert("Erro", e?.message || "Não foi possível abrir o arquivo", "error");
        }
    };

    const deleteSaved = async (a: JurArquivo) => {
        const confirmResult = await showConfirm(
            "Excluir arquivo?",
            `Deseja realmente excluir o arquivo "${a.descricao || "sem nome"}"? Esta ação não pode ser desfeita.`,
            "Sim, excluir"
        );
        if (!confirmResult.isConfirmed) return;
        try {
            await deleteArquivo({ id: a.id, path: a.url });
            await loadSaved();
            showAlert("Sucesso", "Arquivo excluído!", "success");
        } catch (e: any) {
            console.error(e);
            showAlert("Erro", e?.message || "Erro ao excluir arquivo", "error");
        }
    };

    const pendingFiltered = docs.filter(f => !f.name.includes("Petição Inicial") && !f.name.includes("[ACOLHIMENTO]"));
    const pendingCount = pendingFiltered.length;
    
    // Filtra removendo Petições e Acolhimentos da aba geral de documentos (case-insensitive)
    const savedFiltered = saved.filter(a => {
        const desc = (a.descricao || "").toUpperCase();
        const isAcolhimento = desc.includes("ACOLHIMENTO");
        const isPeticao = desc.includes("PETIÇÃO INICIAL") || desc.includes("PETICAO INICIAL") || desc.includes("PETIÇÃO") || desc.includes("PETICAO");
        return !isAcolhimento && !isPeticao;
    });
    
    const savedTitle = useMemo(() => {
        if (!clienteId) return "Arquivos salvos (salve o cliente para visualizar)";
        return `Arquivos anexados (${savedFiltered.length})`;
    }, [clienteId, savedFiltered.length]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    padding: "0.9rem",
                    background: "var(--bg-surface)",
                }}
            >
                <div style={{ color: "var(--text-main)", fontWeight: 950, marginBottom: "0.45rem" }}>📎 Documentos do cliente</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.86rem", fontWeight: 750, lineHeight: 1.35 }}>
                    Você pode anexar arquivos. Eles serão enviados ao salvar o cliente.
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
                <input ref={fileInputRef} type="file" multiple onChange={(e) => handleAddFiles(e.target.files)} style={{ display: "none" }} />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                    style={{
                        padding: "0.6rem 0.75rem",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.10)",
                        background: "var(--bg-surface)",
                        color: "var(--text-main)",
                        cursor: saving ? "not-allowed" : "pointer",
                        fontWeight: 900,
                    }}
                >
                    ➕ Anexar arquivos
                </button>

                {pendingCount > 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 800 }}>
                        {pendingCount} pendente(s) para envio
                    </div>
                )}
            </div>

            {/* PENDENTES */}
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "rgba(17,24,39,0.35)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 0.85rem",
                        borderBottom: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                    }}
                >
                    <span>Pendentes (serão enviados ao salvar)</span>
                    <span style={{ color: "var(--text-muted)", fontWeight: 800 }}>Nome • Tamanho</span>
                </div>

                {pendingCount === 0 ? (
                    <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum documento pendente.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {pendingFiltered.map((f, idx) => (
                            <div
                                key={`${f.name}-${f.size}-${idx}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "0.75rem",
                                    padding: "0.85rem",
                                    borderTop: idx === 0 ? "none" : "1px solid var(--border-color)",
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        title={f.name}
                                        style={{
                                            color: "var(--text-main)",
                                            fontWeight: 900,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: "200px"
                                        }}
                                    >
                                        {f.name}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 800 }}>{humanSize(f.size)}</div>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <button
                                        type="button"
                                        onClick={() => downloadPendingDoc(f)}
                                        style={{
                                            padding: "0.45rem 0.6rem",
                                            borderRadius: 10,
                                            border: "1px solid rgba(59,130,246,0.35)",
                                            background: "rgba(59,130,246,0.14)",
                                            color: "var(--text-main)",
                                            cursor: "pointer",
                                            fontWeight: 900,
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        ⬇️ Baixar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => removeDoc(docs.findIndex(doc => doc === f))}
                                        style={{
                                            padding: "0.45rem 0.6rem",
                                            borderRadius: 10,
                                            border: "1px solid rgba(239,68,68,0.35)",
                                            background: "rgba(239,68,68,0.14)",
                                            color: "var(--text-main)",
                                            cursor: "pointer",
                                            fontWeight: 900,
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        🗑 Remover
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SALVOS */}
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "rgba(17,24,39,0.35)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.75rem 0.85rem",
                        borderBottom: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        fontWeight: 900,
                        fontSize: "0.85rem",
                    }}
                >
                    <span>{savedTitle}</span>
                    {clienteId ? (
                        <button
                            type="button"
                            onClick={loadSaved}
                            disabled={saving || loadingSaved}
                            style={{
                                padding: "0.45rem 0.6rem",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.10)",
                                background: "var(--bg-surface)",
                                color: "var(--text-main)",
                                cursor: saving ? "not-allowed" : "pointer",
                                fontWeight: 900,
                                fontSize: "0.82rem",
                                opacity: loadingSaved ? 0.8 : 1,
                            }}
                        >
                            {loadingSaved ? "Atualizando..." : "↻ Atualizar"}
                        </button>
                    ) : null}
                </div>

                {!clienteId ? (
                    <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        Salve o cliente para visualizar a lista de anexos salvos.
                    </div>
                ) : loadingSaved ? (
                    <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando anexos...</div>
                ) : savedFiltered.length === 0 ? (
                    <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum anexo salvo.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {savedFiltered.map((a, idx) => (
                            <div
                                key={a.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "0.75rem",
                                    padding: "0.85rem",
                                    borderTop: idx === 0 ? "none" : "1px solid var(--border-color)",
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        title={a.descricao || a.url.split("/").pop()}
                                        style={{
                                            color: "var(--text-main)",
                                            fontWeight: 900,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: "200px"
                                        }}
                                    >
                                        {a.descricao || a.url.split("/").pop()}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 800 }}>
                                        {new Date(a.criado_em).toLocaleString()}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                    <button
                                        type="button"
                                        onClick={() => openSaved(a)}
                                        style={{
                                            padding: "0.45rem 0.6rem",
                                            borderRadius: 10,
                                            border: "1px solid rgba(16,185,129,0.35)",
                                            background: "rgba(16,185,129,0.14)",
                                            color: "var(--text-main)",
                                            cursor: "pointer",
                                            fontWeight: 900,
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        👁 Visualizar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => openSaved(a)}
                                        style={{
                                            padding: "0.45rem 0.6rem",
                                            borderRadius: 10,
                                            border: "1px solid rgba(59,130,246,0.35)",
                                            background: "rgba(59,130,246,0.14)",
                                            color: "var(--text-main)",
                                            cursor: "pointer",
                                            fontWeight: 900,
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        ⬇️ Baixar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => deleteSaved(a)}
                                        style={{
                                            padding: "0.45rem 0.6rem",
                                            borderRadius: 10,
                                            border: "1px solid rgba(239,68,68,0.35)",
                                            background: "rgba(239,68,68,0.14)",
                                            color: "var(--text-main)",
                                            cursor: "pointer",
                                            fontWeight: 900,
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        🗑 Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};