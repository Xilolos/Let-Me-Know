'use client';

import { useState } from 'react';
import { toggleWatcherStatus, deleteWatcher, runManualCheck } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

interface WatcherCardProps {
  id: number;
  name: string;
  query: string;
  status: string;
  lastRunAt: Date | null;
  index: number;
}

export default function WatcherCard({ id, name, query, status, lastRunAt, index }: WatcherCardProps) {
  // Optimistic UI could be added here, but for simplicity relying on server revalidation
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if we didn't click a button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    router.push(`/edit/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this watcher?')) {
      setIsDeleting(true);
      await deleteWatcher(id);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWatcherStatus(id, status);
  }

  const handleRunOnce = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChecking(true);
    try {
      const result = await runManualCheck(id);
      if (result.success) {
        alert(`Check complete for "${name}"!`);
      } else {
        alert(`Check failed: ${result.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`glass-panel card ${status === 'paused' ? 'paused' : ''}`}
      role="button"
      tabIndex={0}
    >
      <div className="card-header">
        <div className="status-indicator" />
        <h3>{name}</h3>

        <button
          onClick={handleRunOnce}
          disabled={isChecking}
          className={`icon-btn run-btn ${isChecking ? 'spinning' : ''}`}
          title="Run this watcher now"
        >
          <Play size={16} fill={isChecking ? "currentColor" : "none"} />
        </button>

        <button onClick={handleDelete} disabled={isDeleting} className="icon-btn delete-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>

      <p className="query">"{query}"</p>

      <div className="card-footer">
        <span className="last-run">
          {lastRunAt ? `Checked ${new Date(lastRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never run'}
        </span>

        <button
          onClick={handleToggle}
          className={`toggle-btn ${status}`}
        >
          {status === 'active' ? 'Active' : 'Paused'}
        </button>
      </div>

      <style jsx>{`
        .card {
          margin-bottom: 16px;
          transition: transform 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          opacity: 0; /* Start hidden for animation */
          animation: blurIn 0.5s ease-out forwards;
          animation-delay: ${index * 0.1}s;
        }
        
        .card:active {
            transform: scale(0.98);
        }
        
        .card.paused {
          opacity: 0.7;
          filter: grayscale(0.5);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${status === 'active' ? 'var(--success)' : 'var(--text-muted)'};
          box-shadow: ${status === 'active' ? '0 0 8px var(--success)' : 'none'};
        }

        h3 {
          font-size: 1.1rem;
          font-weight: 600;
          flex: 1;
        }

        .query {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 16px;
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .last-run {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .toggle-btn {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: var(--text-primary);
          font-size: 0.8rem;
          cursor: pointer;
        }
        
        .toggle-btn.active {
          background: rgba(var(--success-rgb), 0.1);
          color: var(--success);
          border-color: var(--success);
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px; /* Increased touch target */
          border-radius: 8px;
          display: flex; /* Ensure center alignment */
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-btn:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
        }
        
        .delete-btn:hover {
          color: var(--error);
          background: rgba(var(--error), 0.1); /* Subtle red bg context if possible, or just --bg-secondary */
        }

        .run-btn:hover {
            color: var(--accent-primary);
        }

        .spinning {
            animation: spin 1s linear infinite;
            color: var(--accent-primary);
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
