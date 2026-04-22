import React, { useState, useEffect } from "react";
import { showAlert, showConfirm, showLoading, closeAlert } from "../../../utils/alert";
import { jsPDF } from "jspdf";
import { gerarTextoComIA } from "../../../services/ia.api";

// @ts-ignore
import { PROMPT_PETICAO_INICIAL, preencherPrompt } from "../../../services/prompts_juridicos";
import { JurArquivo, listArquivosByCliente, deleteArquivo, getSignedUrl, uploadArquivosCliente, updateArquivoContent } from "../api/arquivos.api";
import { Input, Section } from "./ClienteModalUI";

type Props = {
    clienteId: number | null;
    escritorioId: number | null;
    fatosIniciais?: string;
    dadosCliente?: any;
    onClose?: () => void;
    userId?: string | null;
};

export const ClienteModalTabGerador: React.FC<Props> = ({ clienteId, escritorioId, fatosIniciais, dadosCliente, userId }) => {

    const [comarca, setComarca] = useState("");
    const [vara, setVara] = useState("");

    const [gerando, setGerando] = useState(false);
    const [textoGerado, setTextoGerado] = useState("");

    const [documentosGerados, setDocumentosGerados] = useState<JurArquivo[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [arquivoSendoEditado, setArquivoSendoEditado] = useState<JurArquivo | null>(null);

    const [sectionGeradorOpen, setSectionGeradorOpen] = useState(true);
    const [sectionListaOpen, setSectionListaOpen] = useState(true);

    useEffect(() => {
        carregarDocumentosGerados();
    }, [clienteId]);

    const carregarDocumentosGerados = async () => {
        console.log("[DEBUG Gerador] clienteId =", clienteId);
        if (!clienteId) {
            console.warn("[DEBUG Gerador] clienteId é null/undefined — saindo sem carregar lista");
            return;
        }
        setLoadingDocs(true);
        try {
            const list = await listArquivosByCliente(clienteId);
            console.log("[DEBUG Gerador] Total de arquivos do cliente:", list.length, list.map(d => d.descricao));
            const gerados = list.filter(d => {
                const desc = (d.descricao || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const match = desc.includes("[VIA IA]") || desc.includes("PETICAO") || desc.includes("PETI");
                console.log("[DEBUG Gerador] Arquivo:", d.descricao, "→ desc normalizada:", desc, "→ match:", match);
                return match;
            });
            console.log("[DEBUG Gerador] Petições filtradas:", gerados.length);
            setDocumentosGerados(gerados);
        } catch (error) {
            console.error("[DEBUG Gerador] Erro ao carregar arquivos:", error);
        } finally {
            setLoadingDocs(false);
        }
    };


    const handleGerar = async () => {
        if (!fatosIniciais || fatosIniciais.length < 10) {
            showAlert("Atenção", "O relato dos fatos (Acolhimento) está vazio ou muito curto.", "warning");
            return;
        }

        setGerando(true);
        showLoading("Gerando Petição...", "A inteligência artificial está redigindo o documento. Isso pode levar alguns segundos.");
        try {
            const variaveis = {
                cliente_nome: dadosCliente?.nome || "Nome não informado",
                cpf_cnpj: dadosCliente?.cpf_cnpj || "CPF/CNPJ não informado",
                endereco: `${dadosCliente?.endereco || ''}, ${dadosCliente?.numero || ''} ${dadosCliente?.complemento ? '- ' + dadosCliente.complemento : ''} - ${dadosCliente?.bairro || ''}, ${dadosCliente?.cidade || ''}/${dadosCliente?.estado || ''} - CEP: ${dadosCliente?.cep || ''}`.replace(/^[,\s-]*|[,\s-]*$/g, ''),
                contato: `Cel: ${dadosCliente?.celular || ''} | E-mail: ${dadosCliente?.email || ''}`.replace(/^[,\s|]*|[,\s|]*$/g, ''),
                comarca: comarca || "[MUNICÍPIO]",
                vara: vara || "[VARA CÍVEL]",
                fatos: fatosIniciais
            };

            const promptPronto = preencherPrompt(PROMPT_PETICAO_INICIAL, variaveis);
            const resposta = await gerarTextoComIA(promptPronto);
            setTextoGerado(resposta);
            setArquivoSendoEditado(null); // Ao gerar nova pela IA, resetamos o vínculo de edição
            closeAlert();
        } catch (error: any) {
            closeAlert();
            showAlert("Erro", error?.message || "Erro ao gerar petição", "error");
        } finally {
            setGerando(false);
        }
    };

    const gerarTxtBlob = (): Blob => {
        // Usa BOM (Byte Order Mark) para apps Desktop reconhecerem acentuação UTC-8 perfeitamente
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        return new Blob([bom, textoGerado], { type: "text/plain;charset=utf-8" });
    };

    const gerarPDFBlob = (): Blob => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        // Quebra automática de linha baseada na largura de 170mm
        const lines = doc.splitTextToSize(textoGerado, 170);
        let cursorY = 20;

        lines.forEach((line: string) => {
            if (cursorY > 280) {
                doc.addPage();
                cursorY = 20;
            }
            // Sanitiza os caracteres caso haja falha severa, mas o latin baseline costuma imprimir tranquilo
            doc.text(line, 20, cursorY);
            cursorY += 7;
        });

        return doc.output("blob");
    };

    const getProtocol = () => {
        const d = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
    };

    const handleBaixarDoc = () => {
        if (!textoGerado) return;
        const url = URL.createObjectURL(gerarTxtBlob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `Peticao_${dadosCliente?.nome || "Cliente"}_${getProtocol()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleBaixarPDF = () => {
        if (!textoGerado) return;
        const url = URL.createObjectURL(gerarPDFBlob());
        const a = document.createElement("a");
        a.href = url;
        a.download = `Peticao_${dadosCliente?.nome || "Cliente"}_${getProtocol()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleZerar = () => {
        setTextoGerado("");
        setArquivoSendoEditado(null);
    };

    const handleSalvarImediato = async () => {
        if (!textoGerado) return;
        console.log("[DEBUG Save] clienteId =", clienteId, "| escritorioId =", escritorioId);
        if (!clienteId || !escritorioId) {
            showAlert("Atenção", `O cliente precisa estar salvo no sistema para registrar a petição diretamente. [clienteId=${clienteId}, escritorioId=${escritorioId}]`, "warning");
            return;
        }

        const res = await showConfirm(
            arquivoSendoEditado ? "Atualizar arquivo?" : "Salvar agora?", 
            arquivoSendoEditado ? "Deseja salvar as alterações manuais neste documento?" : "Deseja salvar esta petição permanentemente?", 
            arquivoSendoEditado ? "Sim, atualizar" : "Sim, salvar"
        );
        if (!res.isConfirmed) return;

        showLoading(arquivoSendoEditado ? "Atualizando..." : "Salvando petição...", "Registrando documento no histórico do cliente.");

        try {
            const blob = gerarTxtBlob();
            const protocoloAtual = getProtocol();
            
            if (arquivoSendoEditado) {
                await updateArquivoContent({
                    id: arquivoSendoEditado.id,
                    path: arquivoSendoEditado.url,
                    fileContent: blob,
                    contentType: "text/plain"
                });
            } else {
                const nomeArquivo = `Peticao Inicial [VIA IA] - ${protocoloAtual}.txt`;
                const file = new File([blob], nomeArquivo, { type: "text/plain" });

                await uploadArquivosCliente({
                    escritorioId,
                    clienteId,
                    usuarioId: userId ?? null,
                    files: [file],
                    descricaoOverride: () => nomeArquivo
                });
            }

            closeAlert();
            showAlert("Sucesso", arquivoSendoEditado ? "Alterações salvas!" : "Petição salva com sucesso!", "success");
            
            if (!arquivoSendoEditado) {
                const newList = await listArquivosByCliente(clienteId);
                const recemCriado = newList.find(d => (d.descricao || "").includes("[VIA IA]"));
                if (recemCriado) setArquivoSendoEditado(recemCriado);
            }
            carregarDocumentosGerados();

        } catch (error: any) {
            closeAlert();
            showAlert("Erro", error?.message || "Erro ao salvar petição no banco", "error");
        }
    };



    const handleAbrirDoc = async (arquivo: JurArquivo) => {
        try {
            showLoading("Abrindo petição...", "Aguarde enquanto carregamos o documento.");
            const url = await getSignedUrl(arquivo.url);

            // Faz o download do conteúdo textual do TXT pra injetar no estado (com cache buster)
            const res = await fetch(url + (url.includes('?') ? '&' : '?') + 't=' + Date.now());
            if (!res.ok) throw new Error("Falha ao recuperar blob do arquivo");

            const texto = await res.text();

            setTextoGerado(texto);
            setArquivoSendoEditado(arquivo);
            setSectionGeradorOpen(true);

            closeAlert();

            // Rola a tela suavemente até a edição
            setTimeout(() => {
                document.querySelector("textarea")?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);

        } catch (e: any) {
            showAlert("Erro", "Não foi possível abrir o conteúdo da petição.", "error");
        }
    };

    const handleExcluirDoc = async (arquivo: JurArquivo) => {
        const result = await showConfirm("Excluir?", "Remover este documento gerado pela IA?", "Sim, excluir");

        if (!result.isConfirmed) return;

        try {
            await deleteArquivo({ id: arquivo.id, path: arquivo.url });
            carregarDocumentosGerados();
            showAlert("Excluído", "Documento removido com sucesso.", "success");
        } catch (e: any) {
            showAlert("Erro", "Falha ao excluir o documento.", "error");
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            <Section title="Petição Inicial (IA)" open={sectionGeradorOpen} onToggle={() => setSectionGeradorOpen(!sectionGeradorOpen)}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Comarca"
                                value={comarca}
                                onValue={setComarca}
                                placeholder="Ex: São Paulo - SP"
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Vara (opcional)"
                                value={vara}
                                onValue={setVara}
                                placeholder="Ex: Vara Cível"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGerar}
                        disabled={gerando}
                        style={{
                            marginTop: "0.5rem", padding: "0.75rem", borderRadius: 10, border: "none",
                            background: "var(--success)", color: "var(--text-main)", fontWeight: 800, cursor: gerando ? "not-allowed" : "pointer",
                            opacity: gerando ? 0.7 : 1
                        }}
                    >
                        {gerando ? "⏳ Conectando com a IA..." : "⚡ Gerar Petição via IA"}
                    </button>

                    {textoGerado && (
                        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 800 }}>
                                    {arquivoSendoEditado ? `Editando: ${arquivoSendoEditado.descricao}` : "Texto Gerado (você pode editar livremente)"}
                                </label>
                                <button 
                                    onClick={handleZerar}
                                    style={{ 
                                        background: "transparent", border: "1px solid var(--border-color)", 
                                        color: "var(--danger)", fontSize: "0.7rem", padding: "0.2rem 0.5rem", 
                                        borderRadius: 6, cursor: "pointer", fontWeight: 800 
                                    }}
                                >
                                    ✕ Limpar / Novo
                                </button>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                                <button onClick={handleSalvarImediato} style={{ flex: 2, padding: "0.6rem", borderRadius: 8, border: "none", background: "var(--success)", color: "var(--text-main)", cursor: "pointer", fontWeight: 800 }}>
                                    {arquivoSendoEditado ? "💾 Atualizar Alterações" : "💾 Salvar Definitivo"}
                                </button>
                                <button onClick={handleBaixarDoc} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border-color)", background: "transparent", color: "var(--text-main)", cursor: "pointer", fontWeight: 800 }}>
                                    ⬇ TXT
                                </button>
                                <button onClick={handleBaixarPDF} style={{ flex: 1, padding: "0.6rem", borderRadius: 8, border: "1px solid var(--border-color)", background: "rgba(220,38,38,0.1)", color: "var(--danger)", cursor: "pointer", fontWeight: 800 }}>
                                    ⬇ PDF
                                </button>
                            </div>

                            <textarea
                                value={textoGerado}
                                onChange={(e) => setTextoGerado(e.target.value)}
                                style={{
                                    width: "100%",
                                    height: "220px",
                                    padding: "0.85rem",
                                    borderRadius: 10,
                                    border: "1px solid var(--border-color)",
                                    background: "var(--bg-darker)",
                                    color: "var(--text-main)",
                                    fontSize: "0.9rem",
                                    fontFamily: "monospace",
                                    lineHeight: 1.5,
                                    resize: "vertical"
                                }}
                            />
                        </div>
                    )}
                </div>
            </Section>

            {clienteId && (
                <Section 
                    title={`Petições Geradas (${documentosGerados.length})`} 
                    open={sectionListaOpen} 
                    onToggle={() => setSectionListaOpen(!sectionListaOpen)}
                >
                    {loadingDocs ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Carregando histórico...</div>
                    ) : documentosGerados.length === 0 ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Nenhuma petição gerada via IA encontrada para este cliente.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {documentosGerados.map((doc) => (
                                <div key={doc.id} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    background: "var(--bg-surface)", padding: "0.6rem 0.8rem", borderRadius: 8,
                                    border: "1px solid var(--border-color)"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <span>📄</span>
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
                                        <button onClick={() => handleAbrirDoc(doc)} style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
                                            Abrir
                                        </button>
                                        <button onClick={() => handleExcluirDoc(doc)} style={{ background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>
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
