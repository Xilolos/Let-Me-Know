import { db } from '@/lib/db';
import { results, watchers } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
    const allResults = await db.select({
        id: results.id,
        content: results.content,
        foundAt: results.foundAt,
        watcherName: watchers.name
    })
        .from(results)
        .leftJoin(watchers, eq(results.watcherId, watchers.id))
        .orderBy(desc(results.foundAt));

    return (
        <div className="logs-page">
            <header>
                <h1>Notifications</h1>
            </header>

            {allResults.length === 0 ? (
                <div className="empty-state">
                    <p>No updates found yet.</p>
                    <small>The AI is still looking...</small>
                </div>
            ) : (
                <div className="timeline">
                    {allResults.map((result) => (
                        <div key={result.id} className="glass-panel log-item">
                            <div className="log-header">
                                <span className="watcher-tag">{result.watcherName}</span>
                                <span className="timestamp">
                                    {result.foundAt ? new Date(result.foundAt).toLocaleString() : ''}
                                </span>
                            </div>
                            <div className="log-content">
                                {result.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
