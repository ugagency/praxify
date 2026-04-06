import React, { useRef, useState } from "react";
import type { ClienteFormState } from "../types/clientes.types";
import { Grid2, Input, Section } from "./ClienteModalUI";
import { extrairDadosDocumento } from "../../../services/ia.ocr";

export const ClienteModalTabDados: React.FC<{
    form: ClienteFormState;
    onChange: (next: ClienteFormState) => void;
    onSubmit: (e: React.FormEvent) => void;

    expPessoais: boolean;
    setExpPessoais: React.Dispatch<React.SetStateAction<boolean>>;
    expContato: boolean;
    setExpContato: React.Dispatch<React.SetStateAction<boolean>>;
    expEndereco: boolean;
    setExpEndereco: React.Dispatch<React.SetStateAction<boolean>>;
    expGov: boolean;
    setExpGov: React.Dispatch<React.SetStateAction<boolean>>;
    expObservacao: boolean;
    setExpObservacao: React.Dispatch<React.SetStateAction<boolean>>;
    
}> = ({
    form,
    onChange,
    onSubmit,
    expPessoais,
    setExpPessoais,
    expContato,
    setExpContato,
    expEndereco,
    setExpEndereco,
    expGov,
    setExpGov,
    expObservacao,
    setExpObservacao,
}) => {
        const ocrInputRef = useRef<HTMLInputElement>(null);
        const [ocrLoading, setOcrLoading] = useState(false);
        const [ocrError, setOcrError] = useState<string | null>(null);

        const handleOcrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            e.target.value = "";
            setOcrError(null);
            setOcrLoading(true);
            try {
                const dados = await extrairDadosDocumento(file);
                onChange({
                    ...form,
                    nome: dados.nome || form.nome,
                    cpf_cnpj: dados.cpf_cnpj || form.cpf_cnpj,
                    email: dados.email || form.email,
                    celular: dados.celular || form.celular,
                    contato_fixo: dados.contato_fixo || form.contato_fixo,
                    cep: dados.cep || form.cep,
                    endereco: dados.endereco || form.endereco,
                    numero: dados.numero || form.numero,
                    complemento: dados.complemento || form.complemento,
                    bairro: dados.bairro || form.bairro,
                    cidade: dados.cidade || form.cidade,
                    estado: dados.estado || form.estado,
                });
                setExpPessoais(true);
                if (dados.email || dados.celular || dados.contato_fixo) setExpContato(true);
                if (dados.cep || dados.endereco || dados.cidade) setExpEndereco(true);
            } catch (err: any) {
                setOcrError(err?.message || "Erro ao processar documento.");
            } finally {
                setOcrLoading(false);
            }
        };

        return (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                {/* OCR — importar dados de documento */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.65rem 0.9rem",
                    borderRadius: 10,
                    border: "1px dashed rgba(16,185,129,0.4)",
                    background: "rgba(16,185,129,0.05)",
                    flexWrap: "wrap",
                }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", flex: 1, minWidth: 160 }}>
                        Preencher automaticamente a partir de uma procuração ou documento
                    </span>
                    <button
                        type="button"
                        disabled={ocrLoading}
                        onClick={() => ocrInputRef.current?.click()}
                        style={{
                            padding: "0.38rem 0.85rem",
                            borderRadius: 8,
                            border: "1px solid rgba(16,185,129,0.5)",
                            background: ocrLoading ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            cursor: ocrLoading ? "not-allowed" : "pointer",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {ocrLoading ? "Analisando…" : "Importar documento"}
                    </button>
                    <input
                        ref={ocrInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={handleOcrFile}
                        style={{ display: "none" }}
                    />
                    {ocrError && (
                        <span style={{ width: "100%", fontSize: "0.78rem", color: "#f87171" }}>{ocrError}</span>
                    )}
                </div>
                <Section
                    title="Dados pessoais"
                    subtitle="Identificação principal do cliente"
                    open={expPessoais}
                    onToggle={() => setExpPessoais((v) => !v)}
                >
                    <Grid2>
                        <Input label="Nome completo *" required value={form.nome} onValue={(v) => onChange({ ...form, nome: v })} />
                        <Input label="CPF/CNPJ" value={form.cpf_cnpj} onValue={(v) => onChange({ ...form, cpf_cnpj: v })} placeholder="Opcional" />
                    </Grid2>

                    <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", fontWeight: 750 }}>
                        Dica: pode colar com ou sem pontuação — salvamos apenas os números.
                    </div>
                </Section>

                <Section
                    title="Contato"
                    subtitle="Telefone(s) e e-mail"
                    open={expContato}
                    onToggle={() => setExpContato((v) => !v)}
                >
                    <Grid2>
                        <Input label="Celular" value={form.celular} onValue={(v) => onChange({ ...form, celular: v })} placeholder="(00) 00000-0000" />
                        <Input label="Contato fixo" value={form.contato_fixo} onValue={(v) => onChange({ ...form, contato_fixo: v })} placeholder="(00) 0000-0000" />
                        <Input label="Contato comercial" value={form.contato_comercial} onValue={(v) => onChange({ ...form, contato_comercial: v })} placeholder="(00) 0000-0000" />
                        <Input label="E-mail" type="email" value={form.email} onValue={(v) => onChange({ ...form, email: v })} placeholder="email@dominio.com" />
                    </Grid2>
                </Section>

                <Section
                    title="Endereço"
                    subtitle="Dados de endereço do cliente"
                    open={expEndereco}
                    onToggle={() => setExpEndereco((v) => !v)}
                >
                    <Grid2>
                        <Input label="CEP" value={form.cep} onValue={(v) => onChange({ ...form, cep: v })} placeholder="00000-000" />
                        <Input label="Estado" value={form.estado} onValue={(v) => onChange({ ...form, estado: v })} placeholder="UF" />
                    </Grid2>

                    <Input label="Endereço" value={form.endereco} onValue={(v) => onChange({ ...form, endereco: v })} placeholder="Rua / Av..." />

                    <Grid2>
                        <Input label="Número" value={form.numero} onValue={(v) => onChange({ ...form, numero: v })} placeholder="123" />
                        <Input label="Complemento" value={form.complemento} onValue={(v) => onChange({ ...form, complemento: v })} placeholder="Apto, bloco..." />
                    </Grid2>

                    <Grid2>
                        <Input label="Bairro" value={form.bairro} onValue={(v) => onChange({ ...form, bairro: v })} />
                        <Input label="Cidade" value={form.cidade} onValue={(v) => onChange({ ...form, cidade: v })} />
                    </Grid2>
                </Section>
                <Section
                    title="Acesso Gov.br"
                    subtitle="Credenciais de acesso ao portal do governo"
                    open={expGov}
                    onToggle={() => setExpGov(!expGov)}
                >
                    <Grid2>
                        <Input label="E-mail Gov" value={form.email_gov} onValue={(v) => onChange({ ...form, email_gov: v })} placeholder="gov@exemplo.com" />
                        <Input label="Senha Gov" value={form.senha_gov} onValue={(v) => onChange({ ...form, senha_gov: v })} placeholder="******" />
                    </Grid2>
                </Section>

                <Section
                    title="Observações"
                    subtitle="Anotações internas sobre o atendimento"
                    open={expObservacao}
                    onToggle={() => setExpObservacao(!expObservacao)}
                >
                    <textarea
                        value={form.observacao}
                        onChange={(e) => onChange({ ...form, observacao: e.target.value })}
                        placeholder="Observações internas sobre o cliente..."
                        style={{
                            width: "100%",
                            minHeight: 120,
                            borderRadius: 12,
                            fontSize: "0.9rem",
                            background: "rgba(2,6,23,0.3)",
                            border: "1px solid rgba(148,163,184,0.2)",
                            color: "var(--text-main)",
                            padding: "0.85rem",
                            outline: "none",
                            fontFamily: "inherit",
                            resize: "vertical",
                            boxSizing: "border-box",
                        }}
                    />
                </Section>



                {/* submit invisível acionado pelo footer do modal */}
                <button id="cliente-modal-submit" type="submit" style={{ display: "none" }} />
            </form>
        );
    };