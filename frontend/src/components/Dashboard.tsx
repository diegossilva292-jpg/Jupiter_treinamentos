import React, { useEffect, useState } from 'react';
import { api, type Course, type Progress, type User } from '../services/api';
import { motion } from 'framer-motion';

interface DashboardProps {
    user: User;
    onSelectLesson: (courseId: string, moduleId: string, lessonId: string) => void;
    onNavigate: (view: 'dashboard' | 'ranking' | 'courses' | 'admin-panel' | 'certificates') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onSelectLesson, onNavigate }) => {
    // Silence unused warning for student view
    void onSelectLesson;
    const [dashboardUser, setDashboardUser] = useState<User>(user);
    const [courses, setCourses] = useState<Course[]>([]);
    const [allProgress, setAllProgress] = useState<Progress[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    useEffect(() => {
        setDashboardUser(user);
        loadData();
    }, [user]);

    const loadData = async () => {
        // Refresh User Data (XP)
        try {
            const freshUser = await api.getUser(user.id);
            if (freshUser) {
                setDashboardUser(prev => ({ ...prev, xp: freshUser.xp }));
            }
        } catch (e) {
            console.error("Failed to refresh user data", e);
        }

        const c = await api.getCourses();
        setCourses(c);
        if (user.role === 'admin') {
            const [ap, usersList] = await Promise.all([
                api.getAllProgress(),
                api.getUsers()
            ]);
            setAllProgress(ap);
            setAllUsers(usersList);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (user.role === 'admin') {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h1 className="text-glow" style={{ marginBottom: '2rem' }}>Painel do Administrador</h1>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Progresso & Ranking Global</h2>
                    {allProgress.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>Nenhum progresso registrado.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '1rem' }}>Colaborador</th>
                                        <th style={{ padding: '1rem' }}>Aula/Quiz</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem' }}>Tentativas</th>
                                        <th style={{ padding: '1rem' }}>Nota Recente</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allProgress.map((p, i) => {
                                        const u = allUsers.find(user => user.id === p.userId);
                                        const userName = u ? u.name : p.userId;

                                        return (
                                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                                    {userName}
                                                    {u && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{u.role}</div>}
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>{p.lessonId}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        color: p.status === 'COMPLETED' ? 'var(--success)' : 'var(--warning)',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        {p.status === 'COMPLETED' ? 'CONCLUÍDO' : 'PENDENTE'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    {p.attempts ? (
                                                        <span style={{
                                                            background: p.attempts > 1 ? 'rgba(255, 165, 0, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                                            color: p.attempts > 1 ? 'orange' : '#34d399',
                                                            padding: '2px 8px',
                                                            borderRadius: '12px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {p.attempts}x
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {p.score !== undefined ? p.score : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div style={{ marginTop: '2rem' }}>
                    <button className="btn" onClick={() => onNavigate('admin-panel')}>
                        Gerenciar Conteúdo (Criar Cursos/Aulas)
                    </button>
                </div>
            </div>
        );
    }

    // Student View (Main Hub)
    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}
            >
                Olá, <span className="text-glow" style={{ color: 'var(--primary)' }}>{dashboardUser.name}</span> 👋
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ marginBottom: '3rem', color: 'var(--text-muted)', fontSize: '1.2rem' }}
            >
                Aqui está o resumo do seu desenvolvimento na Jupiter LMS.
            </motion.p>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
            >

                {/* Meus Cursos Widget */}
                <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem', transition: 'transform 0.3s' }} whileHover={{ translateY: -5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>📚 Meus Cursos</h2>
                    </div>
                    <p style={{ flex: 1, color: 'var(--text-dim)', lineHeight: '1.6' }}>
                        Você tem acesso a <strong style={{ color: 'white' }}>{courses.length}</strong> trilhas de conhecimento exclusivas.
                    </p>
                    <button className="btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => onNavigate('courses')}>
                        Acessar Meus Cursos
                    </button>
                </motion.div>

                {/* Ranking Widget */}
                <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem', transition: 'transform 0.3s' }} whileHover={{ translateY: -5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>🏆 Ranking Global</h2>
                        <span className="text-glow" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{dashboardUser.xp || 0} XP</span>
                    </div>
                    <p style={{ flex: 1, color: 'var(--text-dim)', lineHeight: '1.6' }}>
                        Confira sua colocação e XP em relação a todos os usuários da plataforma.
                    </p>
                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => onNavigate('ranking')}>
                        Ver Ranking
                    </button>
                </motion.div>

                {/* Certificates Widget */}
                <motion.div variants={itemVariants} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2rem', transition: 'transform 0.3s' }} whileHover={{ translateY: -5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ margin: 0 }}>📜 Certificados</h2>
                    </div>
                    <p style={{ flex: 1, color: 'var(--text-dim)', lineHeight: '1.6' }}>Seus certificados de conclusão aparecerão aqui.</p>
                    <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => onNavigate('certificates')}>
                        Ver Meus Certificados
                    </button>
                </motion.div>

                {/* Community Widget Removed */}

            </motion.div>
        </div>
    );
};
