# fix-colors-pass3.ps1
# Terceira passagem — padrões com aspas simples e contextos JSX inline

$srcPath = "d:\SSYS\PROJETOS\Prax1\app\src"

$replacements = @(
    # ——— Texto principal com aspas simples ———
    @{ From = "color: '#f3f4f6'";    To = "color: 'var(--text-main)'" },
    @{ From = "color: '#e5e7eb'";    To = "color: 'var(--text-main)'" },
    @{ From = "color: '#e2e8f0'";    To = "color: 'var(--text-main)'" },
    @{ From = "color: '#d1d5db'";    To = "color: 'var(--text-main)'" },
    @{ From = "color: '#cbd5e1'";    To = "color: 'var(--text-main)'" },
    @{ From = "color: '#e6f1ff'";    To = "color: 'var(--text-main)'" },
    @{ From = "color: '#fff'";       To = "color: 'var(--text-main)'" },
    @{ From = "color: 'white'";      To = "color: 'var(--text-main)'" },
    @{ From = 'color: "#f3f4f6"';    To = 'color: "var(--text-main)"' },
    @{ From = 'color: "#e5e7eb"';    To = 'color: "var(--text-main)"' },
    @{ From = 'color: "#e2e8f0"';    To = 'color: "var(--text-main)"' },
    @{ From = 'color: "#d1d5db"';    To = 'color: "var(--text-main)"' },
    @{ From = 'color: "#cbd5e1"';    To = 'color: "var(--text-main)"' },
    @{ From = 'color: "#fff"';       To = 'color: "var(--text-main)"' },

    # ——— Texto muted com aspas simples ———
    @{ From = "color: '#9ca3af'";    To = "color: 'var(--text-muted)'" },
    @{ From = "color: '#94a3b8'";    To = "color: 'var(--text-muted)'" },
    @{ From = "color: '#8892b0'";    To = "color: 'var(--text-muted)'" },
    @{ From = "color: '#6b7280'";    To = "color: 'var(--text-muted)'" },
    @{ From = 'color: "#9ca3af"';    To = 'color: "var(--text-muted)"' },
    @{ From = 'color: "#94a3b8"';    To = 'color: "var(--text-muted)"' },

    # ——— Fundos escuros com aspas simples ———
    @{ From = "background: '#111827'";   To = "background: 'var(--bg-darker)'" },
    @{ From = "background: '#1f2937'";   To = "background: 'var(--bg-panel)'" },
    @{ From = "background: '#0b1220'";   To = "background: 'var(--bg-darker)'" },
    @{ From = "background: '#0a0e27'";   To = "background: 'var(--bg-darker)'" },

    # ——— Bordas escuras com aspas simples ———
    @{ From = "border: '1px solid #2a3441'";   To = "border: '1px solid var(--border-color)'" },
    @{ From = "border: '1px solid #374151'";   To = "border: '1px solid var(--border-color)'" },
    @{ From = "border: '1px solid #2f3a49'";   To = "border: '1px solid var(--border-color)'" },
    @{ From = 'border: "1px solid #2a3441"';   To = 'border: "1px solid var(--border-color)"' },
    @{ From = 'border: "1px solid #374151"';   To = 'border: "1px solid var(--border-color)"' },
    @{ From = 'border: "1px solid #2f3a49"';   To = 'border: "1px solid var(--border-color)"' },
    @{ From = 'borderBottom: "1px solid #374151"'; To = 'borderBottom: "1px solid var(--border-color)"' },
    @{ From = "borderBottom: '1px solid #374151'"; To = "borderBottom: '1px solid var(--border-color)'" },

    # ——— Cores de pagination desativado (disabled) ———
    @{ From = "'rgba(156,163,175,0.5)'"; To = "'var(--text-dim)'" },
    @{ From = '"rgba(156,163,175,0.5)"'; To = '"var(--text-dim)"' },

    # ——— Cor do accent azul (info) ———
    @{ From = "color: '#60a5fa'";  To = "color: 'var(--info)'" },
    @{ From = 'color: "#60a5fa"';  To = 'color: "var(--info)"' },
    @{ From = "color: '#00d9ff'";  To = "color: 'var(--accent)'" },
    @{ From = 'color: "#00d9ff"';  To = 'color: "var(--accent)"' },

    # ——— Cor de destaque dourado/gold ———
    @{ From = "color: '#d0a84f'";  To = "color: 'var(--primary)'" },
    @{ From = 'color: "#d0a84f"';  To = 'color: "var(--primary)"' },
    @{ From = "'rgba(208,168,79,0.14)'"; To = "'var(--primary-dim)'" },
    @{ From = "'rgba(208,168,79,0.28)'"; To = "'var(--primary-dim)'" },

    # ——— Bg escuro standalone em variáveis JS ———
    @{ From = "rgba(10, 14, 39, 0.7)";     To = "var(--bg-panel)" },
    @{ From = "rgba(10, 14, 39, 0.95)";    To = "var(--bg-darker)" },
    @{ From = "rgba(10,14,39,0.7)";        To = "var(--bg-panel)" },
    @{ From = "rgba(10,14,39,0.95)";       To = "var(--bg-darker)" }
)

$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.tsx","*.ts","*.js" |
    Where-Object { $_.FullName -notmatch "node_modules" }

$totalChanges = 0
$filesChanged = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileChanges = 0

    foreach ($rep in $replacements) {
        $escapedFrom = [regex]::Escape($rep.From)
        $count = ([regex]::Matches($content, $escapedFrom)).Count
        if ($count -gt 0) {
            $content = $content -replace $escapedFrom, $rep.To
            $fileChanges += $count
        }
    }

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
        $totalChanges += $fileChanges
        $filesChanged++
        Write-Host "$($file.Name): $fileChanges" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Total: $totalChanges substituicoes em $filesChanged arquivos" -ForegroundColor Cyan
