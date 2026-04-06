import React from "react";

type Props = {
    page: number;
    pages: number;
    onChange: (p: number) => void;
};

export const ClientesPagination: React.FC<Props> = ({ page, pages, onChange }) => {
    if (pages <= 1) return null;

    const clamp = (v: number) => Math.max(1, Math.min(pages, v));
    const go = (v: number) => onChange(clamp(v));

    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, Math.min(page - half, pages - windowSize + 1));
    const end = Math.min(pages, start + windowSize - 1);

    const btn: React.CSSProperties = {
        border: "1px solid rgba(255,255,255,0.10)",
        background: "var(--bg-surface)",
        color: "var(--text-main)",
        padding: "0.35rem 0.6rem",
        borderRadius: "0.55rem",
        cursor: "pointer",
        fontSize: "0.875rem",
        lineHeight: 1,
    };

    const btnActive: React.CSSProperties = {
        ...btn,
        background: "rgba(16,185,129,0.18)",
        borderColor: "rgba(16,185,129,0.35)",
        color: "var(--text-main)",
        fontWeight: 700,
    };

    const btnDisabled: React.CSSProperties = {
        ...btn,
        opacity: 0.55,
        cursor: "not-allowed",
    };

    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "0.9rem 1rem" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Página <b style={{ color: "var(--text-main)" }}>{page}</b> de <b style={{ color: "var(--text-main)" }}>{pages}</b>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <button type="button" style={page === 1 ? btnDisabled : btn} disabled={page === 1} onClick={() => go(1)}>
                    «
                </button>
                <button type="button" style={page === 1 ? btnDisabled : btn} disabled={page === 1} onClick={() => go(page - 1)}>
                    ‹
                </button>

                {start > 1 && (
                    <>
                        <button type="button" style={btn} onClick={() => go(1)}>
                            1
                        </button>
                        {start > 2 && <span style={{ color: "var(--text-muted)" }}>…</span>}
                    </>
                )}

                {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
                    <button key={p} type="button" style={p === page ? btnActive : btn} onClick={() => go(p)}>
                        {p}
                    </button>
                ))}

                {end < pages && (
                    <>
                        {end < pages - 1 && <span style={{ color: "var(--text-muted)" }}>…</span>}
                        <button type="button" style={btn} onClick={() => go(pages)}>
                            {pages}
                        </button>
                    </>
                )}

                <button type="button" style={page === pages ? btnDisabled : btn} disabled={page === pages} onClick={() => go(page + 1)}>
                    ›
                </button>
                <button type="button" style={page === pages ? btnDisabled : btn} disabled={page === pages} onClick={() => go(pages)}>
                    »
                </button>
            </div>
        </div>
    );
};