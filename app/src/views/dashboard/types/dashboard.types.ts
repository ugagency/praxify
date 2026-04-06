export interface Prazo {
    id?: number;
    status: string;
    data_fatal: string; // YYYY-MM-DD
    tarefa: string;
    processo: string | null;
    responsavel: string;
    usuario_id?: string | null; // uuid no banco
    descricao?: string;
    data_final?: string | null; // YYYY-MM-DD
}

export interface CalendarEvent {
    id?: number;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: Prazo;
}

export type ProcessosItem = any;
export type UsuariosItem = any;

export interface Availability {
    years: number[];
    monthsByYear: Record<number, number[]>;
}