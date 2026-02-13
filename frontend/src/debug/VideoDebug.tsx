import React, { useEffect, useState } from 'react';

/**
 * Debug component to test video URLs directly
 * Insert this temporarily into App.tsx to test video playback
 */
export const VideoDebug: React.FC = () => {
    const [testResults, setTestResults] = useState<any[]>([]);

    useEffect(() => {
        const testUrls = [
            'https://www.youtube.com/watch?v=p-tX8lq99IA',
            'https://flussonic-tv.jupiter.com.br/jupiter_treinamentos/c8d29347-e966-4f55-af30-b58f69332b13.mp4/index.m3u8'
        ];

        const runTests = async () => {
            const results = [];
            for (const url of testUrls) {
                try {
                    const response = await fetch(url, { method: 'HEAD' });
                    results.push({
                        url,
                        status: response.status,
                        headers: Object.fromEntries(response.headers.entries()),
                        accessible: response.ok
                    });
                } catch (error) {
                    results.push({
                        url,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        accessible: false
                    });
                }
            }
            setTestResults(results);
        };

        runTests();
    }, []);

    return (
        <div style={{ padding: '2rem', background: '#1a1b3c', color: 'white', fontFamily: 'monospace' }}>
            <h2>🔍 Video URL Debug</h2>
            {testResults.map((result, idx) => (
                <div key={idx} style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                    <h3>Test {idx + 1}</h3>
                    <p><strong>URL:</strong> {result.url}</p>
                    <p><strong>Status:</strong> <span style={{ color: result.accessible ? 'lime' : 'red' }}>{result.status || 'FAILED'}</span></p>
                    {result.error && <p style={{ color: 'orange' }}><strong>Error:</strong> {result.error}</p>}
                    {result.headers && (
                        <details>
                            <summary>Headers</summary>
                            <pre>{JSON.stringify(result.headers, null, 2)}</pre>
                        </details>
                    )}
                </div>
            ))}

            <h3>Direct Video Test</h3>
            <video
                src="https://flussonic-tv.jupiter.com.br/jupiter_treinamentos/c8d29347-e966-4f55-af30-b58f69332b13.mp4/index.m3u8"
                controls
                style={{ width: '100%', maxWidth: '600px', marginTop: '1rem' }}
            />
        </div>
    );
};
