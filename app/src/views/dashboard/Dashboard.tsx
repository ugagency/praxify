import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { View, Views } from 'react-big-calendar';

import 'react-big-calendar/lib/css/react-big-calendar.css';

import { openPrazoDetailsModal } from '../../components/modals/prazoDetailsModal';
import { openPrazoEditModal } from '../../components/modals/prazoEditModal';
import { insert, update } from '../../services/supabase';
import { showAlert } from '../../utils/alert';

import { useDashboardData } from './hooks/useDashboardData';
import { CalendarEvent, Prazo } from './types/dashboard.types';

import { HeaderControls } from './components/HeaderControls';
import { CalendarSection } from './components/CalendarSection';
import { UrgenciasCard } from './components/UrgenciasCard';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    const { loading, events, processosList, usuariosList, fetchPrazos, availability } = useDashboardData();

    const [searchQuery, setSearchQuery] = useState('');
    const [currentView, setCurrentView] = useState<View>(Views.MONTH);
    const [currentDate, setCurrentDate] = useState(new Date());

    // ✅ Se ao carregar eventos o currentDate cair num mês/ano sem eventos, ajusta para o mais recente disponível
    useEffect(() => {
        if (availability.years.length === 0) return;

        const y = currentDate.getFullYear();
        const m = currentDate.getMonth();

        const hasYear = availability.years.includes(y);
        const monthsForYear = availability.monthsByYear[y] || [];
        const hasMonth = monthsForYear.includes(m);

        if (hasYear && hasMonth) return;

        const lastYear = availability.years[availability.years.length - 1];
        const lastMonths = availability.monthsByYear[lastYear] || [];
        const lastMonth = lastMonths.length ? lastMonths[lastMonths.length - 1] : 0;

        const newDate = new Date(currentDate);
        newDate.setFullYear(lastYear);
        newDate.setMonth(lastMonth);
        newDate.setDate(1);
        setCurrentDate(newDate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availability.years.length]);

    const filteredEvents = useMemo(() => {
        if (!searchQuery) return events;

        const q = searchQuery.toLowerCase();
        return events.filter((e) =>
            e.title.toLowerCase().includes(q) ||
            (e.resource.processo ?? '').toLowerCase().includes(q) ||
            (e.resource.responsavel ?? '').toLowerCase().includes(q)
        );
    }, [events, searchQuery]);

    const abrirModalEdicao = async (prazo: Prazo | null = null) => {
        await openPrazoEditModal({
            prazo,
            processosList,
            usuariosList,
            onSubmit: async (values: any) => {
                try {
                    if (!prazo) {
                        const { error } = await insert('Jur_Prazos', values);
                        if (error) throw error;
                        showAlert('Sucesso', 'Compromisso agendado!', 'success');
                    } else if (prazo?.id) {
                        const { error } = await update('Jur_Prazos', prazo.id, values);
                        if (error) throw error;
                        showAlert('Sucesso', 'Compromisso atualizado!', 'success');
                    }
                    await fetchPrazos();
                    return { error: null };
                } catch (err) {
                    console.error(err);
                    showAlert('Erro', 'Não foi possível salvar o compromisso. Verifique os dados e tente novamente.', 'error');
                    return { error: err };
                }
            },
        });
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        const p = event.resource;

        openPrazoDetailsModal({
            prazo: p,
            processosList,
            onEdit: () => abrirModalEdicao(p),
            onOpenProcess: (procId: any) => navigate(`/processo/${procId}`),
        });
    };

    return (
        <div
            className="animation-fade-in"
            style={{
                minHeight: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                paddingBottom: '2rem',
            }}
        >
            <HeaderControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                availability={availability}
                onNew={() => abrirModalEdicao(null)}
            />

            <CalendarSection
                loading={loading}
                searchQuery={searchQuery}
                filteredEvents={filteredEvents}
                currentView={currentView}
                setCurrentView={setCurrentView}
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                processosList={processosList}
                onSelectEvent={handleSelectEvent}
                onRefresh={fetchPrazos}
            />

            <UrgenciasCard
                events={events}
                processosList={processosList}
                onSelect={handleSelectEvent}
                onRefresh={fetchPrazos}
            />
        </div>
    );
};