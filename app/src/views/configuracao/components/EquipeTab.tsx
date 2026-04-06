import React from 'react';
import type { FormUsuario, ModalMode, Usuario } from '../Configuracoes';

interface Props {
    usuarios: Usuario[];
    loadingUsers: boolean;
    processingUserId: string | null;
    isModalOpen: boolean;
    modalMode: ModalMode;
    formUser: FormUsuario;
    savingUser: boolean;
    onOpenCreate: () => void;
    onOpenEdit: (u: Usuario) => void;
    onCloseModal: () => void;
    onChangeFormUser: (form: FormUsuario) => void;
    onSubmitUser: (event: React.FormEvent) => void;
    onInativarUsuario: (usuario: Usuario) => void;
    onAtivarUsuario: (usuario: Usuario) => void;
    onExcluirUsuario: (usuario: Usuario) => void;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    totalItens: number;
    rangeInfo: { start: number; end: number; total: number };
    paginaAtual: number;
    totalPaginas: number;
    pages: (number | '...')[];
    onChangePage: (p: number) => void;
    onResetPassword: (usuario: Usuario) => void;
    isResetModalOpen: boolean;
    userToReset: Usuario | null;
    passwordResetForm: { password: string, confirm: string };
    savingReset: boolean;
    onCloseResetModal: () => void;
    onChangeResetForm: (form: { password: string, confirm: string }) => void;
    onSubmitResetPassword: (e: React.FormEvent) => void;
}

const ROLE_OPTIONS = [
    { value: 'ADVOGADO', label: 'ADVOGADO' },
    { value: 'ESTAGIARIO', label: 'ESTAGIÁRIO' },
    { value: 'SECRETARIA', label: 'SECRETARIA' },
    { value: 'ADMIN', label: 'ADMIN' }
];

function getRoleBadgeStyle(role: string): React.CSSProperties {
    switch (role) {
        case 'ADMIN':
            return {
                background: 'rgba(16,185,129,0.12)',
                color: 'var(--success)',
                border: '1px solid rgba(16,185,129,0.35)'
            };
        case 'ADVOGADO':
            return {
                background: 'rgba(59,130,246,0.12)',
                color: 'var(--info)',
                border: '1px solid rgba(59,130,246,0.35)'
            };
        case 'SECRETARIA':
            return {
                background: 'rgba(168,85,247,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(168,85,247,0.35)'
            };
        default:
            return {
                background: 'rgba(148,163,184,0.12)',
                color: 'var(--text-muted)',
                border: '1px solid rgba(148,163,184,0.35)'
            };
    }
}

function getStatusBadgeStyle(ativo: boolean): React.CSSProperties {
    return ativo
        ? {
            background: 'rgba(16,185,129,0.12)',
            color: 'var(--success)',
            border: '1px solid rgba(16,185,129,0.35)'
        }
        : {
            background: 'rgba(239,68,68,0.12)',
            color: 'var(--danger)',
            border: '1px solid rgba(239,68,68,0.35)'
        };
}

const cellBase: React.CSSProperties = {
    padding: '0.65rem 0.85rem',
    background: 'var(--bg-darker)',
    borderTop: '1px solid var(--border-color)',
    borderBottom: '1px solid var(--border-color)',
    lineHeight: 1.25
};




export const EquipeTab: React.FC<Props> = ({
    usuarios,
    loadingUsers,
    processingUserId,
    isModalOpen,
    modalMode,
    formUser,
    savingUser,
    onOpenCreate,
    onOpenEdit,
    onCloseModal,
    onChangeFormUser,
    onSubmitUser,
    onInativarUsuario,
    onAtivarUsuario,
    onExcluirUsuario,
    searchTerm,
    onSearchChange,
    totalItens,
    rangeInfo,
    paginaAtual,
    totalPaginas,
    pages,
    onChangePage,
    onResetPassword,
    isResetModalOpen,
    userToReset,
    passwordResetForm,
    savingReset,
    onCloseResetModal,
    onChangeResetForm,
    onSubmitResetPassword
}) => {
    const [grupos, setGrupos] = React.useState<{ id: string, nome: string }[]>([]);

    React.useEffect(() => {
        const fetchGrupos = async () => {
            try {
                const { getClient } = await import('../../../services/supabase');
                const { useAppStore } = await import('../../../core/store');
                const client = getClient();
                const escritorio = useAppStore.getState().escritorio;
                if (!escritorio?.id) return;

                const { data } = await client
                    .from('grupos_acesso')
                    .select('id, nome')
                    .eq('escritorio_id', escritorio.id)
                    .eq('status', 'ativo')
                    .order('nome');

                if (data) setGrupos(data);
            } catch (err) {
                console.error("Erro ao buscar grupos", err);
            }
        };
        fetchGrupos();
    }, []);

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
            maxWidth: 580,
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
            border: "1px solid rgba(255,255,255,0.10)",
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
        sectionCard: {
            border: "1px solid rgba(255,255,255,0.10)",
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
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap'
                }}
            >
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>👥 Advogados e Equipe</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.88rem' }}>
                        Cadastre, edite e gerencie os membros do seu escritório.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Pesquisar usuários..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
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
                        type="button" 
                        onClick={onOpenCreate}
                        style={{
                            padding: "0.58rem 1.25rem",
                            borderRadius: 12,
                            border: "1px solid rgba(148,163,184,0.20)",
                            background: "var(--bg-surface)",
                            color: "var(--text-main)",
                            cursor: "pointer",
                            fontWeight: 650,
                            whiteSpace: "nowrap",
                        }}
                    >
                        + Novo Advogado
                    </button>
                </div>
            </div>

            <div
                className="card"
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '0.75rem',
                }}
            >
                <div style={{ maxHeight: '62vh', overflowY: 'auto', overflowX: 'auto', paddingRight: '0.25rem' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'left', minWidth: 700 }}>
                        <thead>
                            <tr style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>
                                    Nome
                                </th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>
                                    Email
                                </th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>
                                    Função
                                </th>
                                <th style={{ padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)' }}>
                                    Status
                                </th>
                                <th
                                    style={{
                                        padding: '0.6rem 0.85rem', position: 'sticky', top: 0, zIndex: 2, background: 'var(--bg-darker)',
                                        textAlign: 'right'
                                    }}
                                >
                                    Ações
                                </th>
                            </tr>
                        </thead>

                        <tbody style={{ fontSize: '0.86rem' }}>
                            {loadingUsers ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        Carregando usuários...
                                    </td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                        Nenhum usuário cadastrado.
                                    </td>
                                </tr>
                            ) : (
                                usuarios.map((usuario) => {
                                    const ativo = usuario.ativo ?? true;
                                    const isProcessing = processingUserId === usuario.id;

                                    return (
                                        <tr 
                                            key={usuario.id}
                                            style={{ transition: 'transform .15s, background .15s' }}
                                            onMouseOver={(e) => {
                                                (e.currentTarget as HTMLTableRowElement).style.transform = 'translateY(-1px)';
                                            }}
                                            onMouseOut={(e) => {
                                                (e.currentTarget as HTMLTableRowElement).style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <td style={{ ...cellBase, color: 'var(--text-main)', borderTopLeftRadius: 14, borderBottomLeftRadius: 14 }}>
                                                {usuario.nome}
                                            </td>

                                            <td style={{ ...cellBase, color: 'var(--text-main)' }}>
                                                {usuario.email}
                                            </td>

                                            <td style={{ ...cellBase }}>
                                                <span
                                                    style={{
                                                        ...getRoleBadgeStyle(usuario.role),
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {usuario.role}
                                                </span>
                                            </td>

                                            <td style={{ ...cellBase }}>
                                                <span
                                                    style={{
                                                        ...getStatusBadgeStyle(ativo),
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        padding: '4px 10px',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {ativo ? 'ATIVO' : 'INATIVO'}
                                                </span>
                                            </td>

                                                    <td style={{ ...cellBase, borderTopRightRadius: 14, borderBottomRightRadius: 14, textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <button
                                                        type="button"
                                                        title="Editar"
                                                        onClick={() => onOpenEdit(usuario)}
                                                        style={{
                                                            width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(59,130,246,0.14)', border: '1px solid rgba(59,130,246,0.28)', color: 'var(--accent)', cursor: 'pointer', transition: 'transform .15s'
                                                        }}
                                                        onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                                        onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                                    >
                                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Redefinir Senha"
                                                        onClick={() => onResetPassword(usuario)}
                                                        disabled={isProcessing}
                                                        style={{
                                                            width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'var(--primary-dim)', border: '1px solid rgba(208,168,79,0.28)', color: 'var(--primary)', cursor: 'pointer', transition: 'transform .15s',
                                                            opacity: isProcessing ? 0.7 : 1
                                                        }}
                                                        onMouseOver={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1.08)' }}
                                                        onMouseOut={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1)' }}
                                                    >
                                                        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                    </button>
                                                    {ativo ? (
                                                        <button
                                                            type="button"
                                                            title="Inativar"
                                                            onClick={() => onInativarUsuario(usuario)}
                                                            disabled={isProcessing}
                                                            style={{
                                                                width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)', color: 'var(--danger)', cursor: 'pointer', transition: 'transform .15s',
                                                                opacity: isProcessing ? 0.7 : 1
                                                            }}
                                                            onMouseOver={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1.08)' }}
                                                            onMouseOut={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1)' }}
                                                        >
                                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            title="Ativar"
                                                            onClick={() => onAtivarUsuario(usuario)}
                                                            disabled={isProcessing}
                                                            style={{
                                                                width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                background: 'rgba(16,185,129,0.14)', border: '1px solid rgba(16,185,129,0.28)', color: 'var(--success)', cursor: 'pointer', transition: 'transform .15s',
                                                                opacity: isProcessing ? 0.7 : 1
                                                            }}
                                                            onMouseOver={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1.08)' }}
                                                            onMouseOut={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1)' }}
                                                        >
                                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        title="Excluir"
                                                        onClick={() => onExcluirUsuario(usuario)}
                                                        disabled={isProcessing}
                                                        style={{
                                                            width: 30, height: 30, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.22)', color: 'var(--danger)', cursor: 'pointer', transition: 'transform .15s',
                                                            opacity: isProcessing ? 0.7 : 1
                                                        }}
                                                        onMouseOver={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1.08)' }}
                                                        onMouseOut={(e) => { if (!isProcessing) e.currentTarget.style.transform = 'scale(1)' }}
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
                                    );
                                })
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
                            borderTop: '"1px solid var(--border-color)"',
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
                                onClick={() => onChangePage(paginaAtual - 1)}
                                disabled={paginaAtual === 1}
                                style={{
                                    width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                                    color: paginaAtual === 1 ? 'var(--text-dim)' : '#f3f4f6', cursor: paginaAtual === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>

                            {pages.map((p, idx) =>
                                p === '...' ? (
                                    <span key={`dots-${idx}`} style={{ padding: '0 0.35rem', opacity: 0.7 }}>...</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => onChangePage(p as number)}
                                        style={{
                                            minWidth: 34, height: 34, padding: '0 0.5rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                                            background: p === paginaAtual ? 'rgba(0,217,255,0.12)' : 'rgba(255,255,255,0.05)',
                                            color: p === paginaAtual ? '#00d9ff' : '#f3f4f6', cursor: 'pointer', fontWeight: 800
                                        }}
                                    >
                                        {p}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => onChangePage(paginaAtual + 1)}
                                disabled={paginaAtual === totalPaginas}
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

            {isModalOpen && (
                <div
                    style={modalStyles.overlay}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) onCloseModal();
                    }}
                >
                    <div
                        style={modalStyles.cardStyle}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div style={modalStyles.header}>
                            <div>
                                <h3 style={modalStyles.title}>
                                    {modalMode === 'create' ? 'Novo Advogado' : 'Editar Advogado'}
                                </h3>
                                <p style={modalStyles.subtitle}>
                                    Preencha os dados do membro da equipe.
                                </p>
                            </div>
                            <button type="button" onClick={onCloseModal} style={modalStyles.closeBtn} aria-label="Fechar">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={onSubmitUser} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div style={modalStyles.contentStyle}>
                                <div style={modalStyles.sectionCard}>
                                    <div style={{ ...modalStyles.sectionBtn, borderBottom: "1px solid var(--border-color)", cursor: 'default' }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span>▸</span>
                                                <span>Dados base</span>
                                            </div>
                                            <div style={{ color: "var(--text-muted)", fontWeight: 750, fontSize: "0.82rem", marginTop: 4 }}>
                                                Identificação e acesso do usuário
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: "0.9rem", display: "flex", flexDirection: "column", gap: "0.95rem" }}>
                                        <div>
                                            <label style={modalStyles.label}>
                                                Nome
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={formUser.nome}
                                                onChange={(e) => onChangeFormUser({ ...formUser, nome: e.target.value })}
                                                style={modalStyles.input}
                                                autoFocus
                                            />
                                        </div>

                                        <div>
                                            <label style={modalStyles.label}>
                                                Email
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                value={formUser.email}
                                                onChange={(e) => onChangeFormUser({ ...formUser, email: e.target.value })}
                                                style={modalStyles.input}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.95rem' }}>
                                            <div style={{ minWidth: 0 }}>
                                                <label style={modalStyles.label}>
                                                    Função
                                                </label>
                                                <select
                                                    value={formUser.role}
                                                    onChange={(e) => onChangeFormUser({ ...formUser, role: e.target.value })}
                                                    style={modalStyles.input}
                                                >
                                                    {ROLE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <label style={modalStyles.label}>
                                                    Grupo de Acesso (RBAC)
                                                </label>
                                                <select
                                                    value={formUser.grupo_acesso_id || ''}
                                                    onChange={(e) => onChangeFormUser({ ...formUser, grupo_acesso_id: e.target.value })}
                                                    style={modalStyles.input}
                                                >
                                                    <option value="">-- Sem Grupo --</option>
                                                    {grupos.map((g) => (
                                                        <option key={g.id} value={g.id}>
                                                            {g.nome}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={modalStyles.footerStyle}>
                                <button
                                    type="button"
                                    onClick={onCloseModal}
                                    style={modalStyles.btnCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    style={{ ...modalStyles.btnConfirm, opacity: savingUser ? 0.85 : 1 }}
                                >
                                    {savingUser ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isResetModalOpen && (
                <div
                    style={modalStyles.overlay}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) onCloseResetModal();
                    }}
                >
                    <div
                        style={modalStyles.cardStyle}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div style={modalStyles.header}>
                            <div>
                                <h3 style={modalStyles.title}>
                                    🔐 Redefinir Senha
                                </h3>
                                <p style={modalStyles.subtitle}>
                                    Defina uma nova senha para {userToReset?.nome}.
                                </p>
                            </div>
                            <button type="button" onClick={onCloseResetModal} style={modalStyles.closeBtn} aria-label="Fechar">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={onSubmitResetPassword} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                            <div style={modalStyles.contentStyle}>
                                <div style={modalStyles.sectionCard}>
                                    <div style={{ padding: "1.2rem", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                                        <div>
                                            <label style={modalStyles.label}>
                                                Nova Senha
                                            </label>
                                            <input
                                                required
                                                type="password"
                                                value={passwordResetForm.password}
                                                onChange={(e) => onChangeResetForm({ ...passwordResetForm, password: e.target.value })}
                                                style={modalStyles.input}
                                                autoFocus
                                                placeholder="Mínimo 6 caracteres"
                                            />
                                        </div>

                                        <div>
                                            <label style={modalStyles.label}>
                                                Confirmar Nova Senha
                                            </label>
                                            <input
                                                required
                                                type="password"
                                                value={passwordResetForm.confirm}
                                                onChange={(e) => onChangeResetForm({ ...passwordResetForm, confirm: e.target.value })}
                                                style={modalStyles.input}
                                                placeholder="Repita a senha"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={modalStyles.footerStyle}>
                                <button
                                    type="button"
                                    onClick={onCloseResetModal}
                                    style={modalStyles.btnCancel}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingReset}
                                    style={{ ...modalStyles.btnConfirm, opacity: savingReset ? 0.85 : 1 }}
                                >
                                    {savingReset ? 'Redefinindo...' : 'Atualizar Senha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};