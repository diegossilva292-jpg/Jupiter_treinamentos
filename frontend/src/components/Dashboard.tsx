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

    // Admin View
    const [searchTerm, setSearchTerm] = useState('');

    const getLessonTitle = (lessonId: string) => {
        for (const course of courses) {
            for (const module of course.modules) {
                const lesson = module.lessons.find(l => l.id === lessonId);
                if (lesson) return lesson.title;
            }
        }
        return lessonId;
    };

    const filteredProgress = allProgress.filter(p => {
        const u = allUsers.find(user => user.id === p.userId);
        const userName = u ? u.name.toLowerCase() : p.userId.toLowerCase();
        const lessonTitle = getLessonTitle(p.lessonId).toLowerCase();
        const search = searchTerm.toLowerCase();

        return userName.includes(search) || lessonTitle.includes(search);
    });

    if (user.role === 'admin') {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 className="text-glow" style={{ margin: 0 }}>Painel do Administrador</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn" onClick={() => onNavigate('admin-panel')}>
                            Gerenciar Conteúdo
                        </button>
                    </div>
                </header>

                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <h2 style={{ margin: 0 }}>Progresso & Ranking Global</h2>
                        <input
                            type="text"
                            placeholder="Buscar por aluno ou aula..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                padding: '0.6rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(0,0,0,0.3)',
                                color: 'var(--text-main)',
                                outline: 'none',
                                width: '300px'
                            }}
                        />
                    </div>

                    {filteredProgress.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            {searchTerm ? 'Nenhum resultado encontrado para sua busca.' : 'Nenhum progresso registrado ainda.'}
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <th style={{ padding: '1rem' }}>Colaborador / Cargo</th>
                                        <th style={{ padding: '1rem' }}>Aula / Conteúdo</th>
                                        <th style={{ padding: '1rem' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Tentativas</th>
                                        <th style={{ padding: '1rem', textAlign: 'center' }}>Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProgress.map((p, i) => {
                                        const u = allUsers.find(user => user.id === p.userId);
                                        const userName = u ? u.name : p.userId;
                                        const lessonTitle = getLessonTitle(p.lessonId);

                                        return (
                                            <motion.tr
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                style={{ background: 'rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
                                            >
                                                <td style={{ padding: '1rem', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)' }}>
                                                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{userName}</div>
                                                    {u && <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 'normal' }}>{u.role === 'admin' ? 'Administrador' : 'Colaborador'}</div>}
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-dim)' }}>
                                                    {lessonTitle}
                                                    {lessonTitle === p.lessonId && <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.5 }}>(ID)</span>}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        background: p.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                                                        color: p.status === 'COMPLETED' ? '#34d399' : '#facc15',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '20px',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.8rem',
                                                        border: `1px solid ${p.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
                                                    }}>
                                                        {p.status === 'COMPLETED' ? '✔ Concluído' : '⏳ Pendente'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    {p.attempts ? (
                                                        <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{p.attempts}</span>
                                                    ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                                                    {p.score !== undefined ? (
                                                        <span style={{
                                                            fontWeight: 'bold',
                                                            color: p.score >= 7 ? 'var(--success)' : (p.score >= 4 ? 'var(--warning)' : 'var(--accent)')
                                                        }}>
                                                            {p.score.toFixed(1)}
                                                        </span>
                                                    ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
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
