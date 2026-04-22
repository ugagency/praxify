export type ProcessoStatus =
    | "TODOS"
    | "ATIVO"
    | "ARQUIVADO"
    | "PRE_PROCESSUAL"
    | "SUSPENSO"
    | string;

export interface Processo {
    id: number;
    numero_autos?: string;
    cliente_id: number;
    tribunal?: string;
    status: string;
    criado_em: string;
    cliente?: { nome: string };
    responsavel_id?: string;
}

export interface Cliente {
    id: number;
    nome: string;
}

export interface Usuario {
    id: string;
    nome: string;
}

export interface ProcessoFormState {
    numero_autos: string;
    cliente_id: string;
    tribunal: string;
    status: string;
    responsavel_id: string;
}

export interface AcolhimentoFormState {
    modoNovoLead: boolean;
    novo_nome: string;
    cliente_id: string;
    relato: string;
}