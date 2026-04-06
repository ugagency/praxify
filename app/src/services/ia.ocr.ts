import { CONFIG } from "../core/config";

export interface DadosExtraidosDocumento {
    nome?: string | null;
    cpf_cnpj?: string | null;
    email?: string | null;
    celular?: string | null;
    contato_fixo?: string | null;
    cep?: string | null;
    endereco?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const PROMPT_OCR = `Analise este documento jurídico (procuração, RG, CNH, comprovante de residência ou similar) e extraia os dados da pessoa principal — o OUTORGANTE se for procuração, ou o titular do documento.

Retorne APENAS um JSON válido, sem markdown, sem explicações adicionais, neste formato exato:
{
  "nome": "nome completo da pessoa",
  "cpf_cnpj": "somente os dígitos do CPF ou CNPJ, sem pontuação",
  "email": "e-mail se encontrado",
  "celular": "somente dígitos do celular",
  "contato_fixo": "somente dígitos do telefone fixo",
  "cep": "somente dígitos do CEP",
  "endereco": "logradouro sem o número (ex: Rua Primavera)",
  "numero": "número do imóvel",
  "complemento": "complemento se houver",
  "bairro": "bairro",
  "cidade": "cidade",
  "estado": "sigla do estado com 2 letras maiúsculas (ex: MG)"
}

Use null para campos não encontrados no documento. Não invente dados.`;

export async function extrairDadosDocumento(file: File): Promise<DadosExtraidosDocumento> {
    const key = CONFIG.API?.GEMINI_KEY || import.meta.env.VITE_GEMINI_KEY;
    if (!key || key.includes("PLACEHOLDER")) {
        throw new Error("API Key do Gemini não configurada.");
    }

    const endpoint = CONFIG.API?.GEMINI_ENDPOINT || "https://generativelanguage.googleapis.com/v1beta/models";
    const model = CONFIG.API?.GEMINI_MODEL || "gemini-2.0-flash";
    const url = `${endpoint}/${model}:generateContent?key=${key}`;

    const base64 = await fileToBase64(file);
    const mimeType = file.type || "application/pdf";

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: PROMPT_OCR },
                    { inline_data: { mime_type: mimeType, data: base64 } },
                ],
            },
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
        },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro na API (Gemini): ${errorData.error?.message || "Erro desconhecido"}`);
    }

    const data = await response.json();
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!texto) throw new Error("Resposta vazia da API");

    const cleaned = texto.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    try {
        return JSON.parse(cleaned) as DadosExtraidosDocumento;
    } catch {
        throw new Error("Não foi possível interpretar os dados extraídos do documento.");
    }
}
