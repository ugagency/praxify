// src/views/processos/list/api/arquivos.api.ts
import { getClient } from "../../../../services/supabase";

export type JurArquivoTipo = "AUDIO" | "DOCUMENTO" | "IMAGEM" | "OUTRO";

export type JurArquivo = {
    id: number;
    escritorio_id: number;
    cliente_id: number | null;
    processo_id: number | null;
    usuario_id: string | null; // uuid
    tipo: JurArquivoTipo | null;
    url: string; // path no storage
    descricao: string | null;
    criado_em: string;
};

const BUCKET = "arquivos";

function sanitizeFileName(name: string) {
    return name.replace(/[^\w.\-]+/g, "_");
}

/**
 * Mapeia MIME/Extensão para o CHECK constraint:
 * AUDIO | DOCUMENTO | IMAGEM | OUTRO
 */
function mapTipoFromFile(file: File): JurArquivoTipo {
    const mime = (file.type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    if (mime.startsWith("image/") || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/.test(name)) return "IMAGEM";
    if (mime.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/.test(name)) return "AUDIO";

    if (
        mime === "application/pdf" ||
        mime.includes("officedocument") ||
        mime.includes("msword") ||
        mime.includes("spreadsheet") ||
        mime.startsWith("text/")
    ) {
        return "DOCUMENTO";
    }

    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|rtf)$/.test(name)) return "DOCUMENTO";

    return "OUTRO";
}

/** Lista anexos vinculados a um PROCESSO */
export async function listArquivosByProcesso(processoId: number) {
    const client = getClient();
    const { data, error } = await client
        .from("Jur_Arquivos")
        .select("*")
        .eq("processo_id", processoId)
        .order("criado_em", { ascending: false });

    if (error) throw error;
    return (data || []) as JurArquivo[];
}

/** Lista anexos vinculados a um CLIENTE (mesmo padrão da tela de Cliente) */
export async function listArquivosByCliente(clienteId: number) {
    const client = getClient();
    const { data, error } = await client
        .from("Jur_Arquivos")
        .select("*")
        .eq("cliente_id", clienteId)
        .order("criado_em", { ascending: false });

    if (error) throw error;
    return (data || []) as JurArquivo[];
}

/** Gera URL assinada para visualizar/baixar */
export async function getSignedUrl(path: string, expiresInSeconds = 60 * 10) {
    const client = getClient();
    const { data, error } = await client.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
    if (error) throw error;
    return data.signedUrl;
}

/** Upload + grava na Jur_Arquivos vinculando ao PROCESSO e ao CLIENTE (quando informado) */
export async function uploadArquivosProcesso(params: {
    escritorioId: number;
    processoId: number;
    clienteId?: number | null;
    usuarioId?: string | null;
    files: File[];
    descricaoOverride?: (file: File) => string;
}) {
    const { escritorioId, processoId, clienteId, usuarioId, files, descricaoOverride } = params;
    if (!files?.length) return;

    const client = getClient();

    for (const file of files) {
        const safeName = sanitizeFileName(file.name);

        // ✅ Prioriza o padrão "clientes/<clienteId>" para ficar consistente com a tela de Cliente
        const basePath =
            clienteId != null
                ? `escritorios/${escritorioId}/clientes/${clienteId}/processos/${processoId}`
                : `escritorios/${escritorioId}/processos/${processoId}`;

        const path = `${basePath}/${Date.now()}_${safeName}`;

        // 1) storage
        const { error: upErr } = await client.storage.from(BUCKET).upload(path, file, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
            cacheControl: "3600",
        });
        if (upErr) throw upErr;

        // 2) banco
        const { error: dbErr } = await client.from("Jur_Arquivos").insert([
            {
                escritorio_id: escritorioId,
                cliente_id: clienteId ?? null, // ✅ agora salva cliente_id quando disponível
                processo_id: processoId,
                usuario_id: usuarioId ?? null,
                tipo: mapTipoFromFile(file),
                url: path,
                descricao: descricaoOverride ? descricaoOverride(file) : file.name,
            },
        ]);

        if (dbErr) {
            // rollback best-effort
            await client.storage.from(BUCKET).remove([path]);
            throw dbErr;
        }
    }
}

/** Exclui: storage + registro no banco */
export async function deleteArquivo(params: { id: number; path: string }) {
    const client = getClient();

    const { error: stErr } = await client.storage.from(BUCKET).remove([params.path]);
    if (stErr) throw stErr;

    const { error: dbErr } = await client.from("Jur_Arquivos").delete().eq("id", params.id);
    if (dbErr) throw dbErr;
}