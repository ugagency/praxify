export interface Cliente {
    id: number;
    nome: string;
    cpf_cnpj: string | null;

    // Contatos (opcionais)
    celular?: string | null;
    contato_fixo?: string | null;
    contato_comercial?: string | null;
    email?: string | null;

    // Endereço (opcionais)
    cep?: string | null;
    endereco?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    numero?: string | null;
    complemento?: string | null;
    email_gov?: string | null;
    senha_gov?: string | null;
    observacao?: string | null;

    criado_em: string;
}

export type ClienteFormState = {
    // Dados pessoais
    nome: string;
    cpf_cnpj: string;

    // Contatos
    celular: string;
    contato_fixo: string;
    contato_comercial: string;
    email: string;

    // Endereço
    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    numero: string;
    complemento: string;
    email_gov: string;
    senha_gov: string;
    observacao: string;
};

export type SaveClienteInput = {
    id: number | null;

    nome: string;
    cpf_cnpj: string;

    celular: string;
    contato_fixo: string;
    contato_comercial: string;
    email: string;

    cep: string;
    endereco: string;
    bairro: string;
    cidade: string;
    estado: string;
    numero: string;
    complemento: string;
    email_gov: string;
    senha_gov: string;
    observacao: string;
};