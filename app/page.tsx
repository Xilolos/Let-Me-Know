import { db } from '@/lib/db';
import { watchers } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import WatcherCard from '@/components/WatcherCard';

// Force dynamic since we're fetching from DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const allWatchers = await db.select().from(watchers).orderBy(desc(watchers.createdAt));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Your Watchers</h1>

        {/* Helper for manual trigger during dev/demo */}
        <form action="/api/cron" method="GET" target="_blank">
          <button type="submit" className="glass-panel icon-btn" title="Run Manual Check">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>
          </button>
        </form>
      </header>

      {allWatchers.length === 0 ? (
        <div className="empty-state">
          <div className="illustration">👀</div>
          <h2>No watchers yet</h2>
          <p>Tap the + button to create your first AI agent.</p>
        </div>
      ) : (
        <div className="watchers-grid">
          {allWatchers.map((watcher) => (
            <WatcherCard
              key={watcher.id}
              {...watcher}
              status={watcher.status || 'active'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
