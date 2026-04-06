// src/views/processos/list/modals/ProcessoModalTabDocumentos.tsx
import React, { useEffect, useMemo, useState } from "react";
import { deleteArquivo, getSignedUrl, listArquivosByProcesso, type JurArquivo } from "../api/arquivos.api";
import { showAlert } from "../../../../utils/alert";

export const ProcessoModalTabDocumentos: React.FC<{
    saving: boolean;

    docs: File[];
    setDocs: React.Dispatch<React.SetStateAction<File[]>>;
    fileInputRef: React.RefObject<HTMLInputElement | null>;

    processoId: number | null;
}> = ({ saving, docs, setDocs, fileInputRef, processoId }) => {
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
        if (!processoId) {
            setSaved([]);
            return;
        }
        setLoadingSaved(true);
        try {
            const data = await listArquivosByProcesso(processoId);
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
    }, [processoId]);

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
            // bucket PUBLIC: poderia abrir direto, mas signed url funciona também
            const url = await getSignedUrl(a.url, 60 * 10);
            window.open(url, "_blank", "noopener,noreferrer");
        } catch (e: any) {
            console.error(e);
            showAlert("Erro", e?.message || "Não foi possível abrir o arquivo", "error");
        }
    };

    const deleteSaved = async (a: JurArquivo) => {
        if (!confirm(`Excluir o arquivo "${a.descricao || "sem nome"}"?`)) return;
        try {
            await deleteArquivo({ id: a.id, path: a.url });
            await loadSaved();
            showAlert("Sucesso", "Arquivo excluído!", "success");
        } catch (e: any) {
            console.error(e);
            showAlert("Erro", e?.message || "Erro ao excluir arquivo", "error");
        }
    };

    const savedTitle = useMemo(() => {
        if (!processoId) return "Arquivos salvos (salve o processo para visualizar)";
        return "Arquivos salvos";
    }, [processoId]);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.85rem" }}>
            <div
                style={{
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 12,
                    padding: "0.9rem",
                    background: "var(--bg-surface)",
                }}
            >
                <div style={{ color: "var(--text-main)", fontWeight: 950, marginBottom: "0.35rem" }}>📎 Documentos do processo</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.86rem", fontWeight: 750, lineHeight: 1.35 }}>
                    Anexe arquivos. Eles serão enviados ao salvar o processo.
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

                {docs.length > 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 800 }}>{docs.length} pendente(s)</div>
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

                {docs.length === 0 ? (
                    <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum documento pendente.</div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {docs.map((f, idx) => (
                            <div
                                key={`${f.name}-${f.size}-${idx}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "0.75rem",
                                    padding: "0.85rem",
                                    borderTop: idx === 0 ? "none" : ""1px solid var(--border-color)"",
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ color: "var(--text-main)", fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                                        onClick={() => removeDoc(idx)}
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
            {processoId && (
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
                    </div>

                    {loadingSaved ? (
                        <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Carregando anexos...</div>
                    ) : saved.length === 0 ? (
                        <div style={{ padding: "0.95rem 0.85rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>Nenhum anexo salvo.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {saved.map((a, idx) => (
                                <div
                                    key={a.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "0.75rem",
                                        padding: "0.85rem",
                                        borderTop: idx === 0 ? "none" : ""1px solid var(--border-color)"",
                                    }}
                                >
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ color: "var(--text-main)", fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
            )}
        </div>
    );
};