import { getClient } from "../../../../services/supabase";
import type {
    DocumentoItem,
    ProcessoDetalhe,
    ProcessoDetalheData,
    TimelineEvento,
    PrazoItem,
} from "../types/processoDetalhe.types";

/**
 * Jur_Prazos:
 * - No seu schema, a coluna é `processo` (FK/ID do processo).
 * - Se em algum ambiente existir `processo_id`, fazemos fallback.
 */
async function fetchPrazosByProcessoRef(params: { id: string }) {
    const client = getClient();

    const tentativa1 = await client
        .from("Jur_Prazos")
        .select("*")
        .eq("processo", params.id)
        .eq("status", "PENDENTE")
        .order("data_fatal", { ascending: true });

    if (!tentativa1.error) return tentativa1;

    const msg = String(tentativa1.error.message || "").toLowerCase();
    const isMissingColumn = msg.includes("does not exist") && msg.includes("processo");

    if (!isMissingColumn) return tentativa1;

    const query: any = client.from("Jur_Prazos").select("*");
    const fallback = await query
        .eq("processo_id", params.id)
        .eq("status", "PENDENTE")
        .order("data_fatal", { ascending: true });

    return fallback;
}

export async function fetchProcessoDetalhe(params: { id: string }) {
    const client = getClient();

    const { data, error } = await client
        .from("Jur_Processos")
        .select(
            `
        *,
        cliente:cliente_id (
            id,
            nome,
            cpf_cnpj,
            celular,
            contato_fixo,
            contato_comercial,
            email,
            cep,
            endereco,
            bairro,
            cidade,
            estado,
            numero,
            complemento,
            criado_em
        ),
        responsavel:responsavel_id (
            id,
            nome
        )
      `
        )
        .eq("id", params.id)
        .single();

    if (error) throw error;
    return data as ProcessoDetalhe;
}

export async function fetchTimeline(params: { id: string }) {
    const client = getClient();

    const { data, error } = await client
        .from("Jur_Historico")
        .select("*")
        .eq("processo_id", params.id)
        .order("criado_em", { ascending: false });

    if (error) throw error;
    return (data || []) as TimelineEvento[];
}

export async function fetchPrazosPendentes(params: { id: string }) {
    const { data, error } = await fetchPrazosByProcessoRef(params);

    if (error) throw error;
    return (data || []) as PrazoItem[];
}

export async function fetchDocumentos(params: { id: string }) {
    const client = getClient();

    const { data: docsData, error: docsErr } = await client
        .from("Jur_Documentos")
        .select("*")
        .eq("processo_id", params.id)
        .order("criado_em", { ascending: false });

    if (docsErr) throw docsErr;

    const { data: arqData, error: arqErr } = await client
        .from("Jur_Arquivos")
        .select("*")
        .eq("processo_id", params.id)
        .order("criado_em", { ascending: false });

    if (arqErr) throw arqErr;

    const normalizadosDocs: DocumentoItem[] = (docsData || []).map((d: Record<string, unknown>) => ({
        ...(d as object),
        origem: "GERADO",
        icon: "📄",
        criado_em: String(d.criado_em),
        titulo: String((d as { titulo?: string }).titulo || "Documento"),
    }));

    const normalizadosArq: DocumentoItem[] = (arqData || []).map((a: Record<string, unknown>) => ({
        ...(a as object),
        titulo: String((a as { descricao?: string }).descricao || "Arquivo Anexo"),
        origem: "UPLOAD",
        icon: "📎",
        criado_em: String(a.criado_em),
    }));

    return [...normalizadosDocs, ...normalizadosArq].sort(
        (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    );
}

export async function fetchAllDetalhe(params: { id: string }): Promise<ProcessoDetalheData> {
    const [processo, timeline, prazos, documentos] = await Promise.all([
        fetchProcessoDetalhe(params),
        fetchTimeline(params),
        fetchPrazosPendentes(params),
        fetchDocumentos(params),
    ]);

    return { processo, timeline, prazos, documentos };
}

/** ✅ EXPORT que estava faltando */
export async function updateProcessoNumeroTribunal(params: {
    processoId: number;
    numero_autos: string | null;
    tribunal: string | null;
}) {
    const client = getClient();

    const { error } = await client
        .from("Jur_Processos")
        .update({
            numero_autos: params.numero_autos,
            tribunal: params.tribunal,
        })
        .eq("id", params.processoId);

    if (error) throw error;
}