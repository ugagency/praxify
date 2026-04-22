import React from "react";
import { showAlert } from "../../../../utils/alert";

function Action(props: { label: string; hint?: string; icon: string; variant: "primary" | "neutral" | "danger"; onClick?: () => void }) {
    const { label, hint, icon, variant, onClick } = props;

    const styles =
        variant === "primary"
            ? { bg: "rgba(56,189,248,0.16)", border: "rgba(56,189,248,0.40)", color: "var(--accent)" }
            : variant === "danger"
                ? { bg: "rgba(239,68,68,0.16)", border: "rgba(239,68,68,0.40)", color: "var(--danger)" }
                : { bg: "var(--bg-surface)", border: "var(--border-color)", color: "var(--text-main)" };

    return (
        <button
            onClick={onClick}
            style={{
                width: "100%",
                padding: "0.75rem 0.85rem",
                borderRadius: 14,
                border: `1px solid ${styles.border}`,
                background: styles.bg,
                color: styles.color,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: "1.05rem" }}>{icon}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                    <span style={{ fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {label}
                    </span>
                    {hint && <span style={{ fontSize: "0.78rem", opacity: 0.85 }}>{hint}</span>}
                </div>
            </div>
            <span style={{ fontWeight: 900, opacity: 0.85 }}>›</span>
        </button>
    );
}

type ProcessoAcoesCardProps = {
    isArquivado: boolean;
    onArquivarProcesso?: () => void;
    onAtivarProcesso?: () => void;
};

export const ProcessoAcoesCard: React.FC<ProcessoAcoesCardProps> = ({ isArquivado, onArquivarProcesso, onAtivarProcesso }) => {
    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid var(--border-color)",
                background: "var(--bg-panel)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
            }}
        >
            <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "1rem", fontWeight: 900 }}>⚡ Ações rápidas</h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                <Action
                    icon="🧠"
                    label="Analisar fatos (IA)"
                    hint="Resumo e pontos-chave do caso"
                    variant="primary"
                    onClick={() => { showAlert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve.', 'info'); }}
                />
                <Action
                    icon="📄"
                    label="Gerar documento"
                    hint="Petição, notificação, contrato"
                    variant="neutral"
                    onClick={() => { showAlert('Em desenvolvimento', 'Esta funcionalidade estará disponível em breve.', 'info'); }}
                />
                <Action
                    icon="📎"
                    label="Anexar documento"
                    hint="Upload com validação automática"
                    variant="neutral"
                    onClick={() => {
                        document.getElementById("upload-doc-input-hidden")?.click();
                    }}
                />
                {isArquivado ? (
                    <Action
                        icon="✅"
                        label="Ativar processo"
                        hint="Mover de volta para ativos"
                        variant="primary" /* Will map to blue or we can change to green, using neutral for now or a custom green if wanted. Primary maps to blue */
                        onClick={onAtivarProcesso}
                    />
                ) : (
                    <Action
                        icon="🗑"
                        label="Arquivar processo"
                        hint="Mover para arquivados"
                        variant="danger"
                        onClick={onArquivarProcesso}
                    />
                )}
            </div>
        </div>
    );
};