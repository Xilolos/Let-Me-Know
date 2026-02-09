'use client';

import { useState } from 'react';
import { markResultAsRead } from '@/lib/history-actions';
import { Check, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface Source {
    name: string;
    url: string;
}

interface ResultCardProps {
    id: number;
    watcherName: string;
    content: string;
    sources: string | null; // JSON string
    foundAt: Date | null;
    thumbnail?: string | null;
    isRead?: boolean;
}

export default function ResultCard({ id, watcherName, content, sources, foundAt, thumbnail, isRead }: ResultCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [markingRead, setMarkingRead] = useState(false);

    let parsedSources: Source[] = [];
    try {
        if (sources) {
            parsedSources = JSON.parse(sources);
        }
    } catch (e) { }

    const handleMarkRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setMarkingRead(true);
        await markResultAsRead(id);
        // Optimistic UI handled by parent revalidation or just hiding it logic
    };

    return (
        <div
            className={`glass-panel log-item ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded(!expanded)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', paddingRight: thumbnail ? '120px' : '1.5rem' }}
        >
            {/* Thumbnail */}
            {thumbnail && (
                <div style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    width: '90px',
                    height: '90px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0
                }}>
                    <Image
                        src={thumbnail}
                        alt="Thumbnail"
                        fill
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                            // Hide image on error by setting opacity to 0 or similar
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="log-header" style={{ marginRight: thumbnail ? '10px' : '0' }}>
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
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Sources:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {parsedSources.map((source, idx) => (
                            <a
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()} // Prevent card toggle
                                className="nav-pill"
                                style={{
                                    fontSize: '0.8rem',
                                    padding: '0.4rem 0.8rem',
                                    height: 'auto',
                                    width: 'auto',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    gap: '6px'
                                }}
                            >
                                <ExternalLink size={12} />
                                {source.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                {!expanded && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                        Tap to read more
                    </div>
                )}

                {!isRead && (
                    <button
                        onClick={handleMarkRead}
                        disabled={markingRead}
                        className="mark-read-btn"
                        style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: '1px solid var(--success)',
                            color: 'var(--success)',
                            borderRadius: '20px',
                            padding: '4px 12px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            opacity: markingRead ? 0.5 : 1
                        }}
                    >
                        <Check size={14} />
                        Mark as Read
                    </button>
                )}
            </div>
        </div>
    );
}
