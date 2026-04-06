import React from 'react';

export type ConfigTabId = 'identidade' | 'escritorio' | 'equipe' | 'acessos' | 'dev';

interface Props {
    activeTab: ConfigTabId;
    onChange: (tab: ConfigTabId) => void;
}

const tabs: Array<{ id: ConfigTabId; label: string; icon: string }> = [
    { id: 'identidade', label: 'Identidade Visual', icon: '🎨' },
    { id: 'escritorio', label: 'Dados do Escritório', icon: '🏢' },
    { id: 'equipe', label: 'Advogados e Equipe', icon: '👥' },
    { id: 'acessos', label: 'Gestão de Acessos', icon: '🔐' },
    { id: 'dev', label: 'Área do Desenvolvedor', icon: '🛠️' }
];

export const ConfigTabs: React.FC<Props> = ({ activeTab, onChange }) => {
    return (
        <div
            className="card"
            style={{
                display: 'flex',
                gap: '0.6rem',
                flexWrap: 'wrap',
                alignItems: 'center',
                padding: '0.8rem',
                background: 'var(--bg-panel)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px'
            }}
        >
            {tabs.map((tab) => {
                const active = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        style={{
                            padding: '0.65rem 1.1rem',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: active ? 'rgba(0,217,255,0.3)' : 'transparent',
                            background: active ? 'rgba(0,217,255,0.08)' : 'transparent',
                            color: active ? '#00d9ff' : '#9ca3af',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.6rem'
                        }}
                        onMouseOver={(e) => {
                            if (!active) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                e.currentTarget.style.color = '#f3f4f6';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (!active) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#9ca3af';
                            }
                        }}
                    >
                        <span style={{ fontSize: '1rem', opacity: active ? 1 : 0.7 }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};