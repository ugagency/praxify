// src/views/clientes/hooks/useClientesData.ts
import { useCallback, useEffect, useState } from "react";

import { showAlert, showConfirm } from "../../../utils/alert";
import type { Cliente, SaveClienteInput } from "../types/clientes.types";

import { createCliente, deleteClienteById, hasProcessosVinculados, listClientes, updateCliente } from "../api/clientes.api";

const onlyDigits = (v: string) => (v || "").replace(/\D/g, "");
const nullIfEmpty = (v: string) => (v && v.trim() ? v.trim() : null);

export function useClientesData({ escritorioId }: { escritorioId: number | null }) {
    const [items, setItems] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const refresh = useCallback(async () => {
        if (!escritorioId) {
            setItems([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await listClientes(escritorioId);
            setItems(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [escritorioId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const saveCliente = useCallback(
        async (input: SaveClienteInput): Promise<{ ok: boolean; id: number | null }> => {
            try {
                if (!escritorioId) {
                    showAlert("Atenção", "Selecione um escritório antes de cadastrar clientes.", "warning");
                    return { ok: false, id: null };
                }

                if (!input.nome?.trim()) {
                    showAlert("Atenção", "Informe o nome do cliente.", "warning");
                    return { ok: false, id: null };
                }

                setSaving(true);

                const payload = {
                    escritorio_id: escritorioId,
                    nome: input.nome.trim(),
                    cpf_cnpj: input.cpf_cnpj ? onlyDigits(input.cpf_cnpj) : null,

                    celular: nullIfEmpty(input.celular),
                    contato_fixo: nullIfEmpty(input.contato_fixo),
                    contato_comercial: nullIfEmpty(input.contato_comercial),
                    email: nullIfEmpty(input.email),

                    cep: input.cep ? onlyDigits(input.cep) : null,
                    endereco: nullIfEmpty(input.endereco),
                    bairro: nullIfEmpty(input.bairro),
                    cidade: nullIfEmpty(input.cidade),
                    estado: nullIfEmpty(input.estado),
                    numero: nullIfEmpty(input.numero),
                    complemento: nullIfEmpty(input.complemento),
                    email_gov: nullIfEmpty(input.email_gov),
                    senha_gov: nullIfEmpty(input.senha_gov),
                    observacao: nullIfEmpty(input.observacao),
                };

                let id: number;

                if (input.id) {
                    id = await updateCliente(input.id, payload);
                } else {
                    id = await createCliente(payload);
                }

                await showAlert("Sucesso", "Cliente salvo com sucesso!", "success");
                return { ok: true, id };
            } catch (err: unknown) {
                showAlert("Erro", (err as Error).message || "Erro ao salvar cliente", "error");
                return { ok: false, id: null };
            } finally {
                setSaving(false);
            }
        },
        [escritorioId]
    );

    const deleteCliente = useCallback(
        async (id: number, nome: string) => {
            const res = await showConfirm("Excluir?", `Deseja realmente deletar o cliente "${nome}"?`, "Sim, excluir");
            if (!res.isConfirmed) return;

            try {
                const vinculado = await hasProcessosVinculados(id);
                if (vinculado) {
                    showAlert("Atenção", "Não é possível deletar cliente com processos vinculados", "warning");
                    return;
                }

                await deleteClienteById(id);
                await refresh();
            } catch (e: unknown) {
                showAlert("Erro", (e as Error).message || "Erro ao deletar", "error");
            }
        },
        [refresh]
    );

    return { items, loading, saving, refresh, saveCliente, deleteCliente };
}