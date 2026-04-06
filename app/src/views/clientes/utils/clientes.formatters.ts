export const formatarCpfCnpj = (valor: string | null) => {
    if (!valor) return "";
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length === 11) {
        return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    if (limpo.length === 14) {
        return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }
    return valor;
};

export const formatarCelular = (valor: string | null) => {
    if (!valor) return "";
    const limpo = valor.replace(/\D/g, "");
    if (limpo.length === 11) {
        return limpo.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    }
    if (limpo.length === 10) {
        return limpo.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return valor;
};

export const normalizarDoc = (valor: string | null) => (valor ? valor.replace(/\D/g, "") : "");

export const formatarData = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString();
};