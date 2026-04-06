import { useCallback, useEffect, useState } from "react";
import type { Cliente, Processo, Usuario } from "../types/processos.types";
import { fetchClientes, fetchProcessos, fetchUsuarios } from "../api/processos.api";
import { showAlert } from "../../../../utils/alert";

type Result = {
    processos: Processo[];
    clientes: Cliente[];
    usuarios: Usuario[];
    loading: boolean;
    reload: () => Promise<void>;
};

export function useProcessosData(escritorioId?: string | number): Result {
    const [processos, setProcessos] = useState<Processo[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const reload = useCallback(async () => {
        if (!escritorioId) {
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            const [procRes, cliRes, usuRes] = await Promise.all([
                fetchProcessos(String(escritorioId)),
                fetchClientes(escritorioId),
                fetchUsuarios(String(escritorioId)),
            ]);

            // Supabase-js padrão: { data, error }
            if (procRes?.error) throw procRes.error;
            if (cliRes?.error) throw cliRes.error;
            if (usuRes?.error) throw usuRes.error;

            setProcessos(procRes.data || []);
            setClientes((cliRes.data || []) as Cliente[]);
            setUsuarios(usuRes.data || []);
        } catch (e: unknown) {
            console.error("[useProcessosData] erro ao carregar:", e);
            setProcessos([]);
            setClientes([]);
            setUsuarios([]);

            showAlert(
                "Erro",
                (e as any)?.message || "Falha ao carregar dados de processos/clientes. Verifique o console/network.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [escritorioId]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { processos, clientes, usuarios, loading, reload };
}