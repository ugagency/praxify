import React from 'react';
import { Calendar, View, Views } from 'react-big-calendar';

import { localizer } from '../calendar/localizer';
import { calendarCss, calendarContainerStyle } from '../calendar/styles';
import { CustomToolbar } from '../calendar/CustomToolbar';
import { CustomWeekView } from '../calendar/views/CustomWeekView';
import { CustomDayView } from '../calendar/views/CustomDayView';
import { CustomAgendaView } from '../calendar/views/CustomAgendaView';

import { CalendarEvent } from '../types/dashboard.types';
import { SearchResults } from './SearchResults';

type Props = {
    loading: boolean;
    searchQuery: string;
    filteredEvents: CalendarEvent[];

    currentView: View;
    setCurrentView: (v: View) => void;

    currentDate: Date;
    setCurrentDate: (d: Date) => void;

    processosList: any[];
    onSelectEvent: (e: CalendarEvent) => void;

    // ✅ NOVO
    onRefresh: () => Promise<void>;
};

export const CalendarSection: React.FC<Props> = ({
    loading,
    searchQuery,
    filteredEvents,
    currentView,
    setCurrentView,
    currentDate,
    setCurrentDate,
    processosList,
    onSelectEvent,
    onRefresh,
}) => {
    const eventsWithLabels = React.useMemo(() => {
        return filteredEvents.map(e => {
            const matchProc = processosList.find((proc: any) => (proc.numero || proc.id) == e.resource.processo);
            const label = matchProc ? (matchProc.numero_autos || matchProc.numero || matchProc.id) : e.resource.processo;
            return {
                ...e,
                resource: {
                    ...e.resource,
                    processoLabel: label
                }
            };
        });
    }, [filteredEvents, processosList]);
    return (
        <div className="card calendar-wrapper" style={calendarContainerStyle}>
            {/* Tema do calendário (mantido aqui para ficar isolado no dashboard) */}
            <style>{calendarCss}</style>

            {loading ? (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        borderRadius: '14px',
                        background: 'var(--bg-darker)',
                        border: '1px solid var(--border-color)',
                    }}
                >
                    <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Sincronizando agenda...</span>
                </div>
            ) : searchQuery ? (
                <div style={{ height: '100%', overflow: 'hidden' }}>
                    <SearchResults events={eventsWithLabels} processosList={processosList} onSelect={onSelectEvent} />
                </div>
            ) : (
                <div style={{ height: '100%', minHeight: 0 }}>
                    <Calendar
                        localizer={localizer}
                        events={eventsWithLabels}
                        style={{ height: '100%' }}
                        startAccessor="start"
                        endAccessor="end"
                        culture="pt-BR"
                        components={{
                            toolbar: (props) => (
                                <CustomToolbar
                                    {...props}
                                    onRefresh={onRefresh}
                                />
                            ),
                            event: (props: any) => {
                                const p = props.event.resource;
                                const procLabel = p.processoLabel;
                                return (
                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.tarefa} {procLabel ? `- Proc: ${procLabel}` : ''}
                                    </div>
                                );
                            }
                        }}
                        views={{
                            month: true,
                            week: CustomWeekView as any,
                            day: CustomDayView as any,
                            agenda: CustomAgendaView as any,
                        }}
                        defaultView={Views.MONTH}
                        view={currentView}
                        onView={(v) => setCurrentView(v)}
                        date={currentDate}
                        onNavigate={(date) => setCurrentDate(date)}
                        onSelectEvent={onSelectEvent}
                        onDrillDown={(date) => {
                            setCurrentDate(date);
                            setCurrentView(Views.DAY);
                        }}
                        popup={false}
                        messages={{
                            next: 'Próximo',
                            previous: 'Anterior',
                            today: 'Hoje',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia',
                            agenda: 'Agenda',
                            date: 'Data',
                            time: 'Hora',
                            event: 'Compromisso',
                            noEventsInRange: 'Nenhum compromisso neste período.',
                        }}
                        eventPropGetter={(event: any) => {
                            const isFeito = event.resource.status === 'FEITO';

                            const hojeStr = new Date().toISOString().split('T')[0];
                            const targetDateStr = event.resource.data_final || event.resource.data_fatal;
                            const isAtrasado =
                                !isFeito && new Date(targetDateStr as string) < new Date(hojeStr);

                            let className = '';
                            if (isFeito) className = 'done-event';
                            else if (isAtrasado) className = 'late-event';

                            return { className };
                        }}
                    />
                </div>
            )}
        </div>
    );
};