import React from "react";
// Timeline type abstract

type Props = {
    timeline: any[];
};

export const ProcessoTimelineCard: React.FC<Props> = ({ timeline }) => {
    return (
        <div
            style={{
                borderRadius: 18,
                border: "1px solid rgba(148,163,184,0.14)",
                background: "var(--bg-panel)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                minWidth: 0,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h4 style={{ color: "var(--text-main)", margin: 0, fontSize: "1rem", fontWeight: 900 }}>🧭 Timeline do caso</h4>
            </div>

            <div
                style={{
                    maxHeight: 400,
                    overflowY: "auto",
                    paddingRight: 8,
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(148,163,184,0.35) rgba(2,6,23,0.25)",
                }}
            >
                {timeline.length === 0 ? (
                    <div style={{ color: "var(--text-muted)", padding: "0.75rem 0.25rem" }}>
                        Nenhum evento registrado na timeline.
                    </div>
                ) : (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.9rem",
                            borderLeft: "2px solid rgba(148,163,184,0.18)",
                            paddingLeft: "1rem",
                            marginLeft: "0.5rem",
                        }}
                    >
                        {timeline.map((evento) => {
                            const dot = evento.dotColor || "#10b981";

                            return (
                                <div key={String(evento.id)} style={{ position: "relative" }}>
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: "-1.45rem",
                                            top: "0.25rem",
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            background: dot,
                                            border: "2px solid rgba(2,6,23,0.9)",
                                        }}
                                    />

                                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem", fontWeight: 800 }}>
                                        {(() => {
                                            const d = new Date(String(evento.criado_em));
                                            // Se a data estiver vindo com 3h a menos (UTC -> Local errado), 
                                            // ou se precisarmos forçar SP, usamos essa lógica:
                                            return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
                                        })()} • {evento.tipo || "-"}
                                    </div>

                                    <div style={{ marginTop: 4, color: "var(--text-main)", fontWeight: 900, fontSize: "0.98rem" }}>
                                        {evento.titulo || "Sem título"}
                                    </div>

                                    {(evento.resumo_ia || evento.transcricao) && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                background: "var(--bg-panel)",
                                                border: "1px solid rgba(148,163,184,0.12)",
                                                padding: "0.75rem",
                                                borderRadius: 14,
                                                fontSize: "0.88rem",
                                                color: "var(--text-main)",
                                                whiteSpace: "pre-wrap",
                                            }}
                                        >
                                            {evento.resumo_ia || evento.transcricao}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};