import React, { useState, useEffect, useRef } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    onEnded: () => void;
    onProgress?: (percentWatched: number) => void;
}

// YouTube Player API types
declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onEnded, onProgress }) => {
    const [error, setError] = useState<string | null>(null);
    const [watchedPercent, setWatchedPercent] = useState(0);
    const youtubePlayerRef = useRef<any>(null);
    const playerContainerRef = useRef<HTMLDivElement>(null);
    const [ytApiReady, setYtApiReady] = useState(false);

    // DEBUG: Log every video URL received
    console.log('[VideoPlayer] Rendering with URL:', videoUrl);

    if (!videoUrl) {
        return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Vídeo indisponível (URL vazia)</div>;
    }

    // Detect video type
    const isFlussonic = videoUrl.includes('.m3u8');
    const isYoutube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

    // Extract YouTube video ID
    const getYouTubeVideoId = (url: string): string | null => {
        if (url.includes('watch?v=')) {
            return url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1]?.split('?')[0];
        }
        return null;
    };

    const youtubeVideoId = isYoutube ? getYouTubeVideoId(videoUrl) : null;

    // Load YouTube iFrame API
    useEffect(() => {
        if (!isYoutube) return;

        // Check if API is already loaded
        if (window.YT && window.YT.Player) {
            setYtApiReady(true);
            return;
        }

        // Load the API script
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // Set the API ready callback
        window.onYouTubeIframeAPIReady = () => {
            console.log('[VideoPlayer] YouTube API Ready');
            setYtApiReady(true);
        };

        return () => {
            // Cleanup
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
            }
        };
    }, [isYoutube]);

    // Initialize YouTube Player
    useEffect(() => {
        if (!isYoutube || !ytApiReady || !youtubeVideoId || !playerContainerRef.current) return;

        console.log('[VideoPlayer] Initializing YouTube Player for:', youtubeVideoId);

        youtubePlayerRef.current = new window.YT.Player(playerContainerRef.current, {
            videoId: youtubeVideoId,
            playerVars: {
                autoplay: 0,
                rel: 0,
                modestbranding: 1,
                enablejsapi: 1
            },
            events: {
                onReady: (_event: any) => {
                    console.log('[VideoPlayer] YouTube Player Ready');
                },
                onStateChange: (event: any) => {
                    console.log('[VideoPlayer] YouTube State Change:', event.data);

                    // YT.PlayerState.ENDED = 0
                    if (event.data === 0) {
                        console.log('[VideoPlayer] YouTube video ended, calling onEnded');
                        onEnded();
                    }
                },
                onError: (event: any) => {
                    console.error('[VideoPlayer] YouTube Player Error:', event.data);
                    setError('Erro ao carregar vídeo do YouTube');
                }
            }
        });

        // Optional: Track progress
        const progressInterval = setInterval(() => {
            if (youtubePlayerRef.current && youtubePlayerRef.current.getDuration) {
                const duration = youtubePlayerRef.current.getDuration();
                const currentTime = youtubePlayerRef.current.getCurrentTime();

                if (duration > 0) {
                    const percent = Math.floor((currentTime / duration) * 100);
                    setWatchedPercent(percent);

                    if (onProgress) {
                        onProgress(percent);
                    }
                }
            }
        }, 2000); // Check every 2 seconds

        return () => {
            clearInterval(progressInterval);
            if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
                youtubePlayerRef.current.destroy();
            }
        };
    }, [ytApiReady, youtubeVideoId, isYoutube, onEnded, onProgress]);

    // Flussonic embed URL
    const getFlussonicEmbedUrl = (url: string): string => {
        return url.replace('/index.m3u8', '/embed.html');
    };

    const flussonicEmbedUrl = isFlussonic ? getFlussonicEmbedUrl(videoUrl) : '';

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
            ) : isYoutube ? (
                <>
                    {/* YouTube Player Container */}
                    <div
                        ref={playerContainerRef}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%'
                        }}
                    />

                    {/* Progress Indicator */}
                    {watchedPercent > 0 && watchedPercent < 100 && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: `${watchedPercent}%`,
                                height: '4px',
                                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                                transition: 'width 0.5s',
                                zIndex: 10,
                                pointerEvents: 'none'
                            }}
                        />
                    )}
                </>
            ) : (
                // Flussonic or other iframes
                <iframe
                    src={flussonicEmbedUrl || videoUrl}
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
                    onLoad={() => console.log('[VideoPlayer] Flussonic iframe loaded')}
                    onError={() => setError('Erro ao carregar vídeo')}
                    title="Video Player"
                />
            )}
        </div>
    );
};
