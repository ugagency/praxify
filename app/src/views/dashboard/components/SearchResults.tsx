import React from 'react';
import { CalendarEvent } from '../types/dashboard.types';
import { toLocalDate } from '../utils/date';

type Props = {
    events: CalendarEvent[];
    processosList: any[];
    onSelect: (event: CalendarEvent) => void;
};

export const SearchResults: React.FC<Props> = ({ events, processosList, onSelect }) => {
    return (
        <div style={{ overflowY: 'auto', height: '100%', padding: '1rem' }}>
            <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                Resultados da Busca ({events.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {events.map((e) => {
                    const isFeito = e.resource.status === 'FEITO';
                    const isAtrasado = !isFeito && new Date(e.resource.data_fatal) < new Date(new Date().toISOString().split('T')[0]);

                    let bg = 'rgba(0, 217, 255, 0.1)';
                    let color = '#00d9ff';

                    if (isFeito) { bg = 'rgba(16, 185, 129, 0.1)'; color = '#10b981'; }
                    else if (isAtrasado) { bg = 'rgba(239, 68, 68, 0.1)'; color = '#ef4444'; }

                    return (
                        <div
                            key={e.id}
                            onClick={() => onSelect(e)}
                            style={{
                                background: bg,
                                padding: '1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: `1px solid ${color}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(ev) => (ev.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(ev) => (ev.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div>
                                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.1rem' }}>
                                    {e.resource.tarefa}
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px' }}>
                                    <span style={{ color, fontWeight: 'bold' }}>
                                        {toLocalDate(e.resource.data_final || e.resource.data_fatal).toLocaleDateString('pt-BR')}
                                    </span>
                                    {' '}•{' '}
                                    <strong>Proc:</strong>{' '}
                                    {(() => {
                                        const matchProc = processosList.find((proc: any) => (proc.numero || proc.id) == e.resource.processo);
                                        return matchProc ? (matchProc.numero_autos || matchProc.numero || matchProc.id) : (e.resource.processo || 'N/A');
                                    })()}
                                    {' '}•{' '}
                                    <strong>Resp:</strong> {e.resource.responsavel || 'Geral'}
                                </div>
                            </div>

                            <div>
                                <span style={{ color, fontWeight: 'bold', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                                    {e.resource.status}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};