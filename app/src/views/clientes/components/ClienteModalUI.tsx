import React from "react";
import type { TabId } from "./ClienteModal";

export const TabButton = ({
    id,
    label,
    active,
    onClick,
}: {
    id: TabId;
    label: string;
    active: boolean;
    onClick: (id: TabId) => void;
}) => {
    return (
        <button
            type="button"
            onClick={() => onClick(id)}
            style={{
                padding: "0.52rem 0.7rem",
                borderRadius: 12,
                border: active ? "1px solid rgba(59,130,246,0.55)" : "1px solid rgba(255,255,255,0.10)",
                background: active ? "rgba(59,130,246,0.14)" : "var(--bg-surface)",
                color: active ? "var(--text-main)" : "var(--text-main)",
                fontWeight: 900,
                fontSize: "0.84rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </button>
    );
};

export const Section = ({
    title,
    subtitle,
    open,
    onToggle,
    children,
}: {
    title: string;
    subtitle?: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) => {
    return (
        <div
            style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 12,
                overflow: "hidden",
                background: "var(--bg-surface)",
            }}
        >
            <button
                type="button"
                onClick={onToggle}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "0.75rem 0.9rem",
                    border: "none",
                    background: "var(--table-stripe)",
                    cursor: "pointer",
                    color: "var(--text-main)",
                    fontWeight: 950,
                    textAlign: "left",
                }}
            >
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ opacity: 0.9 }}>{open ? "▾" : "▸"}</span>
                        <span>{title}</span>
                    </div>
                    {subtitle && (
                        <div style={{ color: "var(--text-muted)", fontWeight: 750, fontSize: "0.82rem", marginTop: 4 }}>
                            {subtitle}
                        </div>
                    )}
                </div>
            </button>

            {open && (
                <div
                    style={{
                        padding: "0.9rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.95rem",
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export const Grid2 = ({ children }: { children: React.ReactNode }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.95rem" }}>{children}</div>
);

export const Input = ({
    label,
    value,
    onValue,
    placeholder,
    type = "text",
    required,
}: {
    label: string;
    value: string;
    onValue: (v: string) => void;
    placeholder?: string;
    type?: string;
    required?: boolean;
}) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        <label style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 650 }}>{label}</label>
        <input
            required={required}
            value={value}
            onChange={(e) => onValue(e.target.value)}
            type={type}
            placeholder={placeholder}
            style={{
                width: "100%",
                padding: "0.58rem 0.7rem",
                background: "var(--bg-panel)",
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "0.55rem",
                outline: "none",
                fontSize: "0.86rem",
                boxSizing: "border-box",
            }}
        />
    </div>
);