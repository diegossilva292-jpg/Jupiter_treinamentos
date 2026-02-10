import React, { useEffect, useState } from 'react';
import { api, type Certificate, type User } from '../services/api';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificatesViewProps {
    currentUser: User;
    onBack: () => void;
}

export const CertificatesView: React.FC<CertificatesViewProps> = ({ currentUser, onBack }) => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            api.getCertificates(currentUser.id).then(setCertificates).catch(err => console.error(err));
        }
    }, [currentUser]);

    const handleDownload = async (cert: Certificate) => {
        setDownloading(cert.id);
        const elementId = `cert-card-${cert.id}`;
        const element = document.getElementById(elementId);

        if (element) {
            try {
                // Determine layout based on aspect ratio (Paper is usually landscape for certs)
                const canvas = await html2canvas(element, {
                    scale: 3, // Higher scale for crisp text
                    backgroundColor: '#FDFBF7', // Match the paper color
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                // A4 Landscape size in mm: 297 x 210
                const pdf = new jsPDF({
                    orientation: 'landscape',
                    unit: 'mm',
                    format: 'a4'
                });

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Certificado_Jupiter_${cert.courseTitle}.pdf`);
            } catch (error) {
                console.error('Failed to generate PDF', error);
                alert('Erro ao gerar PDF. Tente novamente.');
            } finally {
                setDownloading(null);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="page-container"
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ marginRight: '1rem' }}>
                    &larr; Voltar
                </button>
                <h2 className="text-glow" style={{ margin: 0 }}>Meus Certificados</h2>
            </div>

            {certificates.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Seus certificados de conclusão aparecerão aqui.</p>
                    <p style={{ marginTop: '1rem' }}>Conclua todos os módulos de um curso para desbloquear seu certificado!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', maxWidth: '1000px', margin: '0 auto' }}>
                    {certificates.map((cert) => (
                        <div key={cert.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            {/* Certificate Card - Official Paper Design */}
                            <motion.div
                                id={`cert-card-${cert.id}`}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                whileHover={{ scale: 1.01 }}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1.414 / 1', // A4 Landscape ratio
                                    background: '#FDFBF7', // Warm paper white
                                    color: '#1a1a1a',
                                    padding: '4rem',
                                    position: 'relative',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: '"Lora", serif',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Geometric Background Pattern */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 0,
                                    opacity: 0.05,
                                    background: `
                                        repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%),
                                        repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 0, transparent 50%)
                                    `,
                                    backgroundSize: '30px 30px'
                                }} />

                                {/* Decorative Border Frame */}
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '20px',
                                    right: '20px',
                                    bottom: '20px',
                                    border: '2px solid #D4AF37', // Gold
                                    zIndex: 1,
                                    pointerEvents: 'none'
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    top: '25px',
                                    left: '25px',
                                    right: '25px',
                                    bottom: '25px',
                                    border: '1px solid #1a1a1a',
                                    zIndex: 1,
                                    pointerEvents: 'none'
                                }} />

                                {/* Logo Header - Removed */}

                                <div style={{ zIndex: 2, textAlign: 'center', width: '100%' }}>
                                    <h1 style={{
                                        fontFamily: '"Playfair Display", serif',
                                        fontSize: '3rem',
                                        fontWeight: '700',
                                        marginBottom: '0.5rem',
                                        color: '#2c3e50',
                                        letterSpacing: '1px'
                                    }}>
                                        Certificado de Participação
                                    </h1>

                                    <p style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '2rem', color: '#555' }}>
                                        Concedemos este certificado a
                                    </p>

                                    <h2 style={{
                                        fontFamily: '"Playfair Display", serif',
                                        fontSize: '4rem',
                                        margin: '1rem 0',
                                        color: '#1a1a1a',
                                        borderBottom: '2px solid #D4AF37',
                                        display: 'inline-block',
                                        paddingBottom: '0.5rem',
                                        minWidth: '60%'
                                    }}>
                                        {cert.userName}
                                    </h2>

                                    <p style={{ fontSize: '1.2rem', marginTop: '2rem', lineHeight: '1.6', maxWidth: '80%' }}>
                                        Por concluir com êxito o curso de treinamento profissional com o tema:
                                    </p>

                                    <h3 style={{
                                        fontSize: '2rem',
                                        fontWeight: '700',
                                        color: '#d35400', // Burnt Orange/Gold accent
                                        margin: '1rem 0'
                                    }}>
                                        {cert.courseTitle}
                                    </h3>

                                    <p style={{ fontSize: '1rem', marginTop: '1rem' }}>
                                        Concluído em: <strong>{new Date(cert.issuedAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                                    </p>

                                    {/* Footer / Signatures */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '4rem',
                                        width: '80%',
                                        margin: '4rem auto 0 auto'
                                    }}>
                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ borderTop: '1px solid #1a1a1a', width: '80%', margin: '0 auto 0.5rem auto' }} />
                                            <strong style={{ display: 'block', fontSize: '1rem' }}>DIEGO DA S. SANTOS</strong>
                                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Gerente de Treinamento</span>
                                        </div>

                                        {/* Seal/Badge in Center */}
                                        <div style={{ flex: 0.5, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '-20px' }}>
                                            <div style={{
                                                width: '120px', // Increased size for logo
                                                height: '120px',
                                                background: 'white', // White background for logo
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                                                border: '4px double #D4AF37', // Gold border
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    src="/logo-jupiter.png"
                                                    alt="Júpiter Internet"
                                                    style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                                                    crossOrigin="anonymous"
                                                />
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'center', flex: 1 }}>
                                            <div style={{ borderTop: '1px solid #1a1a1a', width: '80%', margin: '0 auto 0.5rem auto' }} />
                                            <strong style={{ display: 'block', fontSize: '1rem' }}>WELLINGSOM SILVA DUTRA</strong>
                                            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Diretor Executivo</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <button
                                className="btn"
                                onClick={() => handleDownload(cert)}
                                disabled={downloading === cert.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    minWidth: '200px'
                                }}
                            >
                                {downloading === cert.id ? 'Gerando PDF...' : '⬇ Baixar PDF Oficial'}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
