import React from 'react';
import { motion } from 'framer-motion';

interface CategorySelectorProps {
    onSelect: (category: string) => void;
}

const categories = [
    { id: 'Técnico de Campo', name: 'Técnico de Campo', icon: '🔧', color: 'var(--primary)' },
    { id: 'Suporte Técnico', name: 'Suporte Técnico', icon: '💻', color: '#10b981' },
    { id: 'Marketing', name: 'Marketing', icon: '📢', color: '#f59e0b' },
    { id: 'Vendas', name: 'Vendas', icon: '💼', color: '#ec4899' },
    { id: 'Administrativo', name: 'Administrativo', icon: '📊', color: '#8b5cf6' },
    { id: 'Gerência', name: 'Gerência', icon: '👔', color: '#6366f1' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100%',
            padding: '2rem'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '3rem' }}
            >
                <h1 className="text-glow" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    Escolha seu Perfil
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                    Selecione sua área de atuação para personalizarmos sua trilha de aprendizado.
                    Você verá apenas os cursos relevantes para sua função.
                </p>
            </motion.div>

            <motion.div
                className="category-grid"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    width: '100%',
                    maxWidth: '1000px'
                }}
            >
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        variants={{
                            hidden: { opacity: 0, scale: 0.9 },
                            show: { opacity: 1, scale: 1 }
                        }}
                        whileHover={{ scale: 1.05, translateY: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSelect(cat.id)}
                        className="glass-panel"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem',
                            cursor: 'pointer',
                            border: `1px solid ${cat.color}40`,
                            background: `linear-gradient(135deg, ${cat.color}10, ${cat.color}20)`,
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{
                            fontSize: '3.5rem',
                            marginBottom: '1rem',
                            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.3))'
                        }}>
                            {cat.icon}
                        </div>
                        <h3 style={{
                            color: cat.color,
                            margin: 0,
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            textShadow: `0 0 15px ${cat.color}40`
                        }}>
                            {cat.name}
                        </h3>
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};
