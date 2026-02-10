import React from 'react';

export const Background: React.FC = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            background: 'var(--bg-deep)'
        }}>
            {/* Grid Effect */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                transform: 'perspective(500px) rotateX(60deg)',
                animation: 'grid-move 20s linear infinite',
                opacity: 0.5
            }} />

            {/* Floating Orbs */}
            <div className="animate-float" style={{
                position: 'absolute',
                top: '20%',
                left: '10%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
                opacity: 0.4,
                filter: 'blur(40px)',
                animationDuration: '10s'
            }} />

            <div className="animate-float" style={{
                position: 'absolute',
                top: '60%',
                right: '10%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, var(--secondary-glow) 0%, transparent 70%)',
                opacity: 0.3,
                filter: 'blur(50px)',
                animationDuration: '15s',
                animationDelay: '2s'
            }} />

            <div className="animate-float" style={{
                position: 'absolute',
                bottom: '-10%',
                left: '40%',
                width: '350px',
                height: '350px',
                background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
                opacity: 0.3,
                filter: 'blur(45px)',
                animationDuration: '12s',
                animationDelay: '5s'
            }} />

            <style>{`
        @keyframes grid-move {
          0% { transform: perspective(500px) rotateX(60deg) translateY(0); }
          100% { transform: perspective(500px) rotateX(60deg) translateY(40px); }
        }
      `}</style>
        </div>
    );
};
