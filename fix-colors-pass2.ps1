# fix-colors-pass2.ps1
# Segunda rodada — cores adicionais não cobertas na primeira passagem

$srcPath = "d:\SSYS\PROJETOS\Prax1\app\src"

$replacements = @(
    # ——— Hex escuros comuns de dark UI ———
    @{ From = '"#111827"';   To = '"var(--bg-darker)"' },
    @{ From = '"#1f2937"';   To = '"var(--bg-panel)"' },
    @{ From = '"#0f172a"';   To = '"var(--bg-darker)"' },
    @{ From = '"#0a0e27"';   To = '"var(--bg-darker)"' },
    @{ From = '"#112240"';   To = '"var(--bg-panel)"' },
    @{ From = '"#0b1220"';   To = '"var(--bg-darker)"' },
    @{ From = '"#1a2744"';   To = '"var(--bg-panel)"' },
    @{ From = '"#0f241c"';   To = '"var(--bg-panel)"' },
    @{ From = '"#102e24"';   To = '"var(--bg-panel)"' },
    @{ From = '"#143829"';   To = '"var(--bg-darker)"' },
    @{ From = '"#12352a"';   To = '"var(--bg-panel)"' },

    # ——— Hex de bordas escuras ———
    @{ From = '"#2a3441"';   To = '"var(--border-color)"' },
    @{ From = '"#374151"';   To = '"var(--border-color)"' },
    @{ From = '"#2f3a49"';   To = '"var(--border-color)"' },
    @{ From = '"#275643"';   To = '"var(--border-color)"' },
    @{ From = '"#1e3a5f"';   To = '"var(--border-color)"' },

    # ——— rgba adicionais de fundo escuro ———
    @{ From = '"rgba(0,0,0,0.18)"';      To = '"var(--bg-panel)"' },
    @{ From = '"rgba(0,0,0,0.5)"';       To = '"rgba(0,0,0,0.5)"' },  # sobreposição modal — manter
    @{ From = '"rgba(17,24,39,0.98)"';   To = '"var(--bg-darker)"' },
    @{ From = '"rgba(10, 14, 39, 0.7)"'; To = '"var(--bg-panel)"' },
    @{ From = '"rgba(10,14,39,0.7)"';    To = '"var(--bg-panel)"' },
    @{ From = '"rgba(10,14,39,0.6)"';    To = '"var(--bg-panel)"' },
    @{ From = '"rgba(17, 34, 64, 0.6)"'; To = '"var(--bg-panel)"' },
    @{ From = '"rgba(17,34,64,0.6)"';    To = '"var(--bg-panel)"' },
    @{ From = '"rgba(17,34,64,0.75)"';   To = '"var(--bg-panel)"' },
    @{ From = '"rgba(17,34,64,0.85)"';   To = '"var(--bg-panel)"' },

    # ——— Bordas sutis rgba adicionais ———
    @{ From = '"rgba(255,255,255,0.06)"'; To = '"var(--border-color)"' },  # borders (já substituído como surface, readjust)
    @{ From = '1px solid rgba(255,255,255,0.06)'; To = '"1px solid var(--border-color)"' },

    # ——— Texto dim adicional ———
    @{ From = '"#bbf7d0"';   To = '"var(--text-main)"' },   # verde claro de texto ATIVO badge — manter se em badge
    @{ From = '"#bae6fd"';   To = '"var(--text-main)"' },   # azul claro de badge
    @{ From = '"#fecaca"';   To = '"var(--text-main)"' },   # vermelho claro de badge
    @{ From = '"#d1fae5"';   To = '"var(--text-main)"' },   # verde claro
    @{ From = '"#dbeafe"';   To = '"var(--text-main)"' },   # azul claro
    @{ From = '"#fee2e2"';   To = '"var(--text-main)"' },   # vermelho claro

    # ——— Texto geral claro extra ———
    @{ From = '"#f0f4f8"';   To = '"var(--text-main)"' },
    @{ From = '"white"';     To = '"var(--text-main)"' },   # quando usado como color
    @{ From = ": 'white'";   To = ": 'var(--text-main)'" },

    # ——— Texto azulado usado como placeholder/hint ———
    @{ From = '"#60a5fa"';   To = '"var(--info)"' },
    @{ From = '"#c084fc"';   To = '"var(--accent)"' },
    @{ From = '"#f87171"';   To = '"var(--danger)"' }
)

$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.tsx","*.ts","*.js" |
    Where-Object { $_.FullName -notmatch "node_modules" }

$totalChanges = 0
$filesChanged = @()

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0

    foreach ($rep in $replacements) {
        $count = ([regex]::Matches($content, [regex]::Escape($rep.From))).Count
        if ($count -gt 0) {
            $content = $content -replace [regex]::Escape($rep.From), $rep.To
            $fileChanges += $count
        }
    }

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalChanges += $fileChanges
        $filesChanged += "$($file.Name): $fileChanges substituicoes"
        Write-Host "$($file.Name): $fileChanges" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Total: $totalChanges substituicoes em $($filesChanged.Count) arquivos" -ForegroundColor Cyan
