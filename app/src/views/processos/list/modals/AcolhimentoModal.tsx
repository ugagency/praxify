import React, { useEffect, useMemo, useState } from "react";
import type { AcolhimentoFormState, Cliente } from "../types/processos.types";
import { showAlert } from "../../../../utils/alert";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";

type Props = {
    open: boolean;
    onClose: () => void;
    clientes: Cliente[];
    onSubmit: (form: AcolhimentoFormState) => Promise<void>;
};

export const AcolhimentoModal: React.FC<Props> = ({ open, onClose, clientes, onSubmit }) => {
    const initialForm = useMemo<AcolhimentoFormState>(
        () => ({
            modoNovoLead: true,
            novo_nome: "",
            cliente_id: "",
            relato: "",
        }),
        []
    );

    const [form, setForm] = useState<AcolhimentoFormState>(initialForm);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) return;
        setForm(initialForm);
    }, [open, initialForm]);

    // Fechar com ESC
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    const { isRecording, toggle } = useSpeechRecognition({
        enabled: open,
        initialText: form.relato,
        onText: (t) => setForm((prev) => ({ ...prev, relato: t })),
        onError: (msg) => showAlert("Erro", msg, "error"),
    });

    if (!open) return null;

    const handleProcessarIA = async () => {
        if (!form.relato) {
            showAlert("Atenção", "Digite ou grave algo antes de usar a IA.", "warning");
            return;
        }

        try {
            // @ts-expect-error (JS module)
            const m = await import("../../../../services/ia_processing.js");
            const resultado = await m.processarTranscricaoComIA(form.relato);
            const textoFormatado = m.formatarResultadoParaTexto(resultado);

            setForm((prev) => ({ ...prev, relato: textoFormatado }));
            showAlert("Sucesso", "Texto estruturado com sucesso pela IA!", "success");
        } catch (e: unknown) {
            showAlert("Erro", "Erro ao processar com IA: " + (e as Error).message, "error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.modoNovoLead && !form.novo_nome) {
            showAlert("Atenção", "Nome do Lead é obrigatório", "warning");
            return;
        }
        if (!form.modoNovoLead && !form.cliente_id) {
            showAlert("Atenção", "Selecione um cliente", "warning");
            return;
        }

        setSaving(true);
        try {
            await onSubmit(form);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const styles = {
        overlay: {
            position: "fixed" as const,
            inset: 0,
            background: "rgba(0,0,0,0.60)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
        },
        modal: {
            width: "min(760px, 96vw)",
            background: "var(--bg-darker)",
            border: "1px solid var(--border-color)",
            borderRadius: 14,
            boxShadow: "0 30px 70px rgba(0,0,0,0.65)",
            overflow: "hidden" as const,
        },
        header: {
            padding: "0.85rem 0.9rem 0.65rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.75rem",
        },
        title: {
            margin: 0,
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            fontSize: "1.02rem",
            fontWeight: 950,
            color: "var(--text-main)",
            lineHeight: 1.15,
        },
        subtitle: {
            margin: "0.25rem 0 0",
            color: "var(--text-muted)",
            fontSize: "0.86rem",
            fontWeight: 650,
        },
        closeBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            cursor: "pointer",
            fontWeight: 950,
        },
        body: {
            padding: "0.85rem 0.9rem",
            maxHeight: "78vh",
            overflow: "auto" as const,
        },
        form: { display: "flex", flexDirection: "column" as const, gap: "0.7rem" },
        field: { display: "flex", flexDirection: "column" as const, gap: "0.34rem" },
        label: {
            fontSize: "0.74rem",
            color: "var(--text-muted)",
            fontWeight: 900,
            lineHeight: 1.1,
            margin: 0,
        },
        input: {
            width: "100%",
            height: "2.45rem",
            borderRadius: 10,
            fontSize: "0.92rem",
            background: "var(--bg-darker)",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)",
            padding: "0 0.8rem",
            outline: "none",
            boxSizing: "border-box" as const,
        },
        textarea: {
            width: "100%",
            borderRadius: 10,
            fontSize: "0.92rem",
            background: "var(--bg-darker)",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)",
            padding: ".65rem .8rem",
            outline: "none",
            boxSizing: "border-box" as const,
            fontFamily: "inherit",
            resize: "vertical" as const,
            minHeight: 140,
        },
        radioBox: {
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap" as const,
            background: "var(--bg-surface)",
            border: "1px solid var(--border-color)",
            padding: "0.75rem",
            borderRadius: 12,
        },
        radioItem: { display: "flex", alignItems: "center", gap: 8, color: "var(--text-main)", fontWeight: 850, cursor: "pointer" },
        toolbar: { display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center", justifyContent: "flex-end" as const },
        smallBtn: (variant: "danger" | "neutral" | "purple") => {
            const v =
                variant === "danger"
                    ? { bg: "rgba(239,68,68,0.16)", border: "rgba(239,68,68,0.35)", color: "var(--danger)" }
                    : variant === "purple"
                        ? { bg: "rgba(139,92,246,0.18)", border: "rgba(139,92,246,0.35)", color: "var(--accent)" }
                        : { bg: "var(--bg-surface)", border: "var(--border-color)", color: "var(--text-main)" };

            return {
                padding: ".45rem .65rem",
                borderRadius: 10,
                border: `1px solid ${v.border}`,
                background: v.bg,
                color: v.color,
                cursor: "pointer",
                fontWeight: 950,
                fontSize: ".82rem",
                fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            } as const;
        },
        actions: {
            display: "flex",
            gap: ".55rem",
            width: "100%",
            marginTop: ".35rem",
            flexWrap: "wrap" as const,
        },
        btnCancel: {
            flex: "1 1 auto",
            padding: ".65rem 1.6rem",
            borderRadius: 10,
            fontWeight: 950,
            fontSize: ".85rem",
            cursor: "pointer",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            background: "transparent",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
        },
        btnConfirm: {
            flex: "1 1 auto",
            padding: ".65rem 1.6rem",
            borderRadius: 10,
            fontWeight: 950,
            fontSize: ".85rem",
            cursor: "pointer",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            background: "var(--success)",
            color: "var(--text-main)",
            border: "none",
            opacity: saving ? 0.85 : 1,
        },
    };

    return (
        <div
            style={styles.overlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div style={styles.modal} role="dialog" aria-modal="true" aria-label="Novo Acolhimento">
                <div style={styles.header}>
                    <div>
                        <h3 style={styles.title}>📝 Novo Acolhimento</h3>
                        <p style={styles.subtitle}>Estruture a primeira reunião com um cliente novo ou existente.</p>
                    </div>

                    <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Fechar">
                        ✕
                    </button>
                </div>

                <div style={styles.body}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Tipo de atendimento</label>

                            <div style={styles.radioBox}>
                                <label style={styles.radioItem}>
                                    <input
                                        type="radio"
                                        checked={form.modoNovoLead}
                                        onChange={() => setForm((p) => ({ ...p, modoNovoLead: true, cliente_id: "" }))}
                                    />
                                    <span>Novo Lead</span>
                                </label>

                                <label style={styles.radioItem}>
                                    <input
                                        type="radio"
                                        checked={!form.modoNovoLead}
                                        onChange={() => setForm((p) => ({ ...p, modoNovoLead: false, novo_nome: "" }))}
                                    />
                                    <span>Cliente Existente</span>
                                </label>
                            </div>
                        </div>

                        {form.modoNovoLead ? (
                            <div style={styles.field}>
                                <label style={styles.label}>Nome do novo cliente</label>
                                <input
                                    required
                                    value={form.novo_nome}
                                    onChange={(e) => setForm((p) => ({ ...p, novo_nome: e.target.value }))}
                                    type="text"
                                    style={styles.input}
                                    placeholder="Digite o nome do cliente"
                                />
                            </div>
                        ) : (
                            <div style={styles.field}>
                                <label style={styles.label}>Selecione o cliente</label>
                                <select
                                    required
                                    value={form.cliente_id}
                                    onChange={(e) => setForm((p) => ({ ...p, cliente_id: e.target.value }))}
                                    style={styles.input}
                                >
                                    <option value="">Selecione...</option>
                                    {clientes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div style={styles.field}>
                            <label style={{ ...styles.label, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                                <span>Relato / Transcrição</span>
                                <span style={styles.toolbar}>
                                    <button
                                        type="button"
                                        onClick={toggle}
                                        style={styles.smallBtn(isRecording ? "danger" : "neutral")}
                                    >
                                        {isRecording ? "⏹ Parar" : "🎤 Gravar"}
                                    </button>

                                    <button type="button" onClick={handleProcessarIA} style={styles.smallBtn("purple")}>
                                        ✨ Estruturar IA
                                    </button>
                                </span>
                            </label>

                            <textarea
                                value={form.relato}
                                onChange={(e) => setForm((p) => ({ ...p, relato: e.target.value }))}
                                placeholder="Digite os detalhes da reunião ou use a gravação/IA."
                                style={styles.textarea}
                            />
                        </div>

                        <div style={styles.actions}>
                            <button type="button" onClick={onClose} disabled={saving} style={styles.btnCancel}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} style={styles.btnConfirm}>
                                {saving ? "Salvando..." : "Iniciar Atendimento"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};