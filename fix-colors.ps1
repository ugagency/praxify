# fix-colors.ps1
# Substitui cores hardcoded por variáveis CSS semânticas em todos os TSX/TS/JS do projeto

$srcPath = "d:\SSYS\PROJETOS\Prax1\app\src"

# Lista de substituições ordenadas (mais específicas primeiro para evitar colisões)
$replacements = @(
    # ——— Fundos escuros hardcoded → var(--bg-panel) ou var(--bg-darker) ———
    @{ From = '"rgba(15,23,42,0.55)"';   To = '"var(--bg-panel)"' },
    @{ From = '"rgba(2,6,23,0.35)"';     To = '"var(--bg-panel)"' },
    @{ From = '"rgba(2,6,23,0.65)"';     To = '"var(--bg-darker)"' },
    @{ From = '"rgba(2,6,23,0.92)"';     To = '"var(--bg-darker)"' },
    @{ From = '"rgba(2,6,23,0.72)"';     To = '"var(--bg-darker)"' },
    @{ From = '"rgba(10,14,39,0.95)"';   To = '"var(--bg-darker)"' },
    @{ From = '"rgba(10, 14, 39, 0.95)"'; To = '"var(--bg-darker)"' },
    @{ From = '"rgba(0,0,0,0.2)"';       To = '"var(--bg-panel)"' },
    @{ From = '"rgba(0, 0, 0, 0.2)"';    To = '"var(--bg-panel)"' },

    # ——— Backgrounds de inputs/surfaces ———
    @{ From = '"rgba(255,255,255,0.06)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255,255,255,0.05)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255, 255, 255, 0.05)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255,255,255,0.04)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255,255,255,0.03)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255,255,255,0.08)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255,255,255,0.1)"';  To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255, 255, 255, 0.1)"'; To = '"var(--bg-surface)"' },
    @{ From = '"rgba(255,255,255,0.12)"'; To = '"var(--bg-surface)"' },

    # ——— Bordas sutis → var(--border-color) ———
    @{ From = '"rgba(148,163,184,0.12)"'; To = '"var(--border-color)"' },
    @{ From = '"rgba(148,163,184,0.14)"'; To = '"var(--border-color)"' },
    @{ From = '"rgba(148,163,184,0.18)"'; To = '"var(--border-color)"' },
    @{ From = '"rgba(148,163,184,0.28)"'; To = '"var(--border-color)"' },
    @{ From = '"rgba(255,255,255,0.10)"'; To = '"var(--border-color)"' },
    @{ From = '"rgba(255, 255, 255, 0.1)"'; To = '"var(--border-color)"' },
    @{ From = '"1px solid rgba(255,255,255,0.05)"'; To = '"1px solid var(--border-color)"' },
    @{ From = '"1px solid rgba(255, 255, 255, 0.05)"'; To = '"1px solid var(--border-color)"' },
    @{ From = '"1px solid rgba(255,255,255,0.08)"'; To = '"1px solid var(--border-color)"' },
    @{ From = '"2px solid rgba(255, 255, 255, 0.1)"'; To = '"2px solid var(--border-color)"' },

    # ——— Texto principal (claro no dark, escuro no light) → var(--text-main) ———
    @{ From = '"#f3f4f6"';  To = '"var(--text-main)"' },
    @{ From = '"#e5e7eb"';  To = '"var(--text-main)"' },
    @{ From = '"#e2e8f0"';  To = '"var(--text-main)"' },
    @{ From = '"#e6f1ff"';  To = '"var(--text-main)"' },
    @{ From = '"#cbd5e1"';  To = '"var(--text-main)"' },
    @{ From = '"#d1d5db"';  To = '"var(--text-main)"' },
    @{ From = '"#e0e0e0"';  To = '"var(--text-main)"' },

    # ——— Texto muted/secondary → var(--text-muted) ———
    @{ From = '"#94a3b8"';  To = '"var(--text-muted)"' },
    @{ From = '"#9ca3af"';  To = '"var(--text-muted)"' },
    @{ From = '"#8892b0"';  To = '"var(--text-muted)"' },
    @{ From = '"#c0d5cc"';  To = '"var(--text-muted)"' },
    @{ From = '"#c4d8cf"';  To = '"var(--text-muted)"' },
    @{ From = '"#6b7280"';  To = '"var(--text-muted)"' },
    @{ From = '"#9ab4c8"';  To = '"var(--text-muted)"' },

    # ——— Scrollbar colors ———
    @{ From = '"thin rgba(148,163,184,0.35) rgba(2,6,23,0.25)"'; To = '"thin var(--border-color) var(--bg-panel)"' },

    # ——— Stripe de tabela ———
    @{ From = '"rgba(255,255,255,0.02)"'; To = '"var(--table-stripe)"' },
    @{ From = '"rgba(255, 255, 255, 0.02)"'; To = '"var(--table-stripe)"' }
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
        $filesChanged += "$($file.Name): $fileChanges substituições"
        Write-Host "✅ $($file.Name): $fileChanges substituições" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Total: $totalChanges substituições em $($filesChanged.Count) arquivos" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
