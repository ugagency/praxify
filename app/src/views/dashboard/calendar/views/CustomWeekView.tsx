// React is globally injected
import { format } from 'date-fns/format';
import { startOfWeek } from 'date-fns/startOfWeek';
import { addDays } from 'date-fns/addDays';
import { subWeeks } from 'date-fns/subWeeks';
import { addWeeks } from 'date-fns/addWeeks';
import { ptBR } from 'date-fns/locale';

export const CustomWeekView = ({ date, events, onSelectEvent, processosList = [] }: any) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

    return (
        <div style={{ position: 'relative', height: '100%', width: '100%', minHeight: '350px' }}>
            <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowX: 'auto', gap: '8px', padding: '8px 0' }}>
                {days.map((day) => {
                    const dayEvents = events.filter((e: any) => e.start.toDateString() === day.toDateString());
                    const isToday = day.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={day.toString()}
                            style={{
                                flex: 1,
                                minWidth: '140px',
                                background: isToday ? 'var(--primary-dim)' : 'transparent',
                                borderRadius: '12px',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                border: isToday ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                height: '100%',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ textAlign: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, color: isToday ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize', fontSize: '0.9rem', flexShrink: 0 }}>
                                {format(day, 'EEEE, dd', { locale: ptBR })}
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                                {dayEvents.map((e: any) => (
                                    <div
                                        key={e.id}
                                        onClick={() => onSelectEvent(e)}
                                        style={{
                                            background: 'var(--bg-panel)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-main)',
                                            cursor: 'pointer',
                                            border: `1px solid ${e.resource.status === 'FEITO' ? 'var(--success)' : 'var(--primary)'}`,
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                        }}
                                        onMouseOver={(ev) => (ev.currentTarget.style.transform = 'translateY(-2px)')}
                                        onMouseOut={(ev) => (ev.currentTarget.style.transform = 'translateY(0)')}
                                    >
                                        <div style={{ fontWeight: 600, marginBottom: '2px', lineHeight: '1.2' }}>{e.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                            {(() => {
                                                const matchProc = processosList?.find((proc: any) => (proc.numero || proc.id) == e.resource.processo);
                                                return matchProc ? (matchProc.numero_autos || matchProc.numero || matchProc.id) : (e.resource.processo || 'Sem Processo');
                                            })()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{e.resource.responsavel || 'Geral'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

CustomWeekView.title = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    const end = addDays(start, 6);
    return `${format(start, 'dd MMM', { locale: ptBR })} - ${format(end, 'dd MMM yyyy', { locale: ptBR })}`;
};

CustomWeekView.navigate = (date: Date, action: string) => {
    switch (action) {
        case 'PREV': return subWeeks(date, 1);
        case 'NEXT': return addWeeks(date, 1);
        default: return date;
    }
};