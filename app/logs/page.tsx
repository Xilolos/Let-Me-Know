import { db } from '@/lib/db';
import { results, watchers } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { getUserEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';

import ResultCard from '@/components/ResultCard';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
    const userEmail = await getUserEmail();
    if (!userEmail) redirect('/login');

    const allResults = await db.select({
        id: results.id,
        content: results.content,
        sources: results.sources,
        foundAt: results.foundAt,
        watcherName: watchers.name
    })
        .from(results)
        .leftJoin(watchers, eq(results.watcherId, watchers.id))
        .where(eq(watchers.userEmail, userEmail))
        .orderBy(desc(results.foundAt));

    return (
        <div className="page-container">
            <header className="dashboard-header">
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
                        <ResultCard
                            key={result.id}
                            watcherName={result.watcherName || 'Unknown'}
                            content={result.content}
                            sources={result.sources}
                            foundAt={result.foundAt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
