import React, { useState } from 'react';
import { api, setToken, type User } from '../services/api';
import { motion } from 'framer-motion';

interface LoginProps {
    onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCustomLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.login(email, password);

            // Map external response to internal User structure
            // Defaulting to Basic Role since API doesn't return role yet
            const mappedUser: User = {
                id: response.user.usuario, // Using username as ID for uniqueness
                name: response.user.nome || response.user.usuario,
                role: response.user.role || (['admin', 'developer', 'dev'].includes(response.user.usuario.toLowerCase()) ? 'admin' : 'student'),
                xp: response.user.xp || 0
            };

            setToken(response.accessToken);

            onLogin(mappedUser);
        } catch (err) {
            setError('Falha no login. Verifique suas credenciais.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--glass-border)',
        background: 'rgba(0,0,0,0.2)',
        color: 'var(--text-main)',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.3s, box-shadow 0.3s'
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100%', // Changed from 100vh to 100% since parent handles height
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <motion.div
                className="glass-panel"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '3rem',
                    textAlign: 'center',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--glass-border)'
                }}
            >
                <div style={{ marginBottom: '2.5rem' }}>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{ marginBottom: '1rem' }}
                    >
                        <img
                            src="/logo-jupiter.png"
                            alt="Júpiter Internet"
                            style={{ height: '120px', objectFit: 'contain' }}
                        />
                    </motion.div>
                    <motion.h1
                        className="text-glow"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontSize: '2.5rem', fontFamily: 'var(--font-display)', letterSpacing: '2px' }}
                    >
                        JUPITER TREINAMENTOS
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{ color: 'var(--text-muted)', margin: 0 }}
                    >
                        Acesse sua área de treinamento
                    </motion.p>
                </div>

                <form onSubmit={handleCustomLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2.5rem' }}>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                        <input
                            type="text"
                            placeholder="Nome de usuário"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={inputStyle}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.boxShadow = '0 0 10px var(--primary-glow)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                        <input
                            type="password"
                            placeholder="Senha"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={inputStyle}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.boxShadow = '0 0 10px var(--primary-glow)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = 'var(--glass-border)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </motion.div>

                    {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--accent)', fontSize: '0.875rem', textShadow: '0 0 5px rgba(236, 72, 153, 0.5)' }}>{error}</motion.p>}

                    <motion.button
                        type="submit"
                        className="btn"
                        style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {loading ? 'Entrando...' : 'INICIAR SESSÃO'}
                    </motion.button>
                </form>

                {/* Demo Mode removed as requested */}
            </motion.div>
        </div>
    );
};
