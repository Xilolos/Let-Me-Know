'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (pathname.startsWith('/edit/') || pathname === '/new') return null;

  return (
    <nav className="mobile-nav">
      <Link href="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        <span>Dashboard</span>
      </Link>

      <Link href="/new" className="nav-fab">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </Link>

      <Link href="/logs" className={`nav-item ${isActive('/logs') ? 'active' : ''}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span>Results</span>
      </Link>

      <style jsx>{`
        .mobile-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: calc(var(--nav-height) + var(--safe-area-bottom));
          background: rgba(10, 10, 20, 0.85); /* Slightly darker than glass-panel */
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          justify-content: space-around;
          align-items: flex-start;
          padding-top: 10px;
          z-index: 100;
          padding-bottom: var(--safe-area-bottom);
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 500;
          gap: 4px;
          width: 64px;
        }

        .nav-item.active {
          color: var(--accent-primary);
        }

        .nav-fab {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: -30px; /* Pull up */
          box-shadow: 0 8px 24px -6px var(--accent-primary);
          transition: transform 0.2s;
        }
        
        .nav-fab:active {
            transform: scale(0.95);
        }
      `}</style>
    </nav>
  );
}
