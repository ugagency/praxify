import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "../../../core/store";
import { updateProcessoStatus } from "../list/api/processos.api";
import { showAlert, showConfirm } from "../../../utils/alert";

import { useProcessoDetalheData } from "./hooks/useProcessoDetalheData";

import { ProcessoDetalheHeader } from "./components/ProcessoDetalheHeader";
import { ProcessoClienteDadosCard } from "./components/ProcessoClienteDadosCard";
import { ProcessoDadosCard } from "./components/ProcessoDadosCard";
import { ProcessoTimelineCard } from "./components/ProcessoTimelineCard";
import { ProcessoPrazosCard } from "./components/ProcessoPrazosCard";
import { ProcessoDocumentosCard } from "./components/ProcessoDocumentosCard";
import { ProcessoAcoesCard } from "./components/ProcessoAcoesCard";

import { ProcessoModal } from "../list/modals/ProcessoModal";
import { upsertProcesso, fetchClientes, fetchUsuarios } from "../list/api/processos.api";
import type { Cliente, ProcessoFormState, Usuario } from "../list/types/processos.types";

type Params = {
    id?: string;
    processoId?: string;
};

export const ProcessoDetalhePage: React.FC = () => {
    const params = useParams<Params>();
    const id = params.id ?? params.processoId; // ✅ fallback
    const navigate = useNavigate();
    const { escritorio, user } = useAppStore();

    const { processo, timeline, prazos, documentos, loading, errorMsg, reload } = useProcessoDetalheData(id);

    // Edit Modal State
    const [isEditModalOpen, setEditModalOpen] = React.useState(false);
    const [clientes, setClientes] = React.useState<Cliente[]>([]);
    const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);

    React.useEffect(() => {
        if (escritorio) {
            fetchClientes(escritorio.id).then(res => setClientes(res.data || []));
            fetchUsuarios(String(escritorio.id)).then(res => setUsuarios(res.data || []));
        }
    }, [escritorio]);

    const handleSaveEdit = async (form: ProcessoFormState) => {
        if (!escritorio || !processo) return;

        const payload = {
            cliente_id: parseInt(form.cliente_id, 10),
            numero_autos: form.numero_autos || null,
            tribunal: form.tribunal || null,
            status: form.status,
            responsavel_id: form.responsavel_id || user?.id,
        };

        try {
            const { error } = await upsertProcesso({
                escritorioId: escritorio.id,
                processoId: processo.id,
                payload,
            });

            if (error) throw error;

            setEditModalOpen(false);
            await reload();
            showAlert("Sucesso", "Dados do processo atualizados!", "success");
        } catch (e: any) {
            showAlert("Erro", e?.message || "Erro ao atualizar dados", "error");
        }
    };

    const handleArquivarProcesso = async () => {
        if (!processo) return;
        const result = await showConfirm("Arquivar Processo?", "O processo será movido para os Arquivados.", "Sim, arquivar");

        if (!result.isConfirmed) return;

        try {
            await updateProcessoStatus(processo.id, "ARQUIVADO");
            showAlert("Sucesso!", "Processo arquivado com sucesso.", "success");
            reload();
        } catch (e: any) {
            showAlert("Erro", e?.message || "Não foi possível arquivar o processo.", "error");
        }
    };

    const handleAtivarProcesso = async () => {
        if (!processo) return;
        const result = await showConfirm("Ativar Processo?", "O processo será movido de volta para a lista de Ativos.", "Sim, ativar");

        if (!result.isConfirmed) return;

        try {
            await updateProcessoStatus(processo.id, "ATIVO");
            showAlert("Sucesso!", "Processo ativado com sucesso.", "success");
            reload();
        } catch (e: any) {
            showAlert("Erro", e?.message || "Não foi possível ativar o processo.", "error");
        }
    };

    const unifiedTimeline = useMemo(() => {
        const events: any[] = [];

        if (processo?.criado_em) {
            events.push({
                id: `proc_${processo.id}`,
                tipo: "Criação",
                titulo: `Processo cadastrado no sistema`,
                transcricao: `Número: ${processo.numero_autos || processo.numero || processo.id}\nCliente: ${processo.cliente?.nome || 'N/A'}\nAção: ${processo.acao || 'N/A'}`,
                criado_em: processo.criado_em,
                dotColor: "#3b82f6" // blue
            });
        }

        (timeline || []).forEach(t => {
            events.push({
                id: `hist_${t.id}`,
                tipo: t.tipo || "Histórico",
                titulo: t.titulo || "Evento de histórico",
                transcricao: t.transcricao,
                resumo_ia: t.resumo_ia,
                criado_em: t.criado_em,
                dotColor: t.tipo === "IA" ? "#8b5cf6" : "#10b981" // purple or green
            });
        });

        (prazos || []).forEach(p => {
            events.push({
                id: `prazo_${p.id}`,
                tipo: p.tipo ? "Prazo" : "Compromisso",
                titulo: String(p.tarefa || "Novo alerta"),
                transcricao: `Status: ${p.status || "PENDENTE"}\nData Fatal: ${new Date(String(p.data_fatal)).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}${p.descricao ? `\n\nDescrição: ${p.descricao}` : ''}`,
                criado_em: p.criado_em || p.data_fatal || new Date().toISOString(),
                dotColor: p.status === "FEITO" ? "#10b981" : "#ef4444" // green or red
            });
        });

        (documentos || []).forEach(d => {
            events.push({
                id: `doc_${d.id}_${d.origem}`,
                tipo: d.origem === "UPLOAD" ? "Anexo" : "Documento",
                titulo: String(d.titulo || "Novo arquivo adicionado"),
                transcricao: null,
                criado_em: d.criado_em || new Date().toISOString(),
                dotColor: "#f59e0b" // amber
            });
        });

        events.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());

        return events;
    }, [processo, timeline, prazos, documentos]);

    const summary = useMemo(() => {
        const prazosPendentes = prazos?.length ?? 0;
        const docs = documentos?.length ?? 0;

        const lastEvent = unifiedTimeline[0];
        let ultimoEvento = "-";

        if (lastEvent?.criado_em) {
            const d = new Date(lastEvent.criado_em);
            ultimoEvento = d.toLocaleDateString("pt-BR", { timeZone: 'America/Sao_Paulo' }) + " às " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: 'America/Sao_Paulo' });
        }

        return { prazosPendentes, docs, ultimoEvento };
    }, [documentos, prazos, unifiedTimeline]);

    if (!escritorio) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
                Escritório não carregado.
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                Carregando detalhes do processo...
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
                {errorMsg}
            </div>
        );
    }

    if (!processo) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
                Processo não encontrado.
            </div>
        );
    }

    return (
        <div className="animation-fade-in">
            <div
                style={{
                    borderRadius: 18,
                    border: "1px solid rgba(148,163,184,0.14)",
                    background:
                        "radial-gradient(1200px 600px at 10% 0%, rgba(56,189,248,0.10), transparent 55%), radial-gradient(900px 500px at 85% 10%, rgba(16,185,129,0.10), transparent 55%), linear-gradient(180deg, rgba(2,6,23,0.92), rgba(2,6,23,0.72))",
                    padding: "1rem",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                    <ProcessoDetalheHeader processo={processo} onBack={() => navigate("/processos")} />

                    {/* Stats */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "0.75rem",
                        }}
                    >
                        <div
                            style={{
                                borderRadius: 16,
                                border: "1px solid rgba(148,163,184,0.14)",
                                background: "var(--bg-panel)",
                                padding: "0.85rem 1rem",
                            }}
                        >
                            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 0.4 }}>
                                PRAZOS PENDENTES
                            </div>
                            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
                                <span style={{ color: "var(--text-main)", fontSize: "1.35rem", fontWeight: 900 }}>
                                    {summary.prazosPendentes}
                                </span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>ativos</span>
                            </div>
                        </div>

                        <div
                            style={{
                                borderRadius: 16,
                                border: "1px solid rgba(148,163,184,0.14)",
                                background: "var(--bg-panel)",
                                padding: "0.85rem 1rem",
                            }}
                        >
                            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 0.4 }}>
                                DOCUMENTOS
                            </div>
                            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
                                <span style={{ color: "var(--text-main)", fontSize: "1.35rem", fontWeight: 900 }}>
                                    {summary.docs}
                                </span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>itens</span>
                            </div>
                        </div>

                        <div
                            style={{
                                borderRadius: 16,
                                border: "1px solid rgba(148,163,184,0.14)",
                                background: "var(--bg-panel)",
                                padding: "0.85rem 1rem",
                            }}
                        >
                            <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 0.4 }}>
                                ÚLTIMA ATUALIZAÇÃO
                            </div>
                            <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", gap: 10 }}>
                                <span style={{ color: "var(--text-main)", fontSize: "1.05rem", fontWeight: 850 }}>
                                    {summary.ultimoEvento}
                                </span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>timeline</span>
                            </div>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 1fr)",
                            gap: "1rem",
                            alignItems: "start",
                        }}
                    >
                        {/* MAIN */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minWidth: 0 }}>
                            <ProcessoClienteDadosCard cliente={processo.cliente} />

                            <ProcessoDadosCard
                                processo={processo}
                                onEdit={() => setEditModalOpen(true)}
                                onUpdated={() => reload?.()}
                            />

                            <ProcessoTimelineCard timeline={unifiedTimeline} />
                        </div>

                        {/* SIDEBAR */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <ProcessoPrazosCard
                                prazos={prazos}
                                processoId={processo.id}
                                processoLabel={String(processo.numero_autos || processo.id)}
                                usuarios={usuarios}
                                onReload={() => reload?.()}
                                escritorioId={escritorio.id}
                            />

                            <ProcessoDocumentosCard
                                documentos={documentos}
                                processoId={processo.id}
                                clienteId={processo.cliente_id}
                                escritorioId={escritorio.id}
                                usuarioId={user?.id}
                                onUploaded={() => reload?.()}
                            />

                            <ProcessoAcoesCard
                                isArquivado={processo.status === "ARQUIVADO"}
                                onArquivarProcesso={handleArquivarProcesso}
                                onAtivarProcesso={handleAtivarProcesso}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {processo && (
                <ProcessoModal
                    open={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    clientes={clientes}
                    usuarios={usuarios}
                    userId={user?.id}
                    processoEmEdicao={processo as any}
                    onSubmit={handleSaveEdit}
                />
            )}
        </div>
    );
};