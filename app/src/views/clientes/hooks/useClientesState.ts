import { useEffect, useState } from "react";
import type { Cliente, ClienteFormState } from "../types/clientes.types";
import { formatarCpfCnpj } from "../utils/clientes.formatters";

type ModalState = {
    open: boolean;
    cliente: Cliente | null;
};

const emptyForm: ClienteFormState = {
    nome: "",
    cpf_cnpj: "",

    celular: "",
    contato_fixo: "",
    contato_comercial: "",
    email: "",

    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    numero: "",
    complemento: "",
    email_gov: "",
    senha_gov: "",
    observacao: "",
};

export function useClientesState() {
    const [busca, setBusca] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [modal, setModal] = useState<ModalState>({ open: false, cliente: null });
    const [form, setForm] = useState<ClienteFormState>(emptyForm);

    const openModal = (cliente: Cliente | null) => {
        if (cliente) {
            setModal({ open: true, cliente });
            setForm({
                nome: cliente.nome ?? "",
                cpf_cnpj: formatarCpfCnpj(cliente.cpf_cnpj),

                celular: cliente.celular ?? "",
                contato_fixo: cliente.contato_fixo ?? "",
                contato_comercial: cliente.contato_comercial ?? "",
                email: cliente.email ?? "",

                cep: cliente.cep ?? "",
                endereco: cliente.endereco ?? "",
                bairro: cliente.bairro ?? "",
                cidade: cliente.cidade ?? "",
                estado: cliente.estado ?? "",
                numero: cliente.numero ?? "",
                complemento: cliente.complemento ?? "",
                email_gov: cliente.email_gov ?? "",
                senha_gov: cliente.senha_gov ?? "",
                observacao: cliente.observacao ?? "",
            });
        } else {
            setModal({ open: true, cliente: null });
            setForm(emptyForm);
        }
    };

    const closeModal = () => {
        setModal({ open: false, cliente: null });
    };

    useEffect(() => {
        setPage(1);
    }, [busca]);

    return {
        busca,
        setBusca,
        page,
        setPage,
        pageSize,
        modal,
        form,
        setForm,
        openModal,
        closeModal,
    };
}