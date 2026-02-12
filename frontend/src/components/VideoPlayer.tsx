import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import Hls from 'hls.js';

// Polyfill HLS for ReactPlayer if needed
if (typeof window !== 'undefined' && !(window as any).Hls) {
    (window as any).Hls = Hls;
}

interface VideoPlayerProps {
    videoUrl: string;
    onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onEnded }) => {
    // Cast to any to avoid TS error with props
    const ReactPlayerAny = ReactPlayer as any;
    const [error, setError] = useState<string | null>(null);

    if (!videoUrl) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Vídeo indisponível (URL vazia)</div>;
    }

    return (
        <div
            style={{
                position: 'relative',
                paddingBottom: '56.25%',
                height: 0,
                overflow: 'hidden',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                background: '#000'
            }}
        >
            {error ? (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ marginBottom: '1rem' }}>Erro na reprodução</h3>
                    <p>{error}</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem' }}>URL: {videoUrl}</p>
                    <button
                        className="btn"
                        onClick={() => { setError(null); }}
                        style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
                    >
                        Tentar Novamente
                    </button>
                </div>
            ) : (
                <ReactPlayerAny
                    url={videoUrl}
                    width="100%"
                    height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    controls
                    onEnded={onEnded}
                    onError={(e: any, data: any) => {
                        console.error('Video Player Error:', e, data);
                        let msg = 'Não foi possível carregar o vídeo.';
                        if (e?.type === 'networkError') msg += ' Erro de rede (CORS ou Falha de Conexão).';
                        if (e?.type === 'mediaError') msg += ' Formato não suportado ou arquivo corrompido.';
                        setError(msg);
                    }}
                    config={{
                        file: {
                            forceHLS: videoUrl.includes('.m3u8'),
                            hlsOptions: {
                                debug: false,
                                enableWorker: true,
                            }
                        }
                    } as any}
                />
            )}
        </div>
    );
};
