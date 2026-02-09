
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { watchers } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { runManualCheck } from '@/lib/actions';
import ManualCheckButton from '@/components/ManualCheckButton';
import WatcherCard from '@/components/WatcherCard';
import { getUserEmail } from '@/lib/auth';
import { getUserName } from '@/lib/username';
import { redirect } from 'next/navigation';

// Force dynamic since we're fetching from DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const userEmail = await getUserEmail();
  const userName = await getUserName();

  if (!userEmail) {
    redirect('/login');
  }

  // Fetch only this user's watchers
  const allWatchers = await db.select()
    .from(watchers)
    .where(eq(watchers.userEmail, userEmail))
    .orderBy(desc(watchers.createdAt));

  return (
    <div className="page-container">
      <header className="dashboard-header sticky-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="header-left">
          <div className="logo-container">
            <Image
              src="/icon.png"
              alt="LMK Logo"
              width={32}
              height={32}
              className="app-logo"
            />
            <h1>Let Me Know</h1>
          </div>
          {userName && <p className="user-badge">Hello, {userName}</p>}
        </div>

        {/* Manual Check Button - Right side */}
        <div style={{ paddingRight: '16px' }}>
          {allWatchers.length > 0 && <ManualCheckButton />}
        </div>
      </header>

      {allWatchers.length === 0 ? (
        <div className="empty-state">
          <div className="illustration">👀</div>
          <h2>No watchers yet</h2>
          <p>Tap the + button to create your first AI agent.</p>
        </div>
      ) : (
        <div className="watchers-grid">
          {allWatchers.map((watcher, idx) => (
            <WatcherCard
              key={watcher.id}
              id={watcher.id}
              name={watcher.name}
              query={watcher.query}
              status={watcher.status || 'active'}
              lastRunAt={watcher.lastRunAt}
              schedule={watcher.schedule || '0 * * * *'}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
