'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { results, watchers } from '@/lib/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { getUserEmail } from '@/lib/auth';
import { redirect, useSearchParams } from 'next/navigation';

import ResultCard from '@/components/ResultCard';
import Link from 'next/link';
import { Filter } from 'lucide-react';

interface Watcher {
    id: number;
    name: string;
}

interface Result {
    id: number;
    content: string;
    sources: string | null;
    foundAt: Date | null;
    isRead: boolean | null;
    thumbnail: string | null;
    watcherName: string | null;
}

export default function LogsPage() {
    const searchParams = useSearchParams();
    const view = searchParams.get('view') === 'history' ? 'history' : 'updates';
    const isHistory = view === 'history';

    const [allResults, setAllResults] = useState<Result[]>([]);
    const [allWatchers, setAllWatchers] = useState<Watcher[]>([]);
    const [selectedWatchers, setSelectedWatchers] = useState<number[]>([]);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch results and watchers
                const response = await fetch(`/api/results?view=${view}&watchers=${selectedWatchers.join(',')}`);
                const data = await response.json();

                setAllResults(data.results || []);
                setAllWatchers(data.watchers || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [view, selectedWatchers]);

    const toggleWatcher = (watcherId: number) => {
        setSelectedWatchers(prev =>
            prev.includes(watcherId)
                ? prev.filter(id => id !== watcherId)
                : [...prev, watcherId]
        );
    };

    const clearFilters = () => {
        setSelectedWatchers([]);
    };

    const hasActiveFilter = selectedWatchers.length > 0;

    return (
        <div className="page-container">
            <header className="dashboard-header sticky-header" style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: '16px', height: 'auto', position: 'relative' }}>
                <div style={{ flex: 1 }} />

                <div className="tabs-container" style={{ margin: 0, border: 'none', justifyContent: 'center' }}>
                    <Link
                        href="/logs"
                        className={`tab ${!isHistory ? 'active' : ''}`}
                    >
                        Updates
                    </Link>
                    <Link
                        href="/logs?view=history"
                        className={`tab ${isHistory ? 'active' : ''}`}
                    >
                        History
                    </Link>
                </div>

                {/* Filter Icon - Right side */}
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', position: 'relative', paddingRight: '16px' }}>
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        style={{
                            position: 'relative',
                            border: 'none',
                            background: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: 'var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        title="Filter by watcher"
                    >
                        <Filter size={20} />
                        {hasActiveFilter && (
                            <span style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                boxShadow: '0 0 8px var(--accent-primary)'
                            }} />
                        )}
                    </button>

                    {/* Filter Dropdown */}
                    {showFilterDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            padding: '12px',
                            minWidth: '220px',
                            maxWidth: '280px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                            zIndex: 1000
                        }}>
                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    Filter by Watcher
                                </span>
                                {hasActiveFilter && (
                                    <button
                                        onClick={clearFilters}
                                        style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--accent-primary)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px 6px'
                                        }}
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {allWatchers.map(watcher => (
                                <label
                                    key={watcher.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 4px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        gap: '8px'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedWatchers.includes(watcher.id)}
                                        onChange={() => toggleWatcher(watcher.id)}
                                        style={{
                                            accentColor: 'var(--accent-primary)',
                                            cursor: 'pointer',
                                            flexShrink: 0
                                        }}
                                    />
                                    <span style={{
                                        color: 'var(--text-primary)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        {watcher.name}
                                    </span>
                                </label>
                            ))}

                            {allWatchers.length === 0 && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '8px 4px' }}>
                                    No watchers found
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </header>

            {loading ? (
                <div className="empty-state">
                    <p>Loading...</p>
                </div>
            ) : allResults.length === 0 ? (
                <div className="empty-state">
                    <p>{isHistory ? 'No history yet.' : 'All caught up!'}</p>
                    <small>{isHistory ? 'Mark items as read to see them here.' : 'No new notifications.'}</small>
                </div>
            ) : (
                <div className="timeline">
                    {allResults.map((result) => (
                        <ResultCard
                            key={result.id}
                            id={result.id}
                            watcherName={result.watcherName || 'Unknown'}
                            content={result.content}
                            sources={result.sources}
                            foundAt={result.foundAt}
                            thumbnail={result.thumbnail}
                            isRead={result.isRead || false}
                        />
                    ))}
                </div>
            )
            }

            <style>{`
                .tabs-container {
                    display: flex;
                    gap: 8px;
                    background: var(--bg-secondary);
                    padding: 4px;
                    border-radius: 20px;
                    border: 1px solid var(--border-color);
                }
                
                .tab {
                    padding: 6px 20px;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.9rem;
                    border-radius: 16px;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                
                .tab.active {
                    background: var(--accent-primary);
                    color: white;
                    box-shadow: 0 0 15px var(--accent-primary);
                }
                
                /* AMOLED mode - increase contrast */
                :global(.amoled) .tabs-container {
                    background: rgba(255, 255, 255, 0.12);
                    border-color: rgba(255, 255, 255, 0.3);
                }
                
                :global(.amoled) .tab {
                    color: rgba(255, 255, 255, 0.6);
                }
                
                :global(.amoled) .tab.active {
                    background: var(--accent-primary);
                    color: white;
                    box-shadow: 0 0 20px var(--accent-primary);
                    border: 1px solid var(--accent-primary);
                }
                
                /* Remove old underline style */
                .tab.active::after {
                    display: none;
                }
            `}</style>
        </div >
    );
}
