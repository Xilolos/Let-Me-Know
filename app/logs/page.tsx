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
            <header className="dashboard-header sticky-header">
                <h1>{isHistory ? 'History' : 'Updates'}</h1>
            </header>

            <div className="tabs-container">
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
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                    gap: 20px;
                    padding: 0 4px;
                }
                
                .tab {
                    padding: 10px 4px;
                    color: var(--text-muted);
                    text-decoration: none;
                    font-size: 0.95rem;
                    position: relative;
                    transition: color 0.2s;
                }
                
                .tab.active {
                    color: var(--accent-primary);
                    font-weight: 500;
                }
                
                .tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--accent-primary);
                }
            `}</style>
        </div>
    );
}
