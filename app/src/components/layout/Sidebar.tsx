import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../../core/store';
import { logout } from '../../services/auth';
import Swal from 'sweetalert2';

export const Sidebar: React.FC<{ isOpen: boolean, closeSidebar: () => void }> = ({ isOpen, closeSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, escritorio } = useAppStore();

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Deseja realmente sair?',
            text: 'Você será desconectado do sistema.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Sim, sair',
            cancelButtonText: 'Cancelar',
            background: 'var(--bg-darker)',
            color: '#f0f4f8'
        });

        if (result.isConfirmed) {
            await logout();
            window.location.href = '/src/login.html';
        }
    };

    const menuItems = [
        { path: '/', label: '📊 Visão Geral', permission: 'dashboard.visualizar' },
        { path: '/prazos', label: '📅 Prazos', permission: 'prazos.visualizar' },
        { path: '/processos', label: '📂 Processos', permission: 'processos.visualizar' },
        { path: '/clientes', label: '👥 Clientes', permission: 'clientes.visualizar' },
        { path: '/config', label: '⚙ Configurações', permission: 'configuracoes.visualizar' },
    ];

    // Import from permissions string to avoid circular dependency error
    // Helper to evaluate permission
    const canAccess = (perm?: string) => {
        if (!perm) return true;
        if (!user) return false;
        if (!user.permissions) return true; // Loading state - show all until permissions load
        if (!Array.isArray(user.permissions) || user.permissions.length === 0) return false;
        return user.permissions.includes(perm);
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="brand">
                <div className="brand-icon">OA</div>
                <div className="brand-text">
                    <h1>PRAXIFY</h1>
                    <p>Paralegal Digital</p>
                </div>
            </div>

            <nav className="menu">
                {menuItems.filter(item => canAccess(item.permission)).map(item => (
                    <button
                        key={item.path}
                        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                        onClick={() => { navigate(item.path); closeSidebar(); }}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            <footer className="sidebar-footer">
                <small>{escritorio?.nome || 'Escritório Demo'}</small><br />
                <small className="muted">v202603.16.1415.00</small>
                <button
                    className="btn-ghost btn-small"
                    onClick={handleLogout}
                    style={{ marginTop: '0.75rem', width: '100%' }}
                >
                    🚪 Sair
                </button>
            </footer>
        </aside>
    );
};
