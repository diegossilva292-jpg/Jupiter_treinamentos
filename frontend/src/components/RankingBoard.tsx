import React, { useEffect, useState } from 'react';
import { api, type User } from '../services/api';
import { motion } from 'framer-motion';

interface RankingBoardProps {
    onBack: () => void;
    currentUserId?: string;
}

export const RankingBoard: React.FC<RankingBoardProps> = ({ onBack, currentUserId }) => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        api.getRanking().then(setUsers);
    }, []);

    const userRankIndex = users.findIndex(u => u.id === currentUserId);
    const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-glow" style={{ margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>RANKING GLOBAL 🏆</h1>
                    {currentUserId && userRankIndex !== -1 && (
                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--primary)', fontWeight: 'bold' }}>
                            Sua Posição: #{userRank}
                        </p>
                    )}
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem'
                    }}
                >
                    ← Voltar para Home
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Posição</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>Usuário</th>
                            <th style={{ padding: '1.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>XP Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, index) => {
                            const isCurrentUser = u.id === currentUserId;
                            return (
                                <motion.tr
                                    key={u.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    style={{
                                        borderBottom: '1px solid var(--glass-border)',
                                        transition: 'background 0.2s',
                                        background: isCurrentUser ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                                        boxShadow: isCurrentUser ? 'inset 3px 0 0 var(--primary)' : 'none'
                                    }}
                                    whileHover={{ backgroundColor: isCurrentUser ? 'rgba(139, 92, 246, 0.25)' : 'rgba(255,255,255,0.05)' }}
                                >
                                    <td style={{ padding: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                        {index === 0 ? <span style={{ textShadow: '0 0 10px gold' }}>🥇</span> :
                                            index === 1 ? <span style={{ textShadow: '0 0 10px silver' }}>🥈</span> :
                                                index === 2 ? <span style={{ textShadow: '0 0 10px #cd7f32' }}>🥉</span> :
                                                    <span style={{ color: isCurrentUser ? 'var(--primary)' : 'var(--text-dim)' }}>#{index + 1}</span>}
                                    </td>
                                    <td style={{ padding: '1.5rem' }}>
                                        <div style={{ fontWeight: '600', fontSize: '1.1rem', color: index < 3 ? 'white' : (isCurrentUser ? 'var(--primary)' : 'var(--text-main)') }}>
                                            {u.name} {isCurrentUser && <span style={{ fontSize: '0.8rem', marginLeft: '8px', background: 'var(--primary)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>VOCÊ</span>}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-block', marginTop: '0.2rem', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>{u.role}</span>
                                    </td>
                                    <td style={{ padding: '1.5rem', color: 'var(--secondary)', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
                                        {u.xp || 0} XP
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};
