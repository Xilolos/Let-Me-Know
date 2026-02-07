import Link from 'next/link';
import { db } from '@/lib/db';
import { watchers } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { runManualCheck } from '@/lib/actions';
import ManualCheckButton from '@/components/ManualCheckButton';
import WatcherCard from '@/components/WatcherCard';
import LogoutButton from '@/components/LogoutButton';
import { getUserEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Force dynamic since we're fetching from DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const userEmail = await getUserEmail();

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
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo-container">
            <img src="/logo.JPG" alt="LMK Logo" className="app-logo" />
            <h1>Let Me Know</h1>
          </div>
          <p className="user-badge">{userEmail}</p>
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '8px' }}>
          <ManualCheckButton />
          <LogoutButton />
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
