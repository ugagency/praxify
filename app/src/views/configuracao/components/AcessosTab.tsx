import React, { useEffect, useState, useMemo } from 'react';
import { getClient } from '../../../services/supabase';
import { useAppStore } from '../../../core/store';
import { showAlert } from '../../../utils/alert';
import { confirmDark, notifyDark } from '../../prazos/utils/alerts';

export interface GrupoAcesso {
    id: string;
    escritorio_id: number;
    nome: string;
    descricao: string;
    status: string;
    quantidade_usuarios?: number;
}

export interface Permissao {
    id: string;
    modulo: string;
    chave: string;
    nome: string;
    descricao: string;
}

export const AcessosTab: React.FC = () => {
    const { escritorio } = useAppStore();
    const client = useMemo(() => getClient(), []);

    const [grupos, setGrupos] = useState<GrupoAcesso[]>([]);
    const [permissoesCatalogue, setPermissoesCatalogue] = useState<Permissao[]>([]);

    // UI State
    const [loading, setLoading] = useState(false);
    const [selectedGrupo, setSelectedGrupo] = useState<GrupoAcesso | null>(null);
    const [grupoPermissoesList, setGrupoPermissoesList] = useState<string[]>([]); // id das permissões que o grupo tem
    const [isPermissoesModalOpen, setIsPermissoesModalOpen] = useState(false);

    // Expanded state
    const [expandedModulos, setExpandedModulos] = useState<Record<string, boolean>>({});

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formGrupo, setFormGrupo] = useState<Partial<GrupoAcesso>>({ nome: '', descricao: '' });
    const [savingGrupo, setSavingGrupo] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;

    useEffect(() => {
        if (!escritorio?.id) return;
        carregarTudo();
    }, [escritorio?.id]);

    async function carregarTudo() {
        setLoading(true);
        try {
            await Promise.all([carregarGrupos(), carregarCatalogoPermissoes()]);
        } catch (error) {
            console.error(error);
            showAlert('Erro', 'Não foi possível carregar os dados de acesso.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function carregarGrupos() {
        if (!escritorio?.id) return;

        // Pega os grupos
        const { data: gruposData, error: gruposError } = await client
            .from('grupos_acesso')
            .select('*')
            .eq('escritorio_id', escritorio.id)
            .order('nome');

        if (gruposError) throw gruposError;

        // Tenta pegar a contagem de usuarios se a tabela estiver ligada
        const { data: usersData, error: usersError } = await client
            .from('Jur_Usuarios')
            .select('grupo_acesso_id')
            .eq('escritorio_id', escritorio.id)
            .not('grupo_acesso_id', 'is', null);

        if (usersError && usersError.code !== '42703') { // 42703 = column does not exist
            console.warn("Nao foi possível contar usuarios", usersError);
        }

        const counts: Record<string, number> = {};
        if (usersData) {
            usersData.forEach((u) => {
                if (u.grupo_acesso_id) {
                    counts[u.grupo_acesso_id] = (counts[u.grupo_acesso_id] || 0) + 1;
                }
            });
        }

        const mappedGrupos = (gruposData || []).map(g => ({
            ...g,
            quantidade_usuarios: counts[g.id] || 0
        }));

        setGrupos(mappedGrupos as GrupoAcesso[]);

        if (selectedGrupo) {
            const updated = mappedGrupos.find(g => g.id === selectedGrupo.id);
            if (updated) setSelectedGrupo(updated);
            else setSelectedGrupo(null);
        }
    }

    async function carregarCatalogoPermissoes() {
        const { data, error } = await client
            .from('permissoes')
            .select('*')
            .order('modulo');

        if (error) throw error;
        setPermissoesCatalogue((data || []) as Permissao[]);
    }

    async function carregarPermissoesDoGrupo(grupoId: string) {
        setLoading(true);
        try {
            const { data, error } = await client
                .from('grupo_permissoes')
                .select('permissao_id')
                .eq('grupo_id', grupoId);

            if (error) throw error;

            setGrupoPermissoesList((data || []).map(p => p.permissao_id));
        } catch (error) {
            console.error(error);
            showAlert('Erro', 'Não foi possível carregar as permissões do grupo.', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleGerenciarPermissoes(grupo: GrupoAcesso, e: React.MouseEvent) {
        e.stopPropagation();
        setSelectedGrupo(grupo);

        // Open all sections by default
        const initialExpanded: Record<string, boolean> = {};
        for (const p of permissoesCatalogue) {
            initialExpanded[p.modulo] = true;
        }
        setExpandedModulos(initialExpanded);

        await carregarPermissoesDoGrupo(grupo.id);
        setIsPermissoesModalOpen(true);
    }

    const toggleModulo = (modulo: string) => {
        setExpandedModulos(prev => ({
            ...prev,
            [modulo]: !prev[modulo]
        }));
    };

    // Modal Grupo
    function abrirNovoGrupo() {
        setFormGrupo({ nome: '', descricao: '' });
        setIsModalOpen(true);
    }

    function abrirEdicaoGrupo(grupo: GrupoAcesso, e: React.MouseEvent) {
        e.stopPropagation();
        setFormGrupo({ id: grupo.id, nome: grupo.nome, descricao: grupo.descricao || '' });
        setIsModalOpen(true);
    }

    async function inativarGrupo(grupo: GrupoAcesso, e: React.MouseEvent) {
        e.stopPropagation();
        const ok = await confirmDark({
            title: 'Inativar Grupo?',
            text: `Deseja inativar o grupo "${grupo.nome}"?`,
            confirmText: 'Sim, inativar',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await client
                .from('grupos_acesso')
                .update({ status: 'inativo' })
                .eq('id', grupo.id);

            if (error) throw error;
            
            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Grupo inativado.' });
            await carregarGrupos();
            if (selectedGrupo?.id === grupo.id) setSelectedGrupo(null);
        } catch {
            await notifyDark({ icon: 'error', title: 'Erro', text: 'Não foi possível inativar o grupo.' });
        }
    }

    async function ativarGrupo(grupo: GrupoAcesso, e: React.MouseEvent) {
        e.stopPropagation();
        const ok = await confirmDark({
            title: 'Ativar Grupo?',
            text: `Deseja ativar o grupo "${grupo.nome}"?`,
            confirmText: 'Sim, ativar',
        });
        if (!ok) return;

        try {
            const { error } = await client
                .from('grupos_acesso')
                .update({ status: 'ativo' })
                .eq('id', grupo.id);

            if (error) throw error;
            
            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Grupo ativado com sucesso.' });
            await carregarGrupos();
            if (selectedGrupo?.id === grupo.id) setSelectedGrupo({ ...selectedGrupo, status: 'ativo' });
        } catch {
            await notifyDark({ icon: 'error', title: 'Erro', text: 'Não foi possível ativar o grupo.' });
        }
    }

    async function excluirGrupo(grupo: GrupoAcesso, e: React.MouseEvent) {
        e.stopPropagation();
        const ok = await confirmDark({
            title: 'Excluir Grupo?',
            text: `ATENÇÃO: Deseja realmente excluir o grupo "${grupo.nome}"? Esta ação não pode ser desfeita.`,
            confirmText: 'Sim, excluir',
            danger: true
        });
        if (!ok) return;

        try {
            const { error } = await client
                .from('grupos_acesso')
                .delete()
                .eq('id', grupo.id);

            if (error) throw error;
            
            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Grupo excluído com sucesso.' });
            await carregarGrupos();
            if (selectedGrupo?.id === grupo.id) setSelectedGrupo(null);
        } catch (error: unknown) {
            const err = error as { message?: string };
            console.error(err);
            if (err?.message && err.message.includes('foreign key constraint')) {
                await notifyDark({ icon: 'error', title: 'Atenção', text: 'Não é possível excluir o grupo, pois existem usuários vinculados a ele.' });
            } else {
                await notifyDark({ icon: 'error', title: 'Erro', text: 'Não foi possível excluir o grupo.' });
            }
        }
    }

    async function salvarGrupo(e: React.FormEvent) {
        e.preventDefault();
        if (!escritorio?.id) return;
        if (!formGrupo.nome?.trim()) {
            showAlert('Atenção', 'O nome do grupo é obrigatório', 'warning');
            return;
        }

        setSavingGrupo(true);
        try {
            if (formGrupo.id) {
                // update
                const { error } = await client
                    .from('grupos_acesso')
                    .update({ nome: formGrupo.nome, descricao: formGrupo.descricao })
                    .eq('id', formGrupo.id);
                if (error) throw error;
                showAlert('Sucesso', 'Grupo atualizado.', 'success');
            } else {
                // create
                const { error } = await client
                    .from('grupos_acesso')
                    .insert([{
                        escritorio_id: escritorio.id,
                        nome: formGrupo.nome,
                        descricao: formGrupo.descricao,
                        status: 'ativo'
                    }]);
                if (error) throw error;
                showAlert('Sucesso', 'Grupo criado.', 'success');
            }
            setIsModalOpen(false);
            await carregarGrupos();
        } catch (error) {
            console.error(error);
            showAlert('Erro', 'Erro ao salvar grupo.', 'error');
        } finally {
            setSavingGrupo(false);
        }
    }

    // Permissoes Update
    async function togglePermissao(permissaoId: string, checked: boolean) {
        if (!selectedGrupo) return;

        try {
            if (checked) {
                // Add
                setGrupoPermissoesList(prev => [...prev, permissaoId]);
                const { error } = await client
                    .from('grupo_permissoes')
                    .insert([{ grupo_id: selectedGrupo.id, permissao_id: permissaoId }]);
                if (error) throw error;
            } else {
                // Remove
                setGrupoPermissoesList(prev => prev.filter(id => id !== permissaoId));
                const { error } = await client
                    .from('grupo_permissoes')
                    .delete()
                    .eq('grupo_id', selectedGrupo.id)
                    .eq('permissao_id', permissaoId);
                if (error) throw error;
            }
        } catch (err) {
            console.error(err);
            showAlert('Erro', 'Erro ao alterar permissão.', 'error');
            await carregarPermissoesDoGrupo(selectedGrupo.id); // revert local state on error
        }
    }

    useEffect(() => {
        setPaginaAtual(1);
    }, [searchTerm]);

    // Grouping Permissoes
    const filteredGrupos = useMemo(() => {
        if (!searchTerm.trim()) return grupos;
        const low = searchTerm.toLowerCase();
        return grupos.filter(g => 
            g.nome.toLowerCase().includes(low) || 
            (g.descricao || '').toLowerCase().includes(low)
        );
    }, [grupos, searchTerm]);

    const totalItens = filteredGrupos.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    const paginaClamp = Math.min(Math.max(paginaAtual, 1), totalPaginas);

    const itensPaginados = useMemo(() => {
        const inicio = (paginaClamp - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return filteredGrupos.slice(inicio, fim);
    }, [filteredGrupos, paginaClamp, itensPorPagina]);

    const buildPaginationModel = (total: number, current: number) => {
        const pages: (number | '...')[] = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }
        pages.push(1);
        if (current > 3) pages.push('...');
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    };

    const rangeInfo = {
        start: totalItens === 0 ? 0 : (paginaClamp - 1) * itensPorPagina + 1,
        end: Math.min(paginaClamp * itensPorPagina, totalItens),
        total: totalItens
    };

    const pageModel = useMemo(() => buildPaginationModel(totalPaginas, paginaClamp), [totalPaginas, paginaClamp]);

    const modulosMap = useMemo(() => {
        const map: Record<string, Permissao[]> = {};
        for (const p of permissoesCatalogue) {
            if (!map[p.modulo]) map[p.modulo] = [];
            map[p.modulo].push(p);
        }
        return map;
    }, [permissoesCatalogue]);

    const cellBase: React.CSSProperties = {
    padding: '0.65rem 0.85rem',
    background: 'var(--bg-darker)',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
    lineHeight: 1.25
    };

    // Estilos baseados no ClienteModal
    const modalStyles = {
        overlay: {
            position: "fixed" as const,
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "1.25rem",
        },
        cardStyle: {
            width: "100%",
            maxWidth: 620,
            background: "var(--bg-darker)",
            border: "1px solid var(--border-color)",
            maxHeight: "80vh",
            overflow: "hidden" as const,
            display: "flex" as const,
            flexDirection: "column" as const,
            borderRadius: 14,
        },
        header: {
            padding: "1rem 1rem 0.75rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
        },
        title: {
            margin: 0,
            color: "var(--text-main)",
            fontSize: "1.05rem",
            fontWeight: 800,
        },
        subtitle: {
            margin: "0.35rem 0 0 0",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
        },
        closeBtn: {
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface)",
            color: "var(--text-main)",
            width: 36,
            height: 36,
            borderRadius: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
        },
        contentStyle: {
            flex: 1,
            overflowY: "auto" as const,
            padding: "1rem",
            scrollbarGutter: "stable" as const,
            display: "flex",
            flexDirection: "column" as const,
            gap: "1rem"
        },
        footerStyle: {
            display: "flex",
            gap: "0.75rem",
            padding: "0.85rem 1rem",
            borderTop: "1px solid var(--border-color)",
            background: "var(--bg-darker)",
        },
        btnCancel: {
            flex: "1 1 auto",
            padding: "0.62rem",
            borderRadius: "0.6rem",
            fontWeight: 900,
            background: "transparent",
            border: "1px solid var(--border-color)",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: "0.85rem"
        },
        btnConfirm: {
            flex: "1 1 200px",
            padding: "0.62rem",
            borderRadius: "0.6rem",
            fontWeight: 900,
            background: "var(--success)",
            border: "none",
            color: "var(--text-main)",
            cursor: "pointer",
            fontSize: "0.85rem"
        },
        label: {
            color: "var(--text-muted)",
            fontSize: "0.78rem",
            fontWeight: 650,
            marginBottom: "0.4rem",
            display: "block"
        },
        input: {
            width: "100%",
            padding: "0.58rem 0.7rem",
            background: "var(--bg-panel)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.55rem",
            outline: "none",
            fontSize: "0.86rem",
            boxSizing: "border-box" as const,
        },
        textarea: {
            width: "100%",
            padding: "0.58rem 0.7rem",
            background: "var(--bg-panel)",
            color: "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "0.55rem",
            outline: "none",
            fontSize: "0.86rem",
            boxSizing: "border-box" as const,
            resize: "vertical" as const,
            minHeight: "80px",
        },
        sectionCard: {
            border: "1px solid var(--border-color)",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--bg-surface)",
        },
        sectionBtn: {
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
            textAlign: "left" as const,
        }
    };

    return (
        <div className="animation-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header Section */}
            <div
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>🔐 Gestão de Acessos</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>
                        Grupos de usuários e permissões do sistema.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Pesquisar grupos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.58rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-darker)',
                            color: 'var(--text-main)',
                            width: '260px',
                            fontSize: '0.88rem'
                        }}
                    />
                    <button
                        onClick={abrirNovoGrupo}
                        style={{
                            padding: "0.58rem 1.25rem",
                            borderRadius: 12,
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-surface)",
                            color: "var(--text-main)",
                            cursor: "pointer",
                            fontWeight: 650,
                            whiteSpace: "nowrap",
                        }}
                    >
                        + Novo Grupo
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div
                className="card"
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    padding: '0.75rem',
                }}
            >
                <div style={{ maxHeight: '62vh', overflowY: 'auto', overflowX: 'auto', paddingRight: '0.25rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', minWidth: 700 }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>Nome do Grupo</th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>Descrição</th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>Usuários</th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>Status</th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.86rem' }}>
                            {loading && grupos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        Carregando grupos...
                                    </td>
                                </tr>
                            ) : grupos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                        Nenhum grupo cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                itensPaginados.map(g => (
                                    <tr
                                        key={g.id}
                                        style={{ transition: 'transform .15s, background .15s' }}
                                        onMouseOver={(e) => {
                                            (e.currentTarget as HTMLTableRowElement).style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseOut={(e) => {
                                            (e.currentTarget as HTMLTableRowElement).style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <td style={{ ...cellBase, color: 'var(--text-main)', borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }}>
                                            {g.nome}
                                        </td>
                                        <td style={{ ...cellBase, color: 'var(--text-main)' }}>
                                            {g.descricao || '-'}
                                        </td>
                                        <td style={{ ...cellBase, color: 'var(--text-muted)' }}>
                                            {g.quantidade_usuarios}
                                        </td>
                                        <td style={{ ...cellBase }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '0.18rem 0.55rem',
                                                borderRadius: '999px',
                                                fontSize: '0.72rem',
                                                fontWeight: 800,
                                                background: g.status === 'ativo' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                                                color: g.status === 'ativo' ? 'var(--success)' : 'var(--danger)',
                                                border: `1px solid ${g.status === 'ativo' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`
                                            }}>
                                                {g.status === 'ativo' ? 'ATIVO' : 'INATIVO'}
                                            </span>
                                        </td>
                                        <td style={{ ...cellBase, borderTopRightRadius: 14, borderBottomRightRadius: 14, textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <button
                                                    title="Permissões"
                                                    onClick={(e) => handleGerenciarPermissoes(g, e)}
                                                    style={{
                                                        width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(168,85,247,0.14)', border: '1px solid rgba(168,85,247,0.28)', color: 'var(--accent)', cursor: 'pointer', transition: 'transform .15s'
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                </button>
                                                <button
                                                    title="Editar"
                                                    onClick={(e) => abrirEdicaoGrupo(g, e)}
                                                    style={{
                                                        width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.28)', color: 'var(--accent)', cursor: 'pointer', transition: 'transform .15s'
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                {g.status === 'ativo' ? (
                                                    <button
                                                        title="Inativar"
                                                        onClick={(e) => inativarGrupo(g, e)}
                                                        style={{
                                                            width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)', color: 'var(--danger)', cursor: 'pointer', transition: 'transform .15s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                    </button>
                                                ) : (
                                                    <button
                                                        title="Ativar"
                                                        onClick={(e) => ativarGrupo(g, e)}
                                                        style={{
                                                            width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.28)', color: 'var(--success)', cursor: 'pointer', transition: 'transform .15s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    </button>
                                                )}
                                                <button
                                                    title="Excluir"
                                                    onClick={(e) => excluirGrupo(g, e)}
                                                    style={{
                                                        width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)', color: 'var(--danger)', cursor: 'pointer', transition: 'transform .15s'
                                                    }}
                                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M3 6h18" />
                                                        <path d="M8 6V4h8v2" />
                                                        <path d="M19 6l-1 14H6L5 6" />
                                                        <path d="M10 11v6" />
                                                        <path d="M14 11v6" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalItens > 0 && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem 0.35rem 0.25rem 0.35rem',
                            color: 'var(--text-muted)',
                            flexWrap: 'wrap',
                            fontSize: '0.85rem',
                            borderTop: '1px solid var(--border-color)',
                            marginTop: '0.5rem'
                        }}
                    >
                        <div>
                            Exibindo{' '}
                            <strong style={{ color: 'var(--text-main)' }}>{rangeInfo.start}</strong>
                            {' - '}
                            <strong style={{ color: 'var(--text-main)' }}>{rangeInfo.end}</strong>{' '}
                            de <strong style={{ color: 'var(--text-main)' }}>{rangeInfo.total}</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                            <button
                                onClick={() => setPaginaAtual(paginaClamp - 1)}
                                disabled={paginaClamp === 1}
                                style={{
                                    width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.05)',
                                    color: paginaAtual === 1 ? 'var(--text-dim)' : '#f3f4f6', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>

                            {pageModel.map((p, idx) =>
                                p === '...' ? (
                                    <span key={`dots-${idx}`} style={{ padding: '0 0.35rem', opacity: 0.7 }}>...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setPaginaAtual(p as number)}
                                        style={{
                                            minWidth: 34, height: 34, padding: '0 0.5rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                                            background: p === paginaClamp ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.05)',
                                            color: p === paginaClamp ? 'var(--accent)' : 'var(--text-main)', cursor: 'pointer', fontWeight: 800
                                        }}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => setPaginaAtual(paginaClamp + 1)}
                                disabled={paginaClamp === totalPaginas}
                                style={{
                                    width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                                    color: paginaAtual === totalPaginas ? 'var(--text-dim)' : '#f3f4f6', cursor: paginaAtual === totalPaginas ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Novo/Editar Grupo */}
            {isModalOpen && (
                <div style={modalStyles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
                    <div style={modalStyles.cardStyle} role="dialog" aria-modal="true" aria-label={formGrupo.id ? 'Editar Grupo' : 'Novo Grupo'}>
                        <div style={modalStyles.header}>
                            <div>
                                <h3 style={modalStyles.title}>{formGrupo.id ? 'Editar Grupo' : 'Novo Grupo'}</h3>
                                <p style={modalStyles.subtitle}>Preencha os dados abaixo para salvar o grupo.</p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} style={modalStyles.closeBtn} aria-label="Fechar">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={salvarGrupo} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div style={modalStyles.contentStyle}>
                                <div style={modalStyles.sectionCard}>
                                    <div style={{ ...modalStyles.sectionBtn, borderBottom: "1px solid var(--border-color)", cursor: 'default' }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span>▸</span>
                                                <span>Dados base</span>
                                            </div>
                                            <div style={{ color: "var(--text-muted)", fontWeight: 750, fontSize: "0.82rem", marginTop: 4 }}>
                                                Identificação do grupo
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.95rem" }}>
                                        <div>
                                            <label style={modalStyles.label}>Nome do Grupo *</label>
                                            <input
                                                type="text"
                                                value={formGrupo.nome}
                                                onChange={e => setFormGrupo(prev => ({ ...prev, nome: e.target.value }))}
                                                placeholder="Ex: Advogados Sênior"
                                                style={modalStyles.input}
                                                autoFocus
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label style={modalStyles.label}>Descrição</label>
                                            <textarea
                                                value={formGrupo.descricao}
                                                onChange={e => setFormGrupo(prev => ({ ...prev, descricao: e.target.value }))}
                                                placeholder="Descrição das permissões..."
                                                style={modalStyles.textarea}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={modalStyles.footerStyle}>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={modalStyles.btnCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingGrupo}
                                    style={{ ...modalStyles.btnConfirm, opacity: savingGrupo ? 0.85 : 1 }}
                                >
                                    {savingGrupo ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Permissões */}
            {isPermissoesModalOpen && selectedGrupo && (
                <div style={modalStyles.overlay} onMouseDown={(e) => { if (e.target === e.currentTarget) setIsPermissoesModalOpen(false); }}>
                    <div style={modalStyles.cardStyle} role="dialog" aria-modal="true" aria-label={`Permissões: ${selectedGrupo.nome}`}>

                        <div style={modalStyles.header}>
                            <div>
                                <h3 style={modalStyles.title}>Editar Permissões</h3>
                                <p style={modalStyles.subtitle}>
                                    Grupo: {selectedGrupo.nome} ({selectedGrupo.status === 'ativo' ? 'Ativo' : 'Inativo'})
                                </p>
                            </div>
                            <button type="button" onClick={() => setIsPermissoesModalOpen(false)} style={modalStyles.closeBtn} aria-label="Fechar">
                                ✕
                            </button>
                        </div>

                        <div style={modalStyles.contentStyle}>
                            {loading ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Carregando permissões...</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {Object.entries(modulosMap).map(([modulo, permissoes]) => (
                                        <div key={modulo} style={modalStyles.sectionCard}>
                                            <button
                                                type="button"
                                                style={modalStyles.sectionBtn}
                                                onClick={() => toggleModulo(modulo)}
                                            >
                                                <div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <span style={{ opacity: 0.9 }}>{expandedModulos[modulo] ? "▾" : "▸"}</span>
                                                        <span>Módulo: {modulo}</span>
                                                    </div>
                                                </div>
                                            </button>

                                            {expandedModulos[modulo] && (
                                                <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                                    {permissoes.map(p => {
                                                        const hasPerm = grupoPermissoesList.includes(p.id);
                                                        return (
                                                            <label
                                                                key={p.id}
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    gap: '0.75rem',
                                                                    padding: '0.65rem 0.5rem',
                                                                    cursor: selectedGrupo.status === 'inativo' ? 'not-allowed' : 'pointer',
                                                                }}
                                                            >
                                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                                    <div style={{ color: "var(--text-main)", fontSize: "0.86rem", fontWeight: 700, textTransform: 'capitalize' }}>
                                                                        {p.nome}
                                                                    </div>
                                                                    <div style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                                                                        {p.descricao}
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={hasPerm}
                                                                        disabled={selectedGrupo.status === 'inativo'}
                                                                        onChange={(e) => togglePermissao(p.id, e.target.checked)}
                                                                        style={{
                                                                            width: '18px',
                                                                            height: '18px',
                                                                            cursor: 'pointer',
                                                                            accentColor: '#10b981'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={modalStyles.footerStyle}>
                            <button
                                onClick={() => setIsPermissoesModalOpen(false)}
                                style={modalStyles.btnConfirm}
                            >
                                Fechar e Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
