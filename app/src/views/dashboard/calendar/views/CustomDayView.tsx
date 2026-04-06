// React is globally injected
import { format } from 'date-fns/format';
import { addDays } from 'date-fns/addDays';
import { subDays } from 'date-fns/subDays';
import { ptBR } from 'date-fns/locale';

export const CustomDayView = ({ date, events, onSelectEvent, processosList = [] }: any) => {
    const dayEvents = events.filter((e: any) => e.start.toDateString() === date.toDateString());

    return (
        <div style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', overflowY: 'auto', height: '100%', minHeight: '350px', alignContent: 'flex-start' }}>
            {dayEvents.length === 0 && (
                <div style={{ color: 'var(--text-muted)', width: '100%', textAlign: 'center', padding: '3rem', background: 'var(--bg-darker)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    Nenhum compromisso agendado para este dia. Aproveite a folga! 🎉
                </div>
            )}

            {dayEvents.map((e: any) => (
                <div
                    key={e.id}
                    onClick={() => onSelectEvent(e)}
                    style={{
                        flex: '1 1 300px',
                        maxWidth: '400px',
                        background: 'var(--bg-panel)',
                        padding: '1.25rem',
                        borderRadius: '16px',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        border: `1px solid ${e.resource.status === 'FEITO' ? 'var(--success)' : 'var(--primary)'}`,
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}
                    onMouseOver={(ev) => (ev.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseOut={(ev) => (ev.currentTarget.style.transform = 'translateY(0)')}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: e.resource.status === 'FEITO' ? 'var(--success)' : 'var(--primary)', lineHeight: 1.3, flex: 1, paddingRight: '8px' }}>
                            {e.resource.tarefa}
                        </div>
                        <span style={{ fontSize: '0.65rem', padding: '4px 8px', borderRadius: '12px', background: 'var(--bg-darker)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>
                            {e.resource.status}
                        </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>Processo:</strong>{' '}
                        {(() => {
                            const matchProc = processosList.find((proc: any) => (proc.numero || proc.id) == e.resource.processo);
                            return matchProc ? (matchProc.numero_autos || matchProc.numero || matchProc.id) : (e.resource.processo || 'N/A');
                        })()}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <strong style={{ color: 'var(--text-muted)' }}>Responsável:</strong> {e.resource.responsavel || 'Geral'}
                    </div>
                </div>
            ))}
        </div>
    );
};

CustomDayView.title = (date: Date) => {
    const dayName = format(date, 'EEEE', { locale: ptBR });
    const monthName = format(date, 'MMMM', { locale: ptBR });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    return `${capitalizedDay}, ${format(date, 'dd')} de ${capitalizedMonth}`;
};

CustomDayView.navigate = (date: Date, action: string) => {
    switch (action) {
        case 'PREV': return subDays(date, 1);
        case 'NEXT': return addDays(date, 1);
        default: return date;
    }
};