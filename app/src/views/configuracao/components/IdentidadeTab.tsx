import React from 'react';

interface Props {
    logoUrl: string | null;
    loadingLogo: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onOpenFilePicker: () => void;
}

export const IdentidadeTab: React.FC<Props> = ({
    logoUrl,
    loadingLogo,
    fileInputRef,
    onUpload,
    onOpenFilePicker
}) => {
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
                    flexDirection: 'column',
                    gap: '0.4rem'
                }}
            >
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>
                    🎨 Identidade Visual
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>
                    Personalize a logo exibida na aplicação e em seus documentos.
                </p>
            </div>

            {/* Content Section */}
            <div
                className="card"
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.5rem',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2rem',
                        flexWrap: 'wrap'
                    }}
                >
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            flexShrink: 0,
                            borderRadius: '20px',
                            border: '1px solid rgba(208,168,79,0.3)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(15, 23, 42, 0.5)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            position: 'relative'
                        }}
                    >
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo do escritório"
                                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
                            />
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ color: 'rgba(208,168,79,0.8)', fontSize: '1.8rem', fontWeight: 800 }}>
                                    OA
                                </span>
                            </div>
                        )}
                        
                        {loadingLogo && (
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(2px)'
                            }}>
                                <div className="spinner-border text-warning" style={{ width: '1.5rem', height: '1.5rem' }}></div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '280px' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700 }}>Logo do Escritório</h4>
                            <p style={{ color: 'var(--text-muted)', margin: '0.35rem 0 0 0', fontSize: '0.86rem', lineHeight: 1.5 }}>
                                Recomendamos o uso de uma imagem com fundo transparente (PNG ou SVG) e formato quadrado ou retangular horizontal. Tamanho máximo: 2MB.
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onUpload}
                            style={{ display: 'none' }}
                        />

                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={onOpenFilePicker}
                                disabled={loadingLogo}
                                style={{
                                    padding: "0.58rem 1.25rem",
                                    borderRadius: 12,
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "var(--bg-surface)",
                                    color: "var(--text-main)",
                                    cursor: "pointer",
                                    fontWeight: 650,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem'
                                }}
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {loadingLogo ? 'Enviando...' : 'Alterar Logo'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};