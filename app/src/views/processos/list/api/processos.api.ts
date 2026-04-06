import { getClient, getProcessos, getUsuarios } from "../../../../services/supabase";
import type { Cliente, Processo, Usuario } from "../types/processos.types";

export async function fetchProcessos(escritorioId: string) {
    return getProcessos<Processo>(escritorioId);
}

export async function fetchClientes(escritorioId: string | number) {
    const client = getClient();
    return client
        .from("Jur_Clientes")
        .select("id, nome")
        .eq("escritorio_id", escritorioId);
}

export async function fetchUsuarios(escritorioId: string) {
    return getUsuarios<Usuario>(escritorioId);
}

export async function upsertProcesso(params: {
    escritorioId: string | number;
    processoId?: number;
    payload: {
        cliente_id: number;
        numero_autos: string | null;
        tribunal: string | null;
        status: string;
        responsavel_id: string | null | undefined;
    };
}) {
    const client = getClient();

    if (params.processoId) {
        const { data, error } = await client.from("Jur_Processos").update(params.payload).eq("id", params.processoId);
        if (error) throw error;
        return data;
    }

    const { data, error } = await client
        .from("Jur_Processos")
        .insert([{ ...params.payload, escritorio_id: params.escritorioId }]);
    
    if (error) throw error;
    return data;
}

export async function deleteProcesso(id: number) {
    const client = getClient();
    const { data, error } = await client.from("Jur_Processos").delete().eq("id", id);
    if (error) throw error;
    return data;
}

export async function updateProcessoStatus(id: number, status: string) {
    const client = getClient();
    const { data, error } = await client.from("Jur_Processos").update({ status }).eq("id", id);
    if (error) throw error;
    return data;
}

export async function criarLeadEProcessoPreProcessual(params: {
    escritorioId: string | number;
    userId?: string | null;
    modoNovoLead: boolean;
    novoNome: string;
    clienteId: string;
    relato: string;
}) {
    const client = getClient();

    let finalClientId = params.clienteId;

    // Cria o cliente se for Novo Lead
    if (params.modoNovoLead) {
        const { data: lead, error: errLead } = await client
            .from("Jur_Clientes")
            .insert([{ nome: params.novoNome, escritorio_id: params.escritorioId }])
            .select()
            .single();

        if (errLead) throw errLead;
        finalClientId = String((lead as Cliente).id);
    }

    if (!finalClientId) throw new Error("Selecione um cliente");

    // Cria Processo PRE_PROCESSUAL
    const { data: proc, error: procErr } = await client
        .from("Jur_Processos")
        .insert([
            {
                escritorio_id: params.escritorioId,
                cliente_id: parseInt(finalClientId, 10),
                numero_autos: "LEAD-" + Date.now().toString(),
                tribunal: "NOVO",
                status: "PRE_PROCESSUAL",
                responsavel_id: params.userId ?? null,
            },
        ])
        .select()
        .single();

    if (procErr) throw procErr;

    // Salva transcrição se existir
    if (params.relato) {
        const { error: histErr } = await client.from("Jur_Historico").insert([
            {
                escritorio_id: params.escritorioId,
                processo_id: (proc as { id: number }).id, // ✅ CORRIGIDO (era "processo")
                tipo: "REUNIAO",
                titulo: "Acolhimento Inicial",
                transcricao: params.relato,
                usuario_id: params.userId ?? null,
            },
        ]);
        if (histErr) throw histErr;
    }

    return proc;
}