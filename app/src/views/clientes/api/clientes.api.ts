// src/views/clientes/api/clientes.api.ts
import { getClient } from "../../../services/supabase";
import type { Cliente } from "../types/clientes.types";

export async function listClientes(escritorioId: number) {
    const client = getClient();
    const { data, error } = await client.from("Jur_Clientes").select("*").eq("escritorio_id", escritorioId).order("nome");
    if (error) throw error;
    return (data || []) as Cliente[];
}

export type ClientePayload = {
    escritorio_id: number;
    nome: string;
    cpf_cnpj: string | null;

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
    email_gov?: string | null;
    senha_gov?: string | null;
    observacao?: string | null;
};

export async function createCliente(payload: ClientePayload) {
    const client = getClient();

    // retorna id criado
    const { data, error } = await client.from("Jur_Clientes").insert([payload]).select("id").single();
    if (error) throw error;

    return data.id as number;
}

export async function updateCliente(id: number, payload: ClientePayload) {
    const client = getClient();
    const { error } = await client.from("Jur_Clientes").update(payload).eq("id", id);
    if (error) throw error;
    return id;
}

export async function hasProcessosVinculados(clienteId: number) {
    const client = getClient();
    const { data, error } = await client.from("Jur_Processos").select("id").eq("cliente_id", clienteId).limit(1);
    if (error) throw error;
    return !!(data && data.length > 0);
}

export async function deleteClienteById(id: number) {
    const client = getClient();
    const { error } = await client.from("Jur_Clientes").delete().eq("id", id);
    if (error) throw error;
}