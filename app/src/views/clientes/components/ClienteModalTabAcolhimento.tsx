import React, { useState, useEffect } from "react";
import { showAlert, showConfirm, showLoading, closeAlert } from "../../../utils/alert";
import { JurArquivo, listArquivosByCliente, deleteArquivo, getSignedUrl, uploadArquivosCliente } from "../api/arquivos.api";
import { Section } from "./ClienteModalUI";

type AcolhimentoFormState = { relato: string };

export const ClienteModalTabAcolhimento: React.FC<{
    saving: boolean;
    acolhimento: AcolhimentoFormState;
    setAcolhimento: React.Dispatch<React.SetStateAction<AcolhimentoFormState>>;
    isRecording: boolean;
    setIsRecording: (v: boolean) => void;
    recognitionRef: React.MutableRefObject<any>;
    clienteId: number | null;
    escritorioId?: number | null;
    userId?: string | null;
}> = ({ acolhimento, setAcolhimento, isRecording, setIsRecording, recognitionRef, clienteId, escritorioId, userId }) => {

    const [documentosSalvos, setDocumentosSalvos] = useState<JurArquivo[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [sectionListaOpen, setSectionListaOpen] = useState(true);

    useEffect(() => {
        carregarDocumentos();
    }, [clienteId]);

    const carregarDocumentos = async () => {
        if (!clienteId) return;
        setLoadingDocs(true);
        try {
            const list = await listArquivosByCliente(clienteId);
            const gerados = list.filter(d => {
                const desc = (d.descricao || "").toUpperCase();
                // Updated filter to be more flexible for "ACOLHIMENTO" documents
                return desc.includes("ACOLHIMENTO") || desc.includes("ACOLHIMENTO"); // The original filter was already case-insensitive. If the intent was to add more keywords or variations, they should be added here. For now, keeping it as is based on the instruction's context for "Acolhimento" tab.
            });
            setDocumentosSalvos(gerados);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleNovo = () => {
        setAcolhimento(p => ({ ...p, relato: "" }));
    };

    const gerarTxtBlob = (): Blob => {
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        return new Blob([bom, acolhimento.relato], { type: "text/plain;charset=utf-8" });
    };

    const getProtocol = () => {
        const d = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
    };

    const handleBaixarDoc = () => {
        if (!acolhimento.relato.trim()) {
            showAlert("Atenção", "O relato está vazio.", "warning");
            return;
        }
        const url = URL.createObjectURL(gerarTxtBlob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `Acolhimento_${getProtocol()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSalvarImediato = async () => {
        if (!acolhimento.relato.trim()) {
            showAlert("Atenção", "O relato está vazio.", "warning");
            return;
        }
        if (!clienteId || !escritorioId) {
            showAlert("Atenção", "O cliente precisa estar cadastrado para salvar o acolhimento diretamente.", "warning");
            return;
        }

        const res = await showConfirm("Salvar agora?", "Deseja salvar este acolhimento permanentemente no histórico?", "Sim, salvar");
        if (!res.isConfirmed) return;

        showLoading("Salvando acolhimento...", "Registrando documento no sistema.");

        try {
            const blob = gerarTxtBlob();
            const file = new File([blob], `Acolhimento [ACOLHIMENTO] - ${getProtocol()}.txt`, { type: "text/plain" });

            await uploadArquivosCliente({
                escritorioId,
                clienteId,
                usuarioId: userId ?? null,
                files: [file]
            });

            closeAlert();
            showAlert("Sucesso", "Acolhimento registrado!", "success");
            
            setAcolhimento({ relato: "" });
            carregarDocumentos();

        } catch (error: any) {
            closeAlert();
            showAlert("Erro", error?.message || "Erro ao salvar acolhimento", "error");
        }
    };



    const handleAbrirDoc = async (arquivo: JurArquivo) => {
        try {
            showLoading("Buscando conteúdo...", "Aguarde enquanto recuperamos o acolhimento.");
            const url = await getSignedUrl(arquivo.url);
            const res = await fetch(url);
            if (!res.ok) throw new Error("Falha ao recuperar blob do arquivo");

            const texto = await res.text();
            setAcolhimento(prev => ({ ...prev, relato: texto }));

            closeAlert();
            setTimeout(() => {
                document.querySelector("textarea")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);

        } catch (e: any) {
            showAlert("Erro", "Não foi possível abrir o conteúdo do acolhimento.", "error");
        }
    };

    const handleExcluirDoc = async (arquivo: JurArquivo) => {
        const result = await showConfirm("Excluir?", "Remover este acolhimento?", "Sim, excluir");

        if (!result.isConfirmed) return;

        try {
            await deleteArquivo({ id: arquivo.id, path: arquivo.url });
            carregarDocumentos();
            showAlert("Excluído", "Acolhimento removido.", "success");
        } catch (e: any) {
            showAlert("Erro", "Falha ao excluir.", "error");
        }
    };

    const [interimText, setInterimText] = useState("");

    const canUseSpeech =
        typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    const toggleRecording = () => {
        if (!canUseSpeech) {
            showAlert("Atenção", "Seu navegador não suporta reconhecimento de voz.", "warning");
            return;
        }

        if (isRecording) {
            try {
                recognitionRef.current?.stop?.();
            } catch {
                // ignore
            }
            setIsRecording(false);
            setInterimText("");
            return;
        }

        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SR();
        recognitionRef.current = rec;

        rec.lang = "pt-BR";
        rec.interimResults = true;
        rec.continuous = true;

        rec.onresult = (event: any) => {
            let finalText = "";
            let currentInterim = "";
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const res = event.results[i];
                const txt = res[0]?.transcript ?? "";
                if (res.isFinal) {
                    finalText += txt;
                } else {
                    currentInterim += txt;
                }
            }

            if (finalText.trim()) {
                setAcolhimento((prev) => ({
                    ...prev,
                    relato: (prev.relato ? prev.relato + " " : "") + finalText.trim(),
                }));
            }
            setInterimText(currentInterim);
        };

        rec.onerror = (event: any) => {
            if (event.error === "no-speech") {
                return; // Ignora apenas o fato de não ter captado som
            }
            setIsRecording(false);
            setInterimText("");
            if (event.error === "not-allowed") {
                showAlert("Permissão Negada", "O navegador bloqueou o acesso ao microfone. Verifique as permissões no ícone de cadeado ao lado do link.", "error");
            } else {
                showAlert("Erro", `Falha no reconhecimento de voz (${event.error}). Permissões do microfone estão ok?`, "error");
            }
            console.error("SpeechRecognition error:", event.error);
        };

        rec.onend = () => {
             setIsRecording(false);
             setInterimText("");
        };

        try {
            rec.start();
            setIsRecording(true);
            setInterimText("");
        } catch {
            setIsRecording(false);
            showAlert("Erro", "Não foi possível iniciar a gravação.", "error");
        }
    };

    const handleProcessarIA = async () => {
        if (!acolhimento.relato?.trim()) {
            showAlert("Atenção", "Digite ou grave algo antes de usar a IA.", "warning");
            return;
        }

        try {
            showLoading("Estruturando com IA...", "Aguarde enquanto a inteligência artificial processa o texto.");
            // @ts-expect-error (JS module)
            const m = await import("../../../services/ia_processing.js");
            const resultado = await m.processarTranscricaoComIA(acolhimento.relato);
            const textoFormatado = m.formatarResultadoParaTexto(resultado);
            setAcolhimento((prev) => ({ ...prev, relato: textoFormatado }));
            closeAlert();
            showAlert("Sucesso", "Texto estruturado com sucesso pela IA!", "success");
        } catch (e: unknown) {
            closeAlert();
            showAlert("Erro", "Erro ao processar com IA: " + (e as Error).message, "error");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
                style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: 12,
                    padding: "0.9rem",
                    background: "var(--bg-surface)",
                }}
            >
                <div style={{ color: "var(--text-main)", fontWeight: 950, marginBottom: "0.45rem" }}>📝 Acolhimento</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.86rem", fontWeight: 750, lineHeight: 1.35 }}>
                    Registre o relato inicial (digitando, gravando ou estruturando com IA). Os dados cadastrais ficam na aba “Dados do cliente”.
                </div>
            </div>

            <div>
                <label
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        flexWrap: "wrap",
                        marginBottom: "0.55rem",
                        color: "var(--text-main)",
                        fontWeight: 850,
                        fontSize: "0.85rem",
                    }}
                >
                    <span>Relato / Transcrição</span>
                    <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button
                            type="button"
                            onClick={toggleRecording}
                            style={{
                                padding: "0.45rem 0.65rem",
                                borderRadius: 10,
                                border: isRecording ? "1px solid rgba(239,68,68,0.35)" : "1px solid var(--border-color)",
                                background: isRecording ? "rgba(239,68,68,0.16)" : "var(--bg-surface)",
                                color: isRecording ? "var(--danger)" : "var(--text-main)",
                                cursor: "pointer",
                                fontWeight: 900,
                                fontSize: "0.82rem",
                            }}
                        >
                            {isRecording ? "⏹ Parar" : "🎤 Gravar"}
                        </button>

                        <button
                            type="button"
                            onClick={handleProcessarIA}
                            style={{
                                padding: "0.45rem 0.65rem",
                                borderRadius: 10,
                                border: "1px solid rgba(139,92,246,0.35)",
                                background: "rgba(139,92,246,0.18)",
                                color: "var(--accent)",
                                cursor: "pointer",
                                fontWeight: 900,
                                fontSize: "0.82rem",
                            }}
                        >
                            ✨ Estruturar IA
                        </button>
                    </span>
                </label>

                <textarea
                    value={acolhimento.relato}
                    onChange={(e) => setAcolhimento((p) => ({ ...p, relato: e.target.value }))}
                    placeholder="Digite os detalhes do primeiro atendimento ou use a gravação/IA."
                    style={{
                        width: "100%",
                        minHeight: 170,
                        borderRadius: 12,
                        fontSize: "0.92rem",
                        background: "var(--bg-panel)",
                        border: "1px solid var(--border-color)",
                        color: "var(--text-main)",
                        padding: "0.75rem 0.85rem",
                        outline: "none",
                        boxSizing: "border-box",
                        fontFamily: "inherit",
                        resize: "vertical",
                    }}
                />

                {isRecording && interimText && (
                    <div style={{ marginTop: "0.5rem", padding: "0.5rem 0.8rem", borderRadius: 8, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", gap: "0.5rem" }}>
                        <span style={{ color: "var(--accent)" }}>🎙️</span>
                        <span style={{ color: "var(--text-main)", fontSize: "0.85rem", fontStyle: "italic" }}>{interimText}</span>
                    </div>
                )}

                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                    <button type="button" onClick={handleNovo} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-main)", cursor: "pointer", fontWeight: 800 }}>
                        ✨ Novo Acolhimento
                    </button>
                    <button type="button" onClick={handleBaixarDoc} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-main)", cursor: "pointer", fontWeight: 800 }}>
                        ⬇ Baixar TXT
                    </button>
                    <button type="button" onClick={handleSalvarImediato} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "none", background: "var(--success)", color: "var(--text-main)", cursor: "pointer", fontWeight: 800 }}>
                        💾 Salvar Definitivo
                    </button>
                </div>
            </div>

            {clienteId && (
                <Section 
                    title={`Histórico de Acolhimentos (${documentosSalvos.length})`} 
                    open={sectionListaOpen} 
                    onToggle={() => setSectionListaOpen(!sectionListaOpen)}
                >
                    {loadingDocs ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Carregando histórico...</div>
                    ) : documentosSalvos.length === 0 ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nenhum acolhimento salvo para este cliente.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {documentosSalvos.map((doc) => (
                                <div key={doc.id} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    background: "var(--bg-surface)", padding: "0.6rem 0.8rem", borderRadius: 8,
                                    border: "1px solid var(--border-color)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span>📝</span>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span title={doc.descricao || undefined} style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "250px", display: "inline-block" }}>
                                                {doc.descricao}
                                            </span>
                                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                {new Date(doc.criado_em).toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button type="button" onClick={() => handleAbrirDoc(doc)} style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
                                            Abrir
                                        </button>
                                        <button type="button" onClick={() => handleExcluirDoc(doc)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Section>
            )}
        </div>
    );
};