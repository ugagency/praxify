// =============================================
// MÓDULO: PROCESSAMENTO DE IA - GEMINI
// =============================================

import { CONFIG, debug } from '../core/config.js';
import { showError } from '../utils/ui.js';

/**
 * Processa transcrição bruta com IA (Gemini)
 * Identifica falantes, extrai informações e estrutura o texto
 */
export async function processarTranscricaoComIA(textoRaw) {
    if (!textoRaw || textoRaw.trim() === '') {
        throw new Error('Transcrição vazia');
    }

    // Validar se tem API key configurada
    if (!CONFIG.API.GEMINI_KEY || CONFIG.API.GEMINI_KEY.includes('PLACEHOLDER')) {
        throw new Error('API Key do Gemini não configurada. Configure em config.js');
    }

    const prompt = criarPromptEstruturacao(textoRaw);

    try {
        const resultado = await chamarGeminiAPI(prompt);
        return resultado;
    } catch (error) {
        debug('Erro ao processar com IA:', error);
        throw error;
    }
}

/**
 * Cria prompt otimizado para estruturação jurídica
 */
function criarPromptEstruturacao(texto) {
    return `Você é um assistente jurídico especializado em organizar transcrições de atendimentos.

Analise esta transcrição bruta de uma conversa entre advogado e cliente e estruture da seguinte forma:

TAREFAS:
1. Identifique quem é o Advogado e quem é o Cliente na conversa
2. Formate o diálogo com marcadores [Advogado]: e [Cliente]:
3. Corrija erros gramaticais óbvios mantendo o sentido original
4. Extraia informações-chave do caso

TRANSCRIÇÃO BRUTA:
"${texto}"

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem markdown, sem explicações, no seguinte formato:

{
  "transcricao_formatada": "texto formatado com [Advogado]: e [Cliente]:",
  "resumo_executivo": "resumo do caso em 2-3 frases",
  "informacoes_chave": {
    "cliente": "nome do cliente ou null",
    "fatos_principais": ["fato1", "fato2", "..."],
    "datas": ["15 de janeiro de 2024", "..."],
    "valores": ["R$ 5.000,00", "..."],
    "documentos_mencionados": ["RG", "comprovante", "..."],
    "proximos_passos": ["providenciar documentação", "..."]
  }
}`;
}

/**
 * Chama a API do Gemini
 */
async function chamarGeminiAPI(prompt) {
    const url = `${CONFIG.API.GEMINI_ENDPOINT}/${CONFIG.API.GEMINI_MODEL}:generateContent?key=${CONFIG.API.GEMINI_KEY}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.3
        }
    };

    debug('Chamando Gemini API...');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            debug('Erro da API:', errorData);

            if (response.status === 400) {
                throw new Error('API key inválida ou malformada. Verifique config.js');
            } else if (response.status === 429) {
                throw new Error('Limite de requisições excedido. Aguarde um momento.');
            } else {
                throw new Error(`Erro na API: ${errorData.error?.message || 'Erro desconhecido'}`);
            }
        }

        const data = await response.json();
        debug('Resposta da API recebida:', data);

        // Extrair texto da resposta
        const textoResposta = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textoResposta) {
            throw new Error('Resposta vazia da API');
        }

        let jsonText = textoResposta;
        const startIdx = jsonText.indexOf('{');
        const endIdx = jsonText.lastIndexOf('}');
        
        if (startIdx !== -1 && endIdx !== -1) {
            jsonText = jsonText.substring(startIdx, endIdx + 1);
        } else {
            const preview = JSON.stringify(data.candidates[0]).substring(0, 300);
            throw new Error(`Truncado ou Incompleto. FinishReason: ${data.candidates[0]?.finishReason}. Preview: ${preview}...`);
        }

        const resultado = JSON.parse(jsonText);

        // Validar estrutura esperada
        if (!resultado.transcricao_formatada || !resultado.resumo_executivo) {
            throw new Error('Resposta da IA em formato inesperado');
        }

        debug('Processamento concluído com sucesso');
        return resultado;

    } catch (error) {
        if (error instanceof SyntaxError) {
            debug('Erro ao fazer parse da resposta:', error);
            throw new Error('IA retornou formato inválido. Tente novamente.');
        }
        throw error;
    }
}

/**
 * Formata resultado para exibição simples (sem JSON)
 */
export function formatarResultadoParaTexto(resultado) {
    let texto = resultado.transcricao_formatada;

    // Adicionar seção de informações extraídas
    texto += '\n\n' + '='.repeat(60);
    texto += '\n📋 RESUMO: ' + resultado.resumo_executivo;
    texto += '\n' + '='.repeat(60);

    const info = resultado.informacoes_chave;

    if (info.cliente) {
        texto += '\n\n👤 CLIENTE: ' + info.cliente;
    }

    if (info.fatos_principais && info.fatos_principais.length > 0) {
        texto += '\n\n📌 FATOS PRINCIPAIS:';
        info.fatos_principais.forEach((fato, i) => {
            texto += `\n  ${i + 1}. ${fato}`;
        });
    }

    if (info.datas && info.datas.length > 0) {
        texto += '\n\n📅 DATAS: ' + info.datas.join(', ');
    }

    if (info.valores && info.valores.length > 0) {
        texto += '\n\n💰 VALORES: ' + info.valores.join(', ');
    }

    if (info.documentos_mencionados && info.documentos_mencionados.length > 0) {
        texto += '\n\n📄 DOCUMENTOS: ' + info.documentos_mencionados.join(', ');
    }

    if (info.proximos_passos && info.proximos_passos.length > 0) {
        texto += '\n\n✅ PRÓXIMOS PASSOS:';
        info.proximos_passos.forEach((passo, i) => {
            texto += `\n  ${i + 1}. ${passo}`;
        });
    }

    return texto;
}

export default {
    processarTranscricaoComIA,
    formatarResultadoParaTexto
};
