import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../core/store';
import { getProcessos, getClient } from '../../services/supabase';
import { showAlert } from '../../utils/alert';

interface Lead {
    id: number;
    cliente: { nome: string };
    numero_autos: string | null;
    criado_em: string;
    tribunal: string | null;
    status: string;
}

const COLUMNS = [
    { id: 'NOVO', title: '🆕 Novos', color: 'var(--text-muted)' },
    { id: 'NEGOCIACAO', title: '💬 Negociação', color: 'var(--warning)' },
    { id: 'DOCS', title: '📂 Documentação', color: 'var(--info)' },
    { id: 'FECHADO', title: '✅ Contratados', color: 'var(--success)' }
];

export const Crm: React.FC = () => {
    const { escritorio } = useAppStore();
    const navigate = useNavigate();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const carregarDados = async () => {
        if (!escritorio) return;
        setLoading(true);
        try {
            const { data, error } = await getProcessos<Lead>();
            if (error) throw error;
            setLeads((data || []).filter((p) => p.status === 'PRE_PROCESSUAL'));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [escritorio]);

    const handleDragStart = (e: React.DragEvent, id: number) => {
        e.dataTransfer.setData('leadId', id.toString());
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        const leadId = e.dataTransfer.getData('leadId');
        if (!leadId) return;

        // Otimistic update
        const numId = parseInt(leadId);
        setLeads(prev => prev.map(l => l.id === numId ? { ...l, tribunal: targetStatus } : l));

        try {
            const client = getClient();
            const { error } = await client.from('Jur_Processos').update({ tribunal: targetStatus }).eq('id', numId);
            if (error) throw error;
        } catch (err: unknown) {
            showAlert('Erro', (err as Error).message || 'Erro ao mover lead', 'error');
            carregarDados(); // Revert
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="animation-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Funil de Vendas Jurídico (CRM)</h3>
                    <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>Arraste os cards para mover de etapa</p>
                </div>
                <button className="btn-primary" onClick={() => navigate('/processos')}>+ Novo Lead</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', flex: 1, minHeight: 0 }}>
                {COLUMNS.map(col => {
                    const colLeads = leads.filter(l => {
                        let st = l.tribunal ? l.tribunal.toUpperCase().trim() : 'NOVO';
                        if (!COLUMNS.find(c => c.id === st)) st = 'NOVO';
                        return st === col.id;
                    });

                    return (
                        <div key={col.id}
                            onDrop={(e) => handleDrop(e, col.id)}
                            onDragOver={handleDragOver}
                            style={{
                                minWidth: '300px', maxWidth: '300px', background: 'var(--bg-panel)', borderRadius: '8px',
                                display: 'flex', flexDirection: 'column', borderTop: `4px solid ${col.color}`,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)', height: '100%'
                            }}>
                            <div style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-darker)', borderRadius: '8px 8px 0 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span>{col.title}</span>
                                <span style={{ background: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{colLeads.length}</span>
                            </div>

                            <div style={{ flex: 1, padding: '0.8rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {loading ? (
                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Carregando...</div>
                                ) : colLeads.length === 0 ? (
                                    col.id === 'NOVO' && leads.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '8px' }}>
                                            <p>Nenhum lead.</p>
                                        </div>
                                    ) : null
                                ) : (
                                    colLeads.map(lead => (
                                        <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)}
                                            style={{
                                                background: 'var(--bg-panel)', padding: '1rem', borderRadius: '6px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)', cursor: 'grab',
                                                borderLeft: '4px solid var(--border-color)', border: '1px solid var(--border-color)'
                                            }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                                                {lead.cliente?.nome || 'Sem nome'}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {lead.numero_autos || 'Lead'}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                <span>📅 {new Date(lead.criado_em).toLocaleDateString()}</span>
                                                <span>ID: {lead.id}</span>
                                            </div>
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => navigate(`/processo/${lead.id}`)} style={{ flex: 1, padding: '6px', background: 'var(--primary-dim)', border: '1px solid var(--primary-dim)', borderRadius: '4px', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                    Abrir Ficha
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
