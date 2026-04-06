import { useCallback, useEffect, useState } from "react";
import { fetchAllDetalhe } from "../api/processoDetalhe.api";
import type { ProcessoDetalheData } from "../types/processoDetalhe.types";

export function useProcessoDetalheData(id?: string) {
    const [data, setData] = useState<ProcessoDetalheData>({
        processo: null,
        timeline: [],
        prazos: [],
        documentos: [],
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const reload = useCallback(async () => {
        // ✅ Se não tem ID, não pode carregar — e NÃO pode ficar loading infinito
        if (!id) {
            setLoading(false);
            setErrorMsg("ID do processo não encontrado na rota.");
            setData({ processo: null, timeline: [], prazos: [], documentos: [] });
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const result = await fetchAllDetalhe({ id });
            setData(result);
        } catch (e: unknown) {
            setErrorMsg((e as Error)?.message || "Erro ao carregar detalhes.");
            setData({ processo: null, timeline: [], prazos: [], documentos: [] });
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { ...data, loading, errorMsg, reload };
}