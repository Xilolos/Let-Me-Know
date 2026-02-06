import { db } from '@/lib/db';
import { watchers } from '@/lib/schema';
import { desc } from 'drizzle-orm';
import WatcherCard from '@/components/WatcherCard';
import ManualCheckButton from '@/components/ManualCheckButton';

// Force dynamic since we're fetching from DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const allWatchers = await db.select().from(watchers).orderBy(desc(watchers.createdAt));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Your Watchers</h1>
        <ManualCheckButton />
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
