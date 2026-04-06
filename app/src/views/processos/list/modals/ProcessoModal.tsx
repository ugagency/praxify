import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Cliente, Processo, ProcessoFormState, Usuario } from "../types/processos.types";
import { showAlert } from "../../../../utils/alert";


type SubmitResult = void | boolean | { ok: boolean; id: number | null };

type Props = {
    open: boolean;
    onClose: () => void;

    clientes: Cliente[];
    usuarios: Usuario[];

    userId?: string;



    processoEmEdicao: Processo | null;

    // ✅ pode continuar void; mas se retornar {ok,id}, anexa no mesmo clique no “novo”
    onSubmit: (form: ProcessoFormState) => Promise<SubmitResult>;
};

function normalizeSubmitResult(res: SubmitResult, fallbackId: number | null): { ok: boolean; id: number | null } {
    if (typeof res === "boolean") return { ok: res, id: res ? fallbackId : null };
    if (res && typeof res === "object" && "ok" in res) return res as { ok: boolean; id: number | null };
    return { ok: true, id: fallbackId };
}

export const ProcessoModal: React.FC<Props> = ({
    open,
    onClose,
    clientes,
    usuarios,
    userId,
    processoEmEdicao,
    onSubmit,
}) => {
    const initialForm = useMemo<ProcessoFormState>(
        () => ({
            numero_autos: "",
            cliente_id: "",
            tribunal: "",
            status: "ATIVO",
            responsavel_id: userId || "",
        }),
        [userId]
    );

    const [form, setForm] = useState<ProcessoFormState>(initialForm);
    const [saving, setSaving] = useState(false);



    useEffect(() => {
        if (!open) return;

        if (processoEmEdicao) {
            setForm({
                numero_autos: processoEmEdicao.numero_autos || "",
                cliente_id: String(processoEmEdicao.cliente_id),
                tribunal: processoEmEdicao.tribunal || "",
                status: processoEmEdicao.status,
                responsavel_id: processoEmEdicao.responsavel_id || "",
            });
        } else {
            setForm(initialForm);
        }


    }, [open, processoEmEdicao, initialForm]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (form.status !== "PRE_PROCESSUAL" && !form.numero_autos) {
            showAlert("Atenção", "Número é obrigatório para processos ativos!", "warning");
            return;
        }

        setSaving(true);
        try {
            const raw = await onSubmit(form);

            const fallbackId = processoEmEdicao?.id ?? null;
            const result = normalizeSubmitResult(raw, fallbackId);
            if (!result.ok) return;

            const processoId = result.id ?? fallbackId;



            onClose();
        } catch (e: any) {
            console.error(e);
            showAlert("Erro", e?.message || "Falha ao salvar processo", "error");
        } finally {
            setSaving(false);
        }
    };

    const title = processoEmEdicao ? "Editar Processo" : "Novo Processo";

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
        titleRow: {
            display: "flex",
            flexDirection: "column" as const,
            gap: 4,
            minWidth: 0,
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
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "0.86rem",
            fontWeight: 650,
        },
        closeBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.10)",
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
        grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" },
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
            border: "1px solid rgba(255,255,255,0.10)",
            color: "var(--text-main)",
            padding: "0 0.8rem",
            outline: "none",
            boxSizing: "border-box" as const,
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
            border: "1px solid rgba(255,255,255,0.12)",
        },
        btnConfirm: {
            flex: "1 1 180px",
            padding: ".65rem",
            borderRadius: 10,
            fontWeight: 950,
            fontSize: ".85rem",
            cursor: "pointer",
            fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
            background: "#10b981",
            color: "var(--text-main)",
            border: "none",
            opacity: saving ? 0.85 : 1,
        },
        hint: {
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            fontWeight: 700,
            marginTop: 2,
        },
    };

    return (
        <div
            style={styles.overlay}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div style={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
                <div style={styles.header}>
                    <div style={styles.titleRow}>
                        <h3 style={styles.title}>{title}</h3>
                        <p style={styles.subtitle}>Preencha os dados abaixo para salvar o processo.</p>
                    </div>

                    <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Fechar">
                        ✕
                    </button>
                </div>

                <div style={styles.body}>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.field}>
                            <label style={styles.label}>Número (opcional se Pré-Processual)</label>
                            <input
                                disabled={form.status === "PRE_PROCESSUAL"}
                                required={form.status !== "PRE_PROCESSUAL"}
                                value={form.status === "PRE_PROCESSUAL" ? "" : form.numero_autos}
                                onChange={(e) => setForm({ ...form, numero_autos: e.target.value })}
                                type="text"
                                style={{ ...styles.input, opacity: form.status === "PRE_PROCESSUAL" ? 0.5 : 1 }}
                                placeholder={form.status === "PRE_PROCESSUAL" ? "Não aplicável" : "Ex: 0001234-56.2026.8.26.0000"}
                            />
                            <div style={styles.hint}>Se o status for Pré-Processual, o número não é preenchido.</div>
                        </div>

                        <div style={styles.grid2}>
                            <div style={styles.field}>
                                <label style={styles.label}>Cliente</label>
                                <select
                                    required
                                    value={form.cliente_id}
                                    onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}
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

                            <div style={styles.field}>
                                <label style={styles.label}>Responsável</label>
                                <select
                                    value={form.responsavel_id}
                                    onChange={(e) => setForm({ ...form, responsavel_id: e.target.value })}
                                    style={styles.input}
                                >
                                    <option value="">Selecione...</option>
                                    {usuarios.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Tribunal Origem / Órgão</label>
                            <input
                                value={form.tribunal}
                                onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
                                type="text"
                                style={styles.input}
                                placeholder="Ex: TJSP / Vara Cível / Juizado..."
                            />
                        </div>

                        <div style={styles.field}>
                            <label style={styles.label}>Status</label>
                            <select
                                required
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                style={styles.input}
                            >
                                <option value="ATIVO">Ativo</option>
                                <option value="PRE_PROCESSUAL">Pré-Processual</option>
                                <option value="ARQUIVADO">Arquivado</option>
                                <option value="RECURSO">Em Recurso</option>
                                <option value="OUTROS">Outros</option>
                            </select>
                        </div>



                        <div style={styles.actions}>
                            <button type="button" onClick={onClose} disabled={saving} style={styles.btnCancel}>
                                Cancelar
                            </button>
                            <button type="submit" disabled={saving} style={styles.btnConfirm}>
                                {saving ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};