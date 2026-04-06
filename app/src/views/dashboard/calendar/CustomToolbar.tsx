import React, { useState } from 'react';
import { format } from 'date-fns/format';
import { ptBR } from 'date-fns/locale';
import { CustomWeekView } from './views/CustomWeekView';
import { CustomDayView } from './views/CustomDayView';

type Props = {
    onRefresh?: () => Promise<void>;
};

export const CustomToolbar = (toolbar: any & Props) => {
    const [refreshing, setRefreshing] = useState(false);

    const goToBack = () => toolbar.onNavigate('PREV');
    const goToNext = () => toolbar.onNavigate('NEXT');
    const goToCurrent = () => toolbar.onNavigate('TODAY');

    const handleRefresh = async () => {
        if (!toolbar.onRefresh || refreshing) return;

        try {
            setRefreshing(true);
            await toolbar.onRefresh();
        } finally {
            setRefreshing(false);
        }
    };

    const label = () => {
        if (toolbar.view === 'month')
            return format(toolbar.date, 'MMMM yyyy', { locale: ptBR });

        if (toolbar.view === 'week')
            return CustomWeekView.title(toolbar.date);

        if (toolbar.view === 'day')
            return CustomDayView.title(toolbar.date);

        return toolbar.label;
    };

    const navButtonStyle: React.CSSProperties = {
        background: 'var(--bg-darker)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 0',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '10px',
                flexWrap: 'wrap',
                gap: '10px',
            }}
        >
            {/* 🔵 ESQUERDA — Navegação + Atualizar */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button onClick={goToCurrent} style={navButtonStyle}>
                    Hoje
                </button>

                <button onClick={goToBack} style={navButtonStyle}>
                    {'<'}
                </button>

                <button onClick={goToNext} style={navButtonStyle}>
                    {'>'}
                </button>

                {/* ✅ BOTÃO ATUALIZAR AGORA NA POSIÇÃO CORRETA */}
                {!!toolbar.onRefresh && (
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        style={{
                            ...navButtonStyle,
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
                            opacity: refreshing ? 0.7 : 1,
                            cursor: refreshing ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {refreshing ? 'Atualizando...' : 'Atualizar'}
                    </button>
                )}
            </div>

            {/* 🔵 CENTRO — Label */}
            <div
                style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    textTransform: 'capitalize',
                }}
            >
                {label()}
            </div>

            {/* 🔵 DIREITA — Views */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {toolbar.views.map((view: string) => {
                    const isActive = toolbar.view === view;

                    return (
                        <button
                            key={view}
                            onClick={() => toolbar.onView(view)}
                            style={{
                                background: isActive
                                    ? 'var(--primary-dim)'
                                    : 'var(--bg-darker)',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}
                        >
                            {toolbar.localizer.messages[view] || view}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};