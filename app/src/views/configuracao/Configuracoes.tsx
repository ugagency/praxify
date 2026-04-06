import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../core/store';
import { getClient, uploadArquivo } from '../../services/supabase';
import { showAlert } from '../../utils/alert';
import { confirmDark, notifyDark } from '../prazos/utils/alerts';

import { ConfigTabs, ConfigTabId } from './components/ConfigTabs';
import { IdentidadeTab } from './components/IdentidadeTab';
import { EscritorioTab } from './components/EscritorioTab';
import { EquipeTab } from './components/EquipeTab';
import { AcessosTab } from './components/AcessosTab';
import { DevTab } from './components/DevTab';

// ===============================
// Tipagens
// ===============================

export interface Usuario {
    id: string;
    escritorio_id: number;
    nome: string;
    email: string;
    role: string;
    criado_em?: string | null;
    ativo?: boolean;
    grupo_acesso_id?: string | null;
}

export interface FormEscritorio {
    nome: string;
    cnpj: string;
    endereco: string;
}

export interface FormUsuario {
    id?: string;
    nome: string;
    email: string;
    role: string;
    grupo_acesso_id?: string;
}

export type ModalMode = 'create' | 'edit';

// ===============================
// Constantes
// ===============================

const INITIAL_FORM_ESCRITORIO: FormEscritorio = {
    nome: '',
    cnpj: '',
    endereco: ''
};

const INITIAL_FORM_USUARIO: FormUsuario = {
    nome: '',
    email: '',
    role: 'ADVOGADO',
    grupo_acesso_id: ''
};

// ===============================
// Componente principal
// ===============================

export const Configuracoes: React.FC = () => {
    const { escritorio } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<ConfigTabId>('identidade');

    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [loadingLogo, setLoadingLogo] = useState(false);

    const [formEsc, setFormEsc] = useState<FormEscritorio>(INITIAL_FORM_ESCRITORIO);
    const [savingEsc, setSavingEsc] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(false);

    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [formUser, setFormUser] = useState<FormUsuario>(INITIAL_FORM_USUARIO);
    const [searchTermUsers, setSearchTermUsers] = useState('');
    const [paginaAtualUsers, setPaginaAtualUsers] = useState(1);
    const itensPorPagina = 10;

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [userToReset, setUserToReset] = useState<Usuario | null>(null);
    const [passwordResetForm, setPasswordResetForm] = useState({ password: '', confirm: '' });
    const [savingReset, setSavingReset] = useState(false);

    const client = useMemo(() => getClient(), []);

    useEffect(() => {
        if (!escritorio?.id) return;
        carregarDadosIniciais();
    }, [escritorio?.id]);

    useEffect(() => {
        setPaginaAtualUsers(1);
    }, [searchTermUsers]);

    async function carregarDadosIniciais() {
        if (!escritorio?.id) return;

        setLoadingConfig(true);

        try {
            await Promise.all([carregarEscritorio(), carregarLogo(), carregarUsuarios()]);
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            showAlert('Erro', 'Não foi possível carregar as configurações.', 'error');
        } finally {
            setLoadingConfig(false);
        }
    }

    async function carregarEscritorio() {
        if (!escritorio?.id) return;

        const { data, error } = await client
            .from('Jur_Escritorios')
            .select('*')
            .eq('id', escritorio.id)
            .single();

        if (error) throw error;

        setFormEsc({
            nome: data?.nome || '',
            cnpj: data?.cnpj || '',
            endereco: data?.endereco || ''
        });
    }

    async function carregarLogo() {
        if (!escritorio?.id) return;

        const { data, error } = await client
            .from('Jur_Arquivos')
            .select('url')
            .eq('escritorio_id', escritorio.id)
            .eq('descricao', 'LOGO_OFICIAL')
            .order('criado_em', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        setLogoUrl(data?.url || null);
    }

    async function carregarUsuarios() {
        if (!escritorio?.id) return;

        setLoadingUsers(true);

        try {
            const { data, error } = await client
                .from('Jur_Usuarios')
                .select('*')
                .eq('escritorio_id', escritorio.id)
                .order('nome', { ascending: true });

            if (error) throw error;

            setUsuarios((data || []) as Usuario[]);
        } catch (error: unknown) {
            console.error(error);
            showAlert('Erro', 'Não foi possível carregar os usuários.', 'error');
        } finally {
            setLoadingUsers(false);
        }
    }

    async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file || !escritorio?.id) return;

        setLoadingLogo(true);

        try {
            const meta = {
                escritorio_id: escritorio.id,
                processo: null,
                usuario_id: null,
                tipo: 'IMAGEM',
                descricao: 'LOGO_OFICIAL'
            };

            const { data, error } = await uploadArquivo(file, meta);

            if (error) throw error;

            if (data?.url) {
                setLogoUrl(data.url as string);
            }

            showAlert('Sucesso', 'Logo atualizada com sucesso!', 'success');
        } catch (error: unknown) {
            console.error('Erro ao enviar logo:', error);
            showAlert('Erro', (error as Error)?.message || 'Erro ao atualizar a logo.', 'error');
        } finally {
            setLoadingLogo(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    async function salvarEscritorio(event: React.FormEvent) {
        event.preventDefault();
        if (!escritorio?.id) return;

        setSavingEsc(true);

        try {
            const { error } = await client
                .from('Jur_Escritorios')
                .update({
                    nome: formEsc.nome,
                    cnpj: formEsc.cnpj,
                    endereco: formEsc.endereco
                })
                .eq('id', escritorio.id);

            if (error) throw error;

            showAlert('Sucesso', 'Dados do escritório salvos com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao salvar escritório:', error);
            showAlert('Erro', 'Erro ao salvar os dados do escritório.', 'error');
        } finally {
            setSavingEsc(false);
        }
    }

    function abrirModalNovoUsuario() {
        setModalMode('create');
        setFormUser(INITIAL_FORM_USUARIO);
        setIsModalOpen(true);
    }

    function abrirModalEditarUsuario(usuario: Usuario) {
        setModalMode('edit');
        setFormUser({
            id: usuario.id,
            nome: usuario.nome || '',
            email: usuario.email || '',
            role: usuario.role || 'ADVOGADO',
            grupo_acesso_id: usuario.grupo_acesso_id || ''
        });
        setIsModalOpen(true);
    }

    function fecharModalUsuario() {
        if (savingUser) return;
        setIsModalOpen(false);
        setModalMode('create');
        setFormUser(INITIAL_FORM_USUARIO);
    }

    async function salvarUsuario(event: React.FormEvent) {
        event.preventDefault();
        if (!escritorio?.id) return;

        if (!formUser.nome.trim()) {
            showAlert('Atenção', 'Informe o nome do usuário.', 'warning');
            return;
        }

        if (!formUser.email.trim()) {
            showAlert('Atenção', 'Informe o email do usuário.', 'warning');
            return;
        }

        setSavingUser(true);

        try {
            if (modalMode === 'create') {
                const { error } = await client.from('Jur_Usuarios').insert([
                    {
                        escritorio_id: escritorio.id,
                        nome: formUser.nome.trim(),
                        email: formUser.email.trim(),
                        role: formUser.role,
                        grupo_acesso_id: formUser.grupo_acesso_id || null,
                        ativo: true
                    }
                ]);

                if (error) throw error;

                showAlert('Sucesso', 'Novo advogado/usuário cadastrado com sucesso!', 'success');
            } else {
                const { error } = await client
                    .from('Jur_Usuarios')
                    .update({
                        nome: formUser.nome.trim(),
                        email: formUser.email.trim(),
                        role: formUser.role,
                        grupo_acesso_id: formUser.grupo_acesso_id || null
                    })
                    .eq('id', formUser.id);

                if (error) throw error;

                showAlert('Sucesso', 'Usuário atualizado com sucesso!', 'success');
            }

            fecharModalUsuario();
            await carregarUsuarios();
        } catch (error: unknown) {
            console.error('Erro ao salvar usuário:', error);
            showAlert('Erro', (error as Error)?.message || 'Erro ao salvar usuário.', 'error');
        } finally {
            setSavingUser(false);
        }
    }

    async function inativarUsuario(usuario: Usuario) {
        if (!usuario?.id) return;

        const confirmar = await confirmDark({
            title: 'Inativar Usuário?',
            text: `Deseja inativar o usuário "${usuario.nome}"?`,
            confirmText: 'Sim, inativar',
            danger: true
        });
        if (!confirmar) return;

        setProcessingUserId(usuario.id);

        try {
            const { error } = await client
                .from('Jur_Usuarios')
                .update({ ativo: false })
                .eq('id', usuario.id);

            if (error) throw error;

            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Usuário inativado com sucesso!' });
            await carregarUsuarios();
        } catch (error: unknown) {
            console.error('Erro ao inativar usuário:', error);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: (error as Error)?.message || 'Não foi possível inativar o usuário. Verifique se a coluna "ativo" foi criada.',
            });
        } finally {
            setProcessingUserId(null);
        }
    }

    async function ativarUsuario(usuario: Usuario) {
        if (!usuario?.id) return;

        const confirmar = await confirmDark({
            title: 'Ativar Usuário?',
            text: `Deseja ativar o usuário "${usuario.nome}"?`,
            confirmText: 'Sim, ativar',
        });
        if (!confirmar) return;

        setProcessingUserId(usuario.id);

        try {
            const { error } = await client
                .from('Jur_Usuarios')
                .update({ ativo: true })
                .eq('id', usuario.id);

            if (error) throw error;

            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Usuário ativado com sucesso!' });
            await carregarUsuarios();
        } catch (error: unknown) {
            console.error('Erro ao ativar usuário:', error);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: (error as Error)?.message || 'Não foi possível ativar o usuário.',
            });
        } finally {
            setProcessingUserId(null);
        }
    }

    async function excluirUsuario(usuario: Usuario) {
        if (!usuario?.id) return;

        const confirmar = await confirmDark({
            title: 'Excluir Usuário?',
            text: `ATENÇÃO: Deseja realmente excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`,
            confirmText: 'Sim, excluir',
            danger: true
        });
        if (!confirmar) return;

        setProcessingUserId(usuario.id);

        try {
            const { error } = await client
                .from('Jur_Usuarios')
                .delete()
                .eq('id', usuario.id);

            if (error) throw error;

            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Usuário excluído com sucesso!' });
            await carregarUsuarios();
        } catch (err: unknown) {
            const error = err as { message?: string };
            console.error(error);
            if (error?.message && error.message.includes('foreign key constraint')) {
                await notifyDark({ icon: 'error', title: 'Atenção', text: 'Não é possível excluir o usuário, pois existem registros vinculados a ele.' });
            } else {
                await notifyDark({ icon: 'error', title: 'Erro', text: 'Não foi possível excluir o usuário.' });
            }
        } finally {
            setProcessingUserId(null);
        }
    }

    async function redefinirSenha(usuario: Usuario) {
        if (!usuario?.id) return;
        setUserToReset(usuario);
        setPasswordResetForm({ password: '', confirm: '' });
        setIsResetModalOpen(true);
    }

    async function handleResetPasswordSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userToReset || !escritorio?.id) return;

        if (passwordResetForm.password.length < 6) {
            showAlert('Atenção', 'A senha deve ter pelo menos 6 caracteres.', 'warning');
            return;
        }

        if (passwordResetForm.password !== passwordResetForm.confirm) {
            showAlert('Atenção', 'As senhas não conferem.', 'warning');
            return;
        }

        setSavingReset(true);
        try {
            // Tentativa de reset via RPC (padrão comum em Supabase para gestão administrativa de senhas)
            const { error } = await client.rpc('admin_reset_user_password', {
                target_user_id: userToReset.id,
                new_password: passwordResetForm.password
            });

            if (error) throw error;

            await notifyDark({ icon: 'success', title: 'Sucesso!', text: 'Senha redefinida com sucesso!' });
            setIsResetModalOpen(false);
            setUserToReset(null);
        } catch (error: unknown) {
            console.error('Erro ao redefinir senha:', error);
            await notifyDark({
                icon: 'error',
                title: 'Erro',
                text: (error as Error)?.message || 'Não foi possível redefinir a senha via sistema. Verifique se as permissões de admin estão configuradas.',
            });
        } finally {
            setSavingReset(false);
        }
    }

    const usuariosFiltrados = useMemo(() => {
        let items = [...usuarios];
        if (searchTermUsers.trim()) {
            const low = searchTermUsers.toLowerCase();
            items = items.filter(u =>
                u.nome.toLowerCase().includes(low) ||
                (u.email || '').toLowerCase().includes(low) ||
                (u.role || '').toLowerCase().includes(low)
            );
        }
        return items.sort((a, b) => {
            const ativoA = a.ativo ?? true;
            const ativoB = b.ativo ?? true;
            if (ativoA !== ativoB) return ativoA ? -1 : 1;
            return a.nome.localeCompare(b.nome);
        });
    }, [usuarios, searchTermUsers]);

    const totalItens = usuariosFiltrados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalItens / itensPorPagina));
    const paginaClamp = Math.min(Math.max(paginaAtualUsers, 1), totalPaginas);

    const itensPaginados = useMemo(() => {
        const inicio = (paginaClamp - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        return usuariosFiltrados.slice(inicio, fim);
    }, [usuariosFiltrados, paginaClamp, itensPorPagina]);

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

    return (
        <div
            className="animation-fade-in"
            style={{
                maxWidth: '1100px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                paddingBottom: '2rem'
            }}
        >
            <ConfigTabs activeTab={activeTab} onChange={setActiveTab} />

            {loadingConfig && (
                <div 
                    className="card"
                    style={{
                        borderRadius: '16px',
                        background: 'var(--bg-panel)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}
                >
                    <div className="spinner-border text-primary" style={{ width: '1.2rem', height: '1.2rem', borderWidth: '0.15em' }}></div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Carregando configurações...</div>
                </div>
            )}

            {!loadingConfig && activeTab === 'identidade' && (
                <IdentidadeTab
                    logoUrl={logoUrl}
                    loadingLogo={loadingLogo}
                    fileInputRef={fileInputRef}
                    onUpload={handleLogoUpload}
                    onOpenFilePicker={() => fileInputRef.current?.click()}
                />
            )}

            {!loadingConfig && activeTab === 'escritorio' && (
                <EscritorioTab
                    formEsc={formEsc}
                    savingEsc={savingEsc}
                    onChange={setFormEsc}
                    onSubmit={salvarEscritorio}
                />
            )}

            {!loadingConfig && activeTab === 'equipe' && (
                <EquipeTab
                    usuarios={itensPaginados}
                    loadingUsers={loadingUsers}
                    processingUserId={processingUserId}
                    isModalOpen={isModalOpen}
                    modalMode={modalMode}
                    formUser={formUser}
                    savingUser={savingUser}
                    searchTerm={searchTermUsers}
                    onSearchChange={setSearchTermUsers}
                    onOpenCreate={abrirModalNovoUsuario}
                    onOpenEdit={abrirModalEditarUsuario}
                    onCloseModal={fecharModalUsuario}
                    onChangeFormUser={setFormUser}
                    onSubmitUser={salvarUsuario}
                    onInativarUsuario={inativarUsuario}
                    onAtivarUsuario={ativarUsuario}
                    onExcluirUsuario={excluirUsuario}
                    totalItens={totalItens}
                    rangeInfo={rangeInfo}
                    paginaAtual={paginaClamp}
                    totalPaginas={totalPaginas}
                    pages={pageModel}
                    onChangePage={setPaginaAtualUsers}
                    onResetPassword={redefinirSenha}
                    isResetModalOpen={isResetModalOpen}
                    userToReset={userToReset}
                    passwordResetForm={passwordResetForm}
                    savingReset={savingReset}
                    onCloseResetModal={() => setIsResetModalOpen(false)}
                    onChangeResetForm={setPasswordResetForm}
                    onSubmitResetPassword={handleResetPasswordSubmit}
                />
            )}

            {!loadingConfig && activeTab === 'acessos' && (
                <AcessosTab />
            )}

            {!loadingConfig && activeTab === 'dev' && (
                <DevTab />
            )}
        </div>
    );
};