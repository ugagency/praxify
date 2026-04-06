import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCompromissos, getPrazos, getProcessos, getUsuarios } from '../../../services/supabase';
import { showAlert } from '../../../utils/alert';
import { toLocalDate } from '../utils/date';
import { Availability, CalendarEvent, Prazo } from '../types/dashboard.types';

export function useDashboardData() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [processosList, setProcessosList] = useState<any[]>([]);
    const [usuariosList, setUsuariosList] = useState<any[]>([]);

    const fetchUsuarios = useCallback(async () => {
        try {
            const { data } = await getUsuarios();
            if (data) setUsuariosList(data);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchProcessos = useCallback(async () => {
        try {
            const { data } = await getProcessos();
            if (data) setProcessosList(data);
        } catch (e) {
            console.error(e);
        }
    }, []);

    const fetchPrazos = useCallback(async () => {
        try {
            setLoading(true);
            const [{ data: prazosData, error: prazosError }, { data: compromissosData, error: compromissosError }] =
                await Promise.all([getPrazos<Prazo>(), getCompromissos<Prazo>()]);

            if (prazosError) throw prazosError;
            if (compromissosError) throw compromissosError;

            const combined = [...(prazosData ?? []), ...(compromissosData ?? [])];

            const mapped: CalendarEvent[] = combined
                .filter((p) => !!p.data_final || !!p.data_fatal)
                .map((p) => {
                    const targetDateStr = p.data_final || p.data_fatal;
                    const start = toLocalDate(targetDateStr as string);
                    return {
                        id: p.id,
                        title: p.tarefa,
                        start,
                        end: start,
                        allDay: true,
                        resource: p,
                    };
                });

            setEvents(mapped);
        } catch (error) {
            console.error(error);
            showAlert('Erro', 'Falha ao carregar prazos e agenda. Tente novamente mais tarde.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrazos();
        fetchProcessos();
        fetchUsuarios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const availability: Availability = useMemo(() => {
        const map = new Map<number, Set<number>>();
        for (const e of events) {
            const y = e.start.getFullYear();
            const m = e.start.getMonth();
            if (!map.has(y)) map.set(y, new Set<number>());
            map.get(y)!.add(m);
        }

        const years = Array.from(map.keys()).sort((a, b) => a - b);
        const monthsByYear: Record<number, number[]> = {};

        for (const y of years) {
            monthsByYear[y] = Array.from(map.get(y)!.values()).sort((a, b) => a - b);
        }

        return { years, monthsByYear };
    }, [events]);

    return {
        loading,
        events,
        setEvents,
        processosList,
        usuariosList,
        fetchPrazos,
        availability,
    };
}