import { CONFIG } from "../core/config";

export async function gerarTextoComIA(prompt: string): Promise<string> {
    const key = CONFIG.API?.GEMINI_KEY || import.meta.env.VITE_GEMINI_KEY;
    if (!key || key.includes('PLACEHOLDER')) {
        throw new Error('API Key do Gemini não configurada.');
    }

    const endpoint = CONFIG.API?.GEMINI_ENDPOINT || "https://generativelanguage.googleapis.com/v1beta/models";
    const model = CONFIG.API?.GEMINI_MODEL || "gemini-2.0-flash";

    const url = `${endpoint}/${model}:generateContent?key=${key}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 8192,
            topP: 0.8,
            topK: 10
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro na API (Gemini): ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    const textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textoResposta) {
        throw new Error('Resposta vazia da API');
    }

    return textoResposta;
}
