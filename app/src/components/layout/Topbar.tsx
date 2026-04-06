import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAppStore } from '../../core/store';
import { Sun, Moon } from 'lucide-react';

// Helper to determine page titles based on route
const getPageTitle = (pathname: string) => {
    switch (pathname) {
        case '/': return { title: 'Dashboard', subtitle: 'Visão Geral do Sistema' };
        case '/prazos': return { title: 'Controle de Prazos', subtitle: 'Gestão de tarefas e audiências' };
        case '/processos': return { title: 'Processos', subtitle: 'Acompanhamento de autos jurídicos' };
        case '/clientes': return { title: 'Clientes', subtitle: 'Diretório de contatos e clientes' };
        case '/crm': return { title: 'CRM/Atendimentos', subtitle: 'Acolhimentos e novos leads' };
        case '/config': return { title: 'Configurações', subtitle: 'Ajustes do escritório e sistema' };
        default: return { title: 'PRAXIFY', subtitle: 'Paralegal Digital' };
    }
};

export const Topbar: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
    const location = useLocation();
    const user = useAppStore(state => state.user);
    const theme = useAppStore(state => state.theme);
    const setTheme = useAppStore(state => state.setTheme);

    const handleThemeToggle = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    const headerInfo = getPageTitle(location.pathname);

    // Extract name from user metadata or email
    const metadataName = (user as any)?.user_metadata?.full_name || (user as any)?.user_metadata?.name;
    let rawName = user?.nome || metadataName || user?.email || 'Usuário';

    if (rawName.includes('@')) {
        rawName = rawName.split('@')[0];
    }

    // Capitalize string properly e garante que remova strings esquisitas do DevMode
    const userName = rawName.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()).trim();
    const userInitials = userName.charAt(0).toUpperCase();
    const roleLabels: Record<string, string> = {
        'ADMIN': 'Administrador',
        'ADVOGADO': 'Advogado(a)',
        'ESTAGIARIO': 'Estagiário(a)'
    };
    const userRole = user ? roleLabels[user.role] : 'Convidado';

    return (
        <header className="topbar">
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Abrir Menu">
                    ☰
                </button>
                <div>
                    <h2>{headerInfo.title}</h2>
                    <p>{headerInfo.subtitle}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                    onClick={handleThemeToggle} 
                    style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.5rem',
                        borderRadius: '50%'
                    }}
                    title={theme === 'light' ? 'Mudar para Escuro' : 'Mudar para Claro'}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="user-box">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">{userRole}</span>
                    </div>
                    <div className="user-avatar">{userInitials}</div>
                </div>
            </div>
        </header>
    );
};
