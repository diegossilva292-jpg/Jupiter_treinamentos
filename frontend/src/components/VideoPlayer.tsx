import React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
    videoUrl: string;
    onEnded: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onEnded }) => {
    // Cast to any to avoid TS error with props
    const ReactPlayerAny = ReactPlayer as any;

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
            <ReactPlayerAny
                url={videoUrl}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                controls
                onEnded={onEnded}
                onError={(e) => console.error('Video Player Error:', e)}
                config={{
                    file: {
                        forceHLS: videoUrl.endsWith('.m3u8'),
                        hlsOptions: {
                            // Helper options for HLS
                            debug: true,
                        }
                    }
                } as any}
            />
        </div>
    );
};
