import { useMemo } from "react";
import type { Processo } from "../types/processos.types";

export function useProcessosFilters(params: {
    processos: Processo[];
    filtroTexto: string;
    filtroStatus: string;
    filtroDataInicio?: string;
    filtroDataFim?: string;
}) {
    const { processos, filtroTexto, filtroStatus, filtroDataInicio, filtroDataFim } = params;

    return useMemo(() => {
        const txt = (filtroTexto || "").toLowerCase();

        return processos.filter((p) => {
            const matchesText =
                (p.numero_autos || "").toLowerCase().includes(txt) ||
                (p.cliente?.nome || "").toLowerCase().includes(txt) ||
                (p.tribunal || "").toLowerCase().includes(txt);

            const matchesStatus = filtroStatus === "TODOS" || p.status === filtroStatus;

            let matchesData = true;
            if (filtroDataInicio && p.criado_em) {
                if (new Date(p.criado_em.split("T")[0]) < new Date(filtroDataInicio)) matchesData = false;
            }
            if (filtroDataFim && p.criado_em) {
                if (new Date(p.criado_em.split("T")[0]) > new Date(filtroDataFim)) matchesData = false;
            }

            return matchesText && matchesStatus && matchesData;
        });
    }, [processos, filtroTexto, filtroStatus, filtroDataInicio, filtroDataFim]);
}