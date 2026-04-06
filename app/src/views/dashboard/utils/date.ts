import { format } from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

// ✅ Parse seguro para DATE ou TIMESTAMP em horário local (evita "virada de dia" por UTC)
export function toLocalDate(dateStr: string) {
    if (!dateStr) return new Date(NaN);
    
    // Se vier com T (ISO ou datetime-local), pegamos apenas a parte da data
    const onlyDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const [y, m, d] = onlyDate.split('-').map(Number);
    
    // Retorna meia-noite do dia local informado
    return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
}

export function getMonthNamePtBR(monthIndex: number) {
    const dt = new Date(2000, monthIndex, 1);
    const name = format(dt, 'MMMM', { locale: ptBR });
    return name.charAt(0).toUpperCase() + name.slice(1);
}