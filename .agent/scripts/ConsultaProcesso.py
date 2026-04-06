import requests
import re
import os

# =============================
# SEGMENTOS DE JUSTIÇA (campo J)
# =============================
# 1 = STF
# 2 = CNJ
# 3 = STJ / CJF
# 4 = Justiça Federal (TRFs)
# 5 = Justiça do Trabalho (TRTs)
# 6 = Justiça Eleitoral (TREs)
# 7 = Justiça Militar da União
# 8 = Justiça Estadual (TJs)
# 9 = Justiça Militar Estadual

# =============================
# MAPEAMENTO TR → endpoint por segmento
# =============================

# Justiça Estadual (J=8): TR = código do TJ
TRIBUNAIS_ESTADUAIS = {
    "01": "tjac",   # Acre
    "02": "tjal",   # Alagoas
    "03": "tjap",   # Amapá
    "04": "tjam",   # Amazonas
    "05": "tjba",   # Bahia
    "06": "tjce",   # Ceará
    "07": "tjdft",  # Distrito Federal e Territórios
    "08": "tjes",   # Espírito Santo
    "09": "tjgo",   # Goiás
    "10": "tjma",   # Maranhão
    "11": "tjmt",   # Mato Grosso
    "12": "tjms",   # Mato Grosso do Sul
    "13": "tjmg",   # Minas Gerais
    "14": "tjpa",   # Pará
    "15": "tjpb",   # Paraíba
    "16": "tjpr",   # Paraná
    "17": "tjpe",   # Pernambuco
    "18": "tjpi",   # Piauí
    "19": "tjrj",   # Rio de Janeiro
    "20": "tjrn",   # Rio Grande do Norte
    "21": "tjrs",   # Rio Grande do Sul
    "22": "tjro",   # Rondônia
    "23": "tjrr",   # Roraima
    "24": "tjsc",   # Santa Catarina
    "25": "tjse",   # Sergipe
    "26": "tjsp",   # São Paulo
    "27": "tjto",   # Tocantins
}

# Justiça Federal (J=4): TR = número do TRF
TRIBUNAIS_FEDERAIS = {
    "01": "trf1",   # TRF 1ª Região (AC, AM, AP, BA, DF, GO, MA, MG, MT, PA, PI, RO, RR, TO)
    "02": "trf2",   # TRF 2ª Região (ES, RJ)
    "03": "trf3",   # TRF 3ª Região (MS, SP)
    "04": "trf4",   # TRF 4ª Região (PR, RS, SC)
    "05": "trf5",   # TRF 5ª Região (AL, CE, PB, PE, RN, SE)
    "06": "trf6",   # TRF 6ª Região (MG) — criado em 2021
}

# Justiça do Trabalho (J=5): TR = número do TRT
TRIBUNAIS_TRABALHO = {
    "01": "trt1",   # 1ª Região (RJ)
    "02": "trt2",   # 2ª Região (SP - Capital)
    "03": "trt3",   # 3ª Região (MG)
    "04": "trt4",   # 4ª Região (RS)
    "05": "trt5",   # 5ª Região (BA)
    "06": "trt6",   # 6ª Região (PE)
    "07": "trt7",   # 7ª Região (CE)
    "08": "trt8",   # 8ª Região (PA e AP)
    "09": "trt9",   # 9ª Região (PR)
    "10": "trt10",  # 10ª Região (DF e TO)
    "11": "trt11",  # 11ª Região (AM e RR)
    "12": "trt12",  # 12ª Região (SC)
    "13": "trt13",  # 13ª Região (PB)
    "14": "trt14",  # 14ª Região (RO e AC)
    "15": "trt15",  # 15ª Região (SP - Interior)
    "16": "trt16",  # 16ª Região (MA)
    "17": "trt17",  # 17ª Região (ES)
    "18": "trt18",  # 18ª Região (GO)
    "19": "trt19",  # 19ª Região (AL)
    "20": "trt20",  # 20ª Região (SE)
    "21": "trt21",  # 21ª Região (RN)
    "22": "trt22",  # 22ª Região (PI)
    "23": "trt23",  # 23ª Região (MT)
    "24": "trt24",  # 24ª Região (MS)
}

# Justiça Eleitoral (J=6): TR = código do TRE
TRIBUNAIS_ELEITORAIS = {
    "01": "tre-ac",
    "02": "tre-al",
    "03": "tre-ap",
    "04": "tre-am",
    "05": "tre-ba",
    "06": "tre-ce",
    "07": "tre-df",
    "08": "tre-es",
    "09": "tre-go",
    "10": "tre-ma",
    "11": "tre-mt",
    "12": "tre-ms",
    "13": "tre-mg",
    "14": "tre-pa",
    "15": "tre-pb",
    "16": "tre-pr",
    "17": "tre-pe",
    "18": "tre-pi",
    "19": "tre-rj",
    "20": "tre-rn",
    "21": "tre-rs",
    "22": "tre-ro",
    "23": "tre-rr",
    "24": "tre-sc",
    "25": "tre-se",
    "26": "tre-sp",
    "27": "tre-to",
}

# Tribunais Superiores (J=1,2,3 — TR=00)
TRIBUNAIS_SUPERIORES = {
    "1": {"00": "stf"},
    "2": {"00": "cnj"},
    "3": {"00": "stj"},
    "7": {"00": "stm"},   # Superior Tribunal Militar (J=7, TR=00)
}

# Mapa geral por segmento J
MAPA_SEGMENTOS = {
    "1": TRIBUNAIS_SUPERIORES.get("1", {}),
    "2": TRIBUNAIS_SUPERIORES.get("2", {}),
    "3": TRIBUNAIS_SUPERIORES.get("3", {}),
    "4": TRIBUNAIS_FEDERAIS,
    "5": TRIBUNAIS_TRABALHO,
    "6": TRIBUNAIS_ELEITORAIS,
    "7": TRIBUNAIS_SUPERIORES.get("7", {}),
    "8": TRIBUNAIS_ESTADUAIS,
}

NOMES_SEGMENTOS = {
    "1": "STF",
    "2": "CNJ",
    "3": "STJ / Justiça Federal (CJF)",
    "4": "Justiça Federal",
    "5": "Justiça do Trabalho",
    "6": "Justiça Eleitoral",
    "7": "Justiça Militar da União",
    "8": "Justiça Estadual",
    "9": "Justiça Militar Estadual",
}

DATAJUD_BASE = "https://api-publica.datajud.cnj.jus.br/"

# =============================
# PADRÃO CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
# =============================
PADRAO_CNJ = re.compile(r"^\d{7}-\d{2}\.\d{4}\.\d{1}\.\d{2}\.\d{4}$")


def normalizar_numero(numero: str) -> str:
    """Remove todos os caracteres não numéricos."""
    return re.sub(r'\D', '', numero)


def parsear_numero_cnj(numero_processo: str) -> dict | None:
    """
    Faz o parse completo de um número CNJ formatado.
    Retorna dict com os campos ou None se inválido.

    Formato: NNNNNNN-DD.AAAA.J.TR.OOOO
    Exemplo: 6389653-98.2025.4.06.3800
    """
    if not PADRAO_CNJ.fullmatch(numero_processo):
        return None

    # Split: ['6389653-98', '2025', '4', '06', '3800']
    partes = numero_processo.split(".")
    if len(partes) != 5:
        return None

    nnnnnnn_dd = partes[0].split("-")
    if len(nnnnnnn_dd) != 2:
        return None

    return {
        "numero_completo": numero_processo,
        "numero_limpo": normalizar_numero(numero_processo),
        "nnnnnnn": nnnnnnn_dd[0],
        "dd": nnnnnnn_dd[1],
        "aaaa": partes[1],
        "j": partes[2],    # Segmento de justiça
        "tr": partes[3],   # Código do tribunal
        "oooo": partes[4], # Origem
    }


def resolver_endpoint(numero_processo: str) -> dict:
    """
    Resolve o endpoint DataJud correto para um número CNJ.
    Retorna dict com: endpoint, sigla, segmento_nome, j, tr
    Levanta ValueError se não for possível resolver.
    """
    parsed = parsear_numero_cnj(numero_processo)
    if not parsed:
        raise ValueError(
            f"Número '{numero_processo}' não está no formato CNJ válido.\n"
            "Formato esperado: NNNNNNN-DD.AAAA.J.TR.OOOO\n"
            "Exemplo: 6389653-98.2025.4.06.3800"
        )

    j = parsed["j"]
    tr = parsed["tr"]

    mapa = MAPA_SEGMENTOS.get(j)
    if mapa is None:
        nome_seg = NOMES_SEGMENTOS.get(j, f"Segmento {j}")
        raise ValueError(
            f"Segmento de justiça '{j}' ({nome_seg}) não é suportado ainda.\n"
            "Segmentos suportados: 1 (STF), 2 (CNJ), 3 (STJ), 4 (Federal), "
            "5 (Trabalho), 6 (Eleitoral), 7 (Militar União), 8 (Estadual)."
        )

    sigla = mapa.get(tr)
    if not sigla:
        nome_seg = NOMES_SEGMENTOS.get(j, f"Segmento {j}")
        raise ValueError(
            f"Tribunal TR='{tr}' não encontrado para o segmento {j} ({nome_seg}).\n"
            f"Tribunais disponíveis nesse segmento: {sorted(mapa.keys())}"
        )

    endpoint = f"api_publica_{sigla.replace('-', '_')}"
    return {
        "endpoint": endpoint,
        "sigla": sigla,
        "segmento_nome": NOMES_SEGMENTOS.get(j, f"Segmento {j}"),
        "j": j,
        "tr": tr,
        "parsed": parsed,
    }


def consultar_processo_e_relacionados(
    nome_autor: str,
    tribunal_code: str,
    api_key: str,
    numero_processo_original: str = None
) -> list[dict]:
    """
    Mantém compatibilidade retroativa com a assinatura original.
    Se numero_processo_original for fornecido, usa o novo resolver.
    Caso contrário, usa tribunal_code diretamente (comportamento legado).
    """
    if numero_processo_original:
        return consultar_processo(numero_processo_original, api_key)

    # Fallback legado: tribunal_code como código TR de tribunal estadual
    sigla = TRIBUNAIS_ESTADUAIS.get(tribunal_code)
    if not sigla:
        raise ValueError(f"Tribunal '{tribunal_code}' não suportado no modo legado.")
    endpoint = f"api_publica_{sigla}"
    return _executar_busca(endpoint, numero_limpo=None, api_key=api_key)


def consultar_processo(numero_processo: str, api_key: str) -> list[dict]:
    """
    Ponto de entrada principal.
    Recebe o número CNJ formatado e a API key, retorna lista de resultados.
    """
    info = resolver_endpoint(numero_processo)
    endpoint = info["endpoint"]
    numero_limpo = info["parsed"]["numero_limpo"]

    print(f"INFO: Tribunal identificado → {info['sigla'].upper()} ({info['segmento_nome']})")
    print(f"INFO: Endpoint → {endpoint}")
    print(f"INFO: Número limpo → {numero_limpo}")

    return _executar_busca(endpoint, numero_limpo, api_key)


def _executar_busca(endpoint: str, numero_limpo: str, api_key: str) -> list[dict]:
    """
    Executa as buscas na API DataJud: processo original + processos da mesma vara.
    """
    url = f"{DATAJUD_BASE}{endpoint}/_search"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"APIKey {api_key}",
    }
    resultados = []

    if not numero_limpo:
        return resultados

    # ── Busca 1: Processo pelo número ──────────────────────────────────────────
    payload_proc = {
        "query": {"term": {"numeroProcesso": numero_limpo}},
        "size": 1,
        "_source": [
            "numeroProcesso", "classe", "assuntos",
            "dataHoraUltimaAtualizacao", "grau", "orgaoJulgador", "movimentos"
        ],
    }

    print(f"DEBUG: Consultando {url} com número {numero_limpo}...")

    try:
        r = requests.post(url, headers=headers, json=payload_proc, verify=False, timeout=10)
        r.raise_for_status()
        data = r.json()
        hits = data.get("hits", {}).get("hits", [])

        if not hits:
            print("AVISO: Nenhum processo encontrado para esse número.")
            return resultados

        source = hits[0].get("_source", {})
        orgao = source.get("orgaoJulgador", {})

        proc = {
            "numero": source.get("numeroProcesso"),
            "classe": source.get("classe", {}).get("nome"),
            "assuntos": [a.get("nome") for a in source.get("assuntos", [])],
            "dataUltimaAtualizacao": source.get("dataHoraUltimaAtualizacao"),
            "grau": source.get("grau"),
            "orgaoJulgador": orgao.get("nome"),
            "movimentos": [
                {"nome": m.get("nome"), "data": m.get("dataHora")}
                for m in source.get("movimentos", [])[-3:]  # últimas 3 movimentações
            ],
            "tipo": "processo_original",
        }
        resultados.append(proc)

        # ── Busca 2: Outros processos do mesmo órgão julgador ─────────────────
        codigo_orgao = orgao.get("codigo")
        if codigo_orgao:
            payload_vara = {
                "query": {
                    "bool": {
                        "must": [
                            {"term": {"orgaoJulgador.codigo": str(codigo_orgao)}}
                        ],
                        "must_not": [
                            {"term": {"numeroProcesso": numero_limpo}}
                        ],
                    }
                },
                "size": 5,
                "sort": [{"dataHoraUltimaAtualizacao": {"order": "desc"}}],
                "_source": [
                    "numeroProcesso", "classe", "assuntos",
                    "dataHoraUltimaAtualizacao", "grau"
                ],
            }
            r2 = requests.post(url, headers=headers, json=payload_vara, verify=False, timeout=10)
            if r2.ok:
                data2 = r2.json()
                for hit in data2.get("hits", {}).get("hits", []):
                    src = hit.get("_source", {})
                    resultados.append({
                        "numero": src.get("numeroProcesso"),
                        "classe": src.get("classe", {}).get("nome"),
                        "assuntos": [a.get("nome") for a in src.get("assuntos", [])],
                        "dataUltimaAtualizacao": src.get("dataHoraUltimaAtualizacao"),
                        "grau": src.get("grau"),
                        "tipo": "mesma_vara",
                    })

    except requests.exceptions.HTTPError as e:
        print(f"ERRO HTTP: {e} — Verifique a API key e o endpoint.")
        raise
    except Exception as e:
        print(f"ERRO: {e}")
        raise

    return resultados


# ── Alias retrocompatível ──────────────────────────────────────────────────────
consultar_por_nome = consultar_processo_e_relacionados


# ── Utilitários de diagnóstico ─────────────────────────────────────────────────
def diagnosticar_numero(numero_processo: str) -> None:
    """Imprime diagnóstico completo de um número CNJ sem fazer chamadas à API."""
    try:
        parsed = parsear_numero_cnj(numero_processo)
        if not parsed:
            print(f"❌ Número inválido: '{numero_processo}'")
            print("   Formato esperado: NNNNNNN-DD.AAAA.J.TR.OOOO")
            return

        info = resolver_endpoint(numero_processo)

        print(f"✅ Número CNJ válido: {numero_processo}")
        print(f"   Número (só dígitos): {parsed['numero_limpo']}")
        print(f"   Ano: {parsed['aaaa']}")
        print(f"   Segmento (J={parsed['j']}): {info['segmento_nome']}")
        print(f"   Tribunal (TR={parsed['tr']}): {info['sigla'].upper()}")
        print(f"   Origem: {parsed['oooo']}")
        print(f"   Endpoint DataJud: {info['endpoint']}")
        print(f"   URL base: {DATAJUD_BASE}{info['endpoint']}/_search")

    except ValueError as e:
        print(f"❌ {e}")


# ── Execução direta para testes ────────────────────────────────────────────────
if __name__ == "__main__":
    import sys

    numeros_teste = [
        "6389653-98.2025.4.06.3800",   # TRF6 - Justiça Federal MG
        "0001234-56.2023.8.26.0100",   # TJSP - Justiça Estadual SP
        "0000001-02.2022.5.03.0000",   # TRT3 - Justiça do Trabalho MG
        "0000001-02.2022.6.13.0000",   # TRE-MG - Justiça Eleitoral
    ]

    print("=" * 60)
    print("DIAGNÓSTICO DE NÚMEROS CNJ")
    print("=" * 60)
    for n in numeros_teste:
        print()
        diagnosticar_numero(n)

    # Para consulta real, descomente e informe a API key:
    # API_KEY = os.environ.get("DATAJUD_API_KEY", "cDZHYzlZa0JadVREZDJCendFbXNBR3A6SkJlTzNjLV9TRENyQXk4bWFsNnA1")
    # resultados = consultar_processo("6389653-98.2025.4.06.3800", API_KEY)
    # import json; print(json.dumps(resultados, indent=2, ensure_ascii=False))