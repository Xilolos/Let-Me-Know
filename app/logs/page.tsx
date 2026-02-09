import { db } from '@/lib/db';
import { results, watchers } from '@/lib/schema';
import { desc, eq, and } from 'drizzle-orm';
import { getUserEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';

import ResultCard from '@/components/ResultCard';
import Link from 'next/link';

interface LogsPageProps {
    searchParams: Promise<{ view?: string }>;
}

export default async function LogsPage({ searchParams }: LogsPageProps) {
    const userEmail = await getUserEmail();
    if (!userEmail) redirect('/login');

    const params = await searchParams;
    const view = params.view === 'history' ? 'history' : 'updates';
    const isHistory = view === 'history';

    const allResults = await db.select({
        id: results.id,
        content: results.content,
        sources: results.sources,
        foundAt: results.foundAt,
        isRead: results.isRead,
        thumbnail: results.thumbnail,
        watcherName: watchers.name
    })
        .from(results)
        .leftJoin(watchers, eq(results.watcherId, watchers.id))
        .where(and(
            eq(watchers.userEmail, userEmail),
            eq(results.isRead, isHistory)
        ))
        .orderBy(desc(results.foundAt));

    return (
        <div className="page-container">
            <header className="dashboard-header sticky-header" style={{ justifyContent: 'center', paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: '16px', height: 'auto' }}>
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
            </header>

            {allResults.length === 0 ? (
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
            )}

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
                
                /* Remove old underline style */
                .tab.active::after {
                    display: none;
                }
            `}</style>
        </div>
    );
}
