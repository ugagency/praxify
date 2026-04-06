// src/views/clientes/Clientes.tsx
import React, { useMemo } from "react";

import { useAppStore } from "../../core/store";

import type { Cliente } from "./types/clientes.types";
import { useClientesData } from "./hooks/useClientesData";
import { useClientesState } from "./hooks/useClientesState";
import { normalizarDoc } from "./utils/clientes.formatters";

import { ClientesHeader } from "./components/ClientesHeader";
import { ClientesTable } from "./components/ClientesTable";
import { ClientesPagination } from "./components/ClientesPagination";
import { ClienteModal } from "./components/ClienteModal";

export const Clientes: React.FC = () => {
    const { escritorio, user } = useAppStore() as any; // ajuste se seu store tiver tipagem

    const escritorioId = escritorio?.id ?? null;
    const userId = user?.id ?? null;

    const { items, loading, saving, refresh, saveCliente, deleteCliente } = useClientesData({
        escritorioId,
    });

    const { busca, setBusca, page, setPage, pageSize, modal, form, setForm, openModal, closeModal } = useClientesState();

    const clientesFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return items;

        const termoDoc = termo.replace(/\D/g, "");
        return items.filter((c: Cliente) => {
            const nm = (c.nome || "").toLowerCase();
            const doc = normalizarDoc(c.cpf_cnpj);
            return nm.includes(termo) || (!!termoDoc && doc.includes(termoDoc));
        });
    }, [items, busca]);

    const pages = useMemo(() => Math.max(1, Math.ceil(clientesFiltrados.length / pageSize)), [clientesFiltrados.length, pageSize]);

    const clientesPaginados = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return clientesFiltrados.slice(start, end);
    }, [clientesFiltrados, page, pageSize]);

    const onSavedModal = async (id: number) => {
        await refresh();
        // Se estava criando (modal.cliente === null), transita para modo edição
        // para que outras abas (Documentos, Petição) tenham acesso ao clienteId
        if (!modal.cliente) {
            const savedCliente = {
                id,
                nome: form.nome,
                cpf_cnpj: form.cpf_cnpj || null,
                celular: form.celular || null,
                contato_fixo: form.contato_fixo || null,
                contato_comercial: form.contato_comercial || null,
                email: form.email || null,
                cep: form.cep || null,
                endereco: form.endereco || null,
                bairro: form.bairro || null,
                cidade: form.cidade || null,
                estado: form.estado || null,
                numero: form.numero || null,
                complemento: form.complemento || null,
                email_gov: form.email_gov || null,
                senha_gov: form.senha_gov || null,
                observacao: form.observacao || null,
                criado_em: new Date().toISOString(),
            };
            openModal(savedCliente);
        }
    };

    const onSubmitModal = async () => {
        const result = await saveCliente({
            id: modal.cliente?.id ?? null,

            nome: form.nome,
            cpf_cnpj: form.cpf_cnpj,

            celular: form.celular,
            contato_fixo: form.contato_fixo,
            contato_comercial: form.contato_comercial,
            email: form.email,

            cep: form.cep,
            endereco: form.endereco,
            bairro: form.bairro,
            cidade: form.cidade,
            estado: form.estado,
            numero: form.numero,
            complemento: form.complemento,
            email_gov: form.email_gov,
            senha_gov: form.senha_gov,
            observacao: form.observacao,
        });

        if (result.ok) {
            await refresh();
        }

        return result;
    };

    return (
        <div className="animation-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="card">
                <ClientesHeader
                    loading={loading}
                    total={items.length}
                    filteredTotal={clientesFiltrados.length}
                    busca={busca}
                    onBuscaChange={(v) => setBusca(v)}
                    onNovo={() => openModal(null)}
                />

                <div
                    style={{
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.9rem",
                        overflow: "hidden",
                        background: "rgba(17,24,39,0.35)",
                    }}
                >
                    <ClientesTable loading={loading} items={clientesPaginados} onEditar={(c) => openModal(c)} onExcluir={(id, nome) => deleteCliente(id, nome)} />

                    <ClientesPagination page={page} pages={pages} onChange={setPage} />
                </div>
            </div>

            <ClienteModal
                open={modal.open}
                editing={!!modal.cliente}
                saving={saving}
                form={form}
                clientes={items}
                escritorioId={escritorioId}
                clienteId={modal.cliente?.id ?? null}
                userId={userId}
                onChange={(next) => setForm(next)}
                onClose={closeModal}
                onSaved={onSavedModal}
                onSubmit={onSubmitModal}
            />
        </div>
    );
};