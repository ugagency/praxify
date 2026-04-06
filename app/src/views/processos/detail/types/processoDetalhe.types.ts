export interface ProcessoCliente {
    id: number;
    nome: string;
    cpf_cnpj?: string | null;

    celular?: string | null;
    contato_fixo?: string | null;
    contato_comercial?: string | null;
    email?: string | null;

    cep?: string | null;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    numero?: string | null;
    complemento?: string | null;

    criado_em?: string | null;
}

export interface ProcessoDetalhe {
    id: number;
    numero_autos?: string | null;
    cliente_id: number;
    tribunal?: string | null;
    status: string;
    criado_em: string;
    cliente?: ProcessoCliente | null;
    responsavel?: { id: string; nome: string } | null;
    responsavel_id?: string | null;
    [key: string]: unknown;
}

export interface TimelineEvento {
    id: number | string;
    criado_em: string;
    tipo?: string | null;
    titulo?: string | null;
    resumo_ia?: string | null;
    transcricao?: string | null;
    [key: string]: unknown;
}

export interface PrazoItem {
    id: number | string;
    tarefa?: string | null;
    data_fatal?: string | null;
    status?: string | null;
    [key: string]: unknown;
}

export interface DocumentoItem {
    id?: string | number;
    titulo?: string;
    criado_em: string;
    origem: "GERADO" | "UPLOAD";
    icon: string;
    [key: string]: unknown;
}

export type ProcessoDetalheData = {
    processo: ProcessoDetalhe | null;
    timeline: TimelineEvento[];
    prazos: PrazoItem[];
    documentos: DocumentoItem[];
};