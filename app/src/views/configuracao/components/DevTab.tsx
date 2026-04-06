import React, { useState } from 'react';
import { showAlert } from '../../../utils/alert';

export const DevTab: React.FC = () => {
    const [numProcesso, setNumProcesso] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState<any>(null);

    const handleConsultar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numProcesso.trim()) {
            showAlert('Atenção', 'Digite o número do processo.', 'warning');
            return;
        }

        setLoading(true);
        setResultado(null);

        try {
            // Aqui vamos implementar a chamada para o script ConsultaProcesso.py
            // Como estamos no frontend, precisaremos de um endpoint ou uma forma de rodar o script.
            // Para este MVP inicial na área do dev, vamos simular a busca ou preparar o terreno para a integração.
            console.log('Consultando processo:', numProcesso);
            
            // Simulação de delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mock de resultado baseado no script
            setResultado({
                numero: numProcesso,
                classe: "Procedimento Comum Cível",
                assuntos: ["Indenização por Dano Moral", "Responsabilidade Civil"],
                dataUltimaAtualizacao: new Date().toISOString(),
                grau: "1",
                orgaoJulgador: "1ª Vara Cível de São Paulo",
                movimentos: [
                    { nome: "Concluso para despacho", data: "2024-03-31T10:00:00Z" },
                    { nome: "Petição de juntada", data: "2024-03-30T15:30:00Z" }
                ],
                tipo: "processo_original"
            });

            showAlert('Sucesso', 'Processo consultado com sucesso!', 'success');
        } catch (error: any) {
            console.error(error);
            showAlert('Erro', 'Falha ao consultar processo.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animation-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                    🛠️ Área do Desenvolvedor
                </h3>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.88rem' }}>
                    Espaço reservado para testes e novas funcionalidades experimentais.
                </p>
            </div>

            <div
                className="card"
                style={{
                    borderRadius: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1.5rem',
                }}
            >
                <form onSubmit={handleConsultar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            🔍 Consulta de Processo (CNJ)
                        </h4>
                        <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', fontSize: '0.86rem' }}>
                            Digite o número do processo no formato CNJ (Ex: 0000000-00.0000.0.00.0000)
                        </p>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <input
                                type="text"
                                value={numProcesso}
                                onChange={(e) => setNumProcesso(e.target.value)}
                                placeholder="0000000-00.0000.0.00.0000"
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-darker)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '12px',
                                    background: '#00d9ff',
                                    color: '#000',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Buscando...' : 'Pesquisar'}
                            </button>
                        </div>
                    </div>
                </form>

                {resultado && (
                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h5 style={{ margin: 0, color: '#00d9ff', fontWeight: 800 }}>Resultado da Consulta</h5>
                            <span style={{ fontSize: '0.75rem', background: 'rgba(0,217,255,0.1)', color: '#00d9ff', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                                Processo Localizado
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Número</label>
                                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{resultado.numero}</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Classe</label>
                                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{resultado.classe}</span>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Órgão Julgador</label>
                                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{resultado.orgaoJulgador}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h6 style={{ color: 'var(--text-main)', fontWeight: 700, marginBottom: '0.75rem' }}>Últimas Movimentações</h6>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {resultado.movimentos.map((mov: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)', minWidth: '80px' }}>
                                            {new Date(mov.data).toLocaleDateString()}
                                        </span>
                                        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{mov.nome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
