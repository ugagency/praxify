import React from 'react';
import { Availability } from '../types/dashboard.types';
import { getMonthNamePtBR } from '../utils/date';

type Props = {
    searchQuery: string;
    onSearchChange: (v: string) => void;

    currentDate: Date;
    setCurrentDate: (d: Date) => void;

    availability: Availability;

    onNew: () => void;
};

export const HeaderControls: React.FC<Props> = ({
    searchQuery,
    onSearchChange,
    currentDate,
    setCurrentDate,
    availability,
    onNew,
}) => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const anosValidos = availability.years.length > 0 ? availability.years : [currentYear];

    const mesesValidos = (() => {
        const months = availability.monthsByYear[currentYear];
        if (months && months.length > 0) return months;
        if (availability.years.length === 0) return [currentMonth];
        const firstYear = availability.years[0];
        return availability.monthsByYear[firstYear] || [currentMonth];
    })();

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value);
        const monthsForYear = availability.monthsByYear[newYear] || [];

        const newDate = new Date(currentDate);
        newDate.setFullYear(newYear);

        if (monthsForYear.length > 0 && !monthsForYear.includes(newDate.getMonth())) {
            newDate.setMonth(monthsForYear[0]);
        }

        newDate.setDate(1);
        setCurrentDate(newDate);
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        const newDate = new Date(currentDate);
        newDate.setMonth(newMonth);
        newDate.setDate(1);
        setCurrentDate(newDate);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Pesquisar compromissos..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(0,0,0,0.2)',
                        color: 'var(--text-main)',
                        width: '100%',
                        maxWidth: '300px',
                    }}
                />

                {/* ✅ Ano: somente anos com eventos */}
                <select
                    value={currentYear}
                    onChange={handleYearChange}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                    }}
                >
                    {anosValidos.map((ano) => (
                        <option key={ano} value={ano}>{ano}</option>
                    ))}
                </select>

                {/* ✅ Mês: somente meses do ano selecionado com eventos */}
                <select
                    value={currentMonth}
                    onChange={handleMonthChange}
                    style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'var(--bg-panel)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                    }}
                >
                    {mesesValidos.map((monthIndex) => (
                        <option key={monthIndex} value={monthIndex}>
                            {getMonthNamePtBR(monthIndex)}
                        </option>
                    ))}
                </select>

                {availability.years.length > 0 && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Exibindo apenas meses com eventos
                    </div>
                )}
            </div>

            <div style={{ flexShrink: 0 }}>
                <button
                    onClick={onNew}
                    style={{
                        padding: "0.58rem 0.95rem",
                        borderRadius: 12,
                        border: "1px solid rgba(148,163,184,0.20)",
                        background: "var(--bg-surface)",
                        color: "var(--text-main)",
                        cursor: "pointer",
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                    }}
                >
                    + Novo Compromisso
                </button>
            </div>
        </div>
    );
};