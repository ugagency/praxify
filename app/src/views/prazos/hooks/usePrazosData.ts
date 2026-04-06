import { useEffect, useState } from 'react';

import { getPrazos, getCompromissos, completePrazo, remove, getUsuarios, getProcessos } from '../../../services/supabase';
import { confirmDark, notifyDark } from '../utils/alerts';

export interface Prazo {
    id: number;
    processo: string;
    tarefa: string;
    responsavel: string;
    data_fatal: string;
    status: string;
    data_conclusao?: string;
    tipo?: boolean;
}

type Props = {
    escritorio: any;
};

export const usePrazosData = ({ escritorio }: Props) => {
    const [prazos, setPrazos] = useState<Prazo[]>([]);
    const [loading, setLoading] = useState(true);

    // Mantidos para compatibilidade com sua tela (mesmo que você não use agora)
    const [usuarios, setUsuarios] = useState<{ id: string | number; nome: string }[]>([]);
    const [processosList, setProcessosList] = useState<any[]>([]);

    const carregarDados = async () => {
        if (!escritorio) return;
        setLoading(true);

        try {
            const { data: prazosData, error: prazosError } = await getPrazos<Prazo>();
            if (prazosError) throw prazosError;

            const { data: compromissosData, error: compromissosError } = await getCompromissos<Prazo>();
            if (compromissosError) throw compromissosError;

            const prazosList = (prazosData || []).map(p => ({ ...p, tipo: true }));
            const compromissosList = (compromissosData || []).map(p => ({ ...p, tipo: false }));

            setPrazos([...prazosList, ...compromissosList]);

            const { data: users } = await getUsuarios<{ id: string | number; nome: string }>(String(escritorio.id));
            setUsuarios(users || []);

            const { data: procs } = await getProcessos();
            setProcessosList(procs || []);
        } catch (e) {
            console.error(e);
            await notifyDark({
                icon: 'error',
                title: 'Erro ao carregar',
                text: 'Não foi possível carregar os prazos. Tente novamente.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [escritorio]);

    const concluirPrazo = async (id: number) => {
        const ok = await confirmDark({
            title: 'Concluir prazo?',
            text: 'Isso marcará o prazo como FEITO.',
            confirmText: 'Sim, concluir',
        });
        if (!ok) return;

        try {
            const { error } = await completePrazo(id);
            if (error) throw error;

            await notifyDark({
                icon: 'success',
                title: 'Concluído!',
                text: 'O prazo foi marcado como FEITO.',
            });

            await carregarDados();
        } catch (e) {
            console.error(e);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível concluir o prazo.',
            });
        }
    };

    const excluirPrazo = async (id: number) => {
        const ok = await confirmDark({
            title: 'Excluir prazo?',
            text: 'Essa ação não pode ser desfeita.',
            confirmText: 'Sim, excluir',
            danger: true,
        });
        if (!ok) return;

        try {
            const { error } = await remove('Jur_Prazos', id);
            if (error) throw error;

            await notifyDark({
                icon: 'success',
                title: 'Excluído!',
                text: 'O prazo foi removido com sucesso.',
            });

            await carregarDados();
        } catch (e) {
            console.error(e);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: 'Não foi possível excluir o prazo.',
            });
        }
    };

    return {
        loading,
        prazos,
        usuarios,
        processosList,
        reload: carregarDados,
        concluirPrazo,
        excluirPrazo,
    };
};