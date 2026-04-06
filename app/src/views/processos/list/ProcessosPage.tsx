import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppStore } from "../../../core/store";
import { showAlert, showConfirm } from "../../../utils/alert";

import type { AcolhimentoFormState, Processo, ProcessoFormState } from "./types/processos.types";

import { useProcessosData } from "./hooks/useProcessosData";
import { useProcessosFilters } from "./hooks/useProcessosFilters";

import { ProcessosHeader } from "./components/ProcessosHeader";
import { ProcessosFilters } from "./components/ProcessosFilters";
import { ProcessosTable } from "./components/ProcessosTable";

import { ProcessoModal } from "./modals/ProcessoModal";
import { AcolhimentoModal } from "./modals/AcolhimentoModal";

import {
    criarLeadEProcessoPreProcessual,
    deleteProcesso,
    updateProcessoStatus,
    upsertProcesso,
} from "./api/processos.api";

export const ProcessosPage: React.FC = () => {
    const { escritorio, user } = useAppStore();
    const navigate = useNavigate();

    // Data
    const { processos, clientes, usuarios, loading, reload } = useProcessosData(escritorio?.id);

    // Filters
    const [filtroTexto, setFiltroTexto] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("TODOS");
    // Modals
    const [isProcessoModalOpen, setProcessoModalOpen] = useState(false);
    const [isAcolhimentoModalOpen, setAcolhimentoModalOpen] = useState(false);


    // Filter Dates
    const [filtroDataInicio, setFiltroDataInicio] = useState("");
    const [filtroDataFim, setFiltroDataFim] = useState("");

    const processosMostrados = useProcessosFilters({ processos, filtroTexto, filtroStatus, filtroDataInicio, filtroDataFim });

    const total = processos.length;
    const shown = processosMostrados.length;

    const openNovoProcesso = () => {
        setProcessoModalOpen(true);
    };



    const onSubmitProcesso = async (form: ProcessoFormState) => {
        if (!escritorio) return;

        const payload = {
            cliente_id: parseInt(form.cliente_id, 10),
            numero_autos: form.numero_autos || null,
            tribunal: form.tribunal || null,
            status: form.status,
            responsavel_id: form.responsavel_id || user?.id,
        };

        try {
            await upsertProcesso({
                escritorioId: escritorio.id,
                payload,
            });

            setProcessoModalOpen(false);
            await reload();
            showAlert("Sucesso", "Processo salvo com sucesso!", "success");
        } catch (e: unknown) {
            showAlert("Erro", (e as Error).message || "Erro ao salvar", "error");
        }
    };

    const onSubmitAcolhimento = async (form: AcolhimentoFormState) => {
        if (!escritorio) return;

        try {
            await criarLeadEProcessoPreProcessual({
                escritorioId: escritorio.id,
                userId: user?.id ?? null,
                modoNovoLead: form.modoNovoLead,
                novoNome: form.novo_nome,
                clienteId: form.cliente_id,
                relato: form.relato,
            });

            setAcolhimentoModalOpen(false);
            await reload();
            showAlert("Sucesso", "Atendimento iniciado com sucesso!", "success");
        } catch (e: unknown) {
            showAlert("Erro", (e as Error).message || "Erro no acolhimento", "error");
        }
    };

    const onExcluir = async (id: number) => {
        const result = await showConfirm("Deseja realmente deletar?", "Esta ação não poderá ser desfeita.", "Sim, excluir", "Cancelar");
        if (!result.isConfirmed) return;

        try {
            await deleteProcesso(id);

            await reload();
            showAlert("Sucesso", "Processo removido.", "success");
        } catch (e: unknown) {
            showAlert("Erro", (e as Error).message || "Erro ao excluir", "error");
        }
    };

    const onToggleStatus = async (p: Processo) => {
        const novoStatus = p.status === "ATIVO" ? "ARQUIVADO" : "ATIVO";

        try {
            await updateProcessoStatus(p.id, novoStatus);

            await reload();
        } catch (e: unknown) {
            showAlert("Erro", (e as Error).message || "Erro ao alterar status", "error");
        }
    };

    const onDetalhes = (id: number) => {
        navigate(`/processo/${id}`);
    };

    return (
        <div className="animation-fade-in">
            <div
                style={{
                    borderRadius: 18,
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-panel)",
                    padding: "1rem",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <ProcessosHeader
                        total={total}
                        shown={shown}
                        filtroTexto={filtroTexto}
                        onChangeFiltroTexto={setFiltroTexto}
                        onNovoProcesso={openNovoProcesso}
                    />

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <ProcessosFilters
                            filtroStatus={filtroStatus}
                            onChangeFiltroStatus={setFiltroStatus}
                            filtroDataInicio={filtroDataInicio}
                            onChangeFiltroDataInicio={setFiltroDataInicio}
                            filtroDataFim={filtroDataFim}
                            onChangeFiltroDataFim={setFiltroDataFim}
                        />
                    </div>

                    <ProcessosTable
                        loading={loading}
                        items={processosMostrados}
                        onDetalhes={onDetalhes}

                        onToggleStatus={onToggleStatus}
                        onExcluir={onExcluir}
                    />
                </div>
            </div>

            <ProcessoModal
                open={isProcessoModalOpen}
                onClose={() => setProcessoModalOpen(false)}
                clientes={clientes}
                usuarios={usuarios}
                userId={user?.id}
                processoEmEdicao={null}
                onSubmit={onSubmitProcesso}
            />

            <AcolhimentoModal
                open={isAcolhimentoModalOpen}
                onClose={() => setAcolhimentoModalOpen(false)}
                clientes={clientes}
                onSubmit={onSubmitAcolhimento}
            />
        </div>
    );
};