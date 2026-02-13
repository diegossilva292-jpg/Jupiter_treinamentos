import React, { useState } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onEnded }) => {
    const [error, setError] = useState<string | null>(null);

    // onEnded is kept for interface compatibility but not used in iframe-based player
    // Future enhancement: use postMessage API to detect video end
    void onEnded;

    // DEBUG: Log every video URL received
    console.log('[VideoPlayer] Rendering with URL:', videoUrl);

    if (!videoUrl) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Vídeo indisponível (URL vazia)</div>;
    }

    // Detect video type
    const isFlussonic = videoUrl.includes('.m3u8');
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    // Convert URLs to embed format
    let embedUrl = videoUrl;

    if (isFlussonic) {
        // Convert .m3u8 URL to embed.html
        // From: https://flussonic-tv.jupiter.com.br/jupiter_treinamentos/file.mp4/index.m3u8
        // To:   https://flussonic-tv.jupiter.com.br/jupiter_treinamentos/file.mp4/embed.html
        embedUrl = videoUrl.replace('/index.m3u8', '/embed.html');
        console.log('[VideoPlayer] Flussonic embed URL:', embedUrl);
    } else if (isYoutube) {
        // Convert YouTube watch URL to embed
        // From: https://www.youtube.com/watch?v=VIDEO_ID
        // To:   https://www.youtube.com/embed/VIDEO_ID
        const videoId = videoUrl.includes('watch?v=')
            ? videoUrl.split('watch?v=')[1].split('&')[0]
            : videoUrl.split('youtu.be/')[1]?.split('?')[0];

        if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0`;
            console.log('[VideoPlayer] YouTube embed URL:', embedUrl);
        }
    }

    // Handle iframe load/error
    const handleIframeLoad = () => {
        console.log('[VideoPlayer] Iframe loaded successfully');
    };

    const handleIframeError = () => {
        console.error('[VideoPlayer] Iframe failed to load');
        setError('Não foi possível carregar o vídeo');
    };

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
                <iframe
                    src={embedUrl}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title="Video Player"
                />
            )}
        </div>
    );
};
