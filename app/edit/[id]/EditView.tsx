'use client';

import Link from 'next/link';
import EditForm from './EditForm';
import TestRunPanel from '@/components/TestRunPanel';

export default function EditView({ watcher }: { watcher: any }) {
  return (
    <div className="edit-page">
      <div className="glass-panel form-container">
        <h2>Edit Watcher</h2>
        <EditForm watcher={watcher} />
        <TestRunPanel watcherId={watcher.id} />
      </div>

      <div className="close-btn-container">
        <Link href="/" className="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </Link>
      </div>

      <style jsx>{`
        .edit-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding-top: calc(20px + env(safe-area-inset-top)); /* Clear Dynamic Island but strictly align */
          padding-bottom: 120px;
        }

        .form-container {
          margin-bottom: 40px;
        }

        h2 {
          margin-bottom: 20px;
          text-align: center;
        }

        .close-btn-container {
          position: fixed;
          bottom: calc(20px + env(safe-area-inset-bottom));
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 1000; /* Ensure high layer */
          pointer-events: none;
        }

        /* Target the Link component directly */
        :global(.close-btn) {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15); /* Slightly more visible */
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          pointer-events: auto;
          text-decoration: none;
        }

        :global(.close-btn:active) {
          transform: scale(0.9);
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
