'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (pathname.startsWith('/edit/') || pathname === '/new') return null;

  const handleNav = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="mobile-nav">
      <div
        onClick={() => handleNav('/')}
        className={`nav-pill ${isActive('/') ? 'active' : ''}`}
        role="button"
      >
        <span>Dashboard</span>
      </div>

      <div className="fab-wrapper">
        <div
          onClick={() => handleNav('/new')}
          className="nav-fab"
          role="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </div>
      </div>

      <div
        onClick={() => handleNav('/logs')}
        className={`nav-pill ${isActive('/logs') ? 'active' : ''}`}
        role="button"
      >
        <span>Results</span>
      </div>

      <style jsx>{`
        .mobile-nav {
          position: fixed;
          bottom: calc(20px + env(safe-area-inset-bottom));
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center; /* Center everything */
          align-items: center;
          gap: 24px; /* Space between buttons */
          z-index: 9999;
          pointer-events: none; /* Container is passthrough */
        }

        .nav-pill {
          pointer-events: auto; /* Catch clicks */
          background: rgba(var(--bg-card-rgb), 0.85); /* Slightly more opaque */
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 24px;
          border-radius: 30px;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.9rem;
          transition: transform 0.1s, background 0.2s, color 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          min-width: 110px; /* Ensure consistent width */
          user-select: none;
        }

        .nav-pill:active {
            transform: scale(0.95);
        }

        .nav-pill.active {
          background: rgba(255, 255, 255, 0.15);
          color: var(--text-primary);
          border-color: rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 15px rgba(255,255,255,0.1);
        }

        .fab-wrapper {
            pointer-events: auto;
        }

        .nav-fab {
          width: 56px; /* Slightly smaller to match pills better */
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(var(--accent-primary-rgb), 0.4); /* Colored shadow */
          transition: transform 0.2s;
          cursor: pointer;
          user-select: none;
        }

        .nav-fab:active {
            transform: scale(0.9);
        }
      `}</style>
    </nav>
  );
}
