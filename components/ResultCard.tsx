'use client';

import { useState } from 'react';

interface Source {
    name: string;
    url: string;
}

interface ResultCardProps {
    watcherName: string;
    content: string;
    sources: string | null; // JSON string
    foundAt: Date | null;
}

export default function ResultCard({ watcherName, content, sources, foundAt }: ResultCardProps) {
    const [expanded, setExpanded] = useState(false);

    let parsedSources: Source[] = [];
    try {
        if (sources) {
            parsedSources = JSON.parse(sources);
        }
    } catch (e) {
        // fallback if parse fails
    }

    return (
        <div
            className={`glass-panel log-item ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
        >
            <div className="log-header">
                <span className="watcher-tag">{watcherName}</span>
                <span className="timestamp" suppressHydrationWarning>
                    {foundAt ? new Date(foundAt).toLocaleString() : ''}
                </span>
            </div>

            <div className="log-content" style={{
                margin: '1rem 0',
                lineHeight: '1.6',
                display: '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}>
                {content}
            </div>

            {expanded && parsedSources.length > 0 && (
                <div className="sources-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Sources:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {parsedSources.map((source, idx) => (
                            <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} // Prevent card toggle
                                className="action-btn secondary"
                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                            >
                                Visit {source.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {!expanded && (
                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
                    Tap to read full analysis & sources
                </div>
            )}
        </div>
    );
}
