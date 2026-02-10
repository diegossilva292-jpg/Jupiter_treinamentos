import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    onEnded: () => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onEnded }) => {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const embedId = useRef<string>(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

    useEffect(() => {
        // Function to initialize player
        const initPlayer = () => {
            // Extract ID from URL
            let videoId = '';
            try {
                const matchWatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
                if (matchWatch && matchWatch[1]) {
                    videoId = matchWatch[1];
                } else if (videoUrl.includes('youtube.com/embed/')) {
                    const parts = videoUrl.split('embed/');
                    videoId = parts[1].split('?')[0];
                }
            } catch (e) {
                console.error("Error parsing video URL", e);
            }

            if (!videoId) return;

            if (window.YT && window.YT.Player) {
                playerRef.current = new window.YT.Player(embedId.current, {
                    videoId: videoId,
                    width: '100%',
                    height: '100%',
                    playerVars: {
                        autoplay: 0,
                        controls: 1,
                        rel: 0,
                        enablejsapi: 1,
                        origin: window.location.origin,
                    },
                    events: {
                        'onStateChange': (event: any) => {
                            // YT.PlayerState.ENDED === 0
                            if (event.data === 0) {
                                onEnded();
                            }
                        }
                    }
                });
            }
        };

        // Load API if not loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                initPlayer();
            };
        } else {
            initPlayer();
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) { /* ignore */ }
            }
        };
    }, [videoUrl, onEnded]);

    return (
        <div
            ref={containerRef}
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
            <div id={embedId.current} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        </div>
    );
};
