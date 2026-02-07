'use client';

import { useRouter, usePathname } from 'next/navigation';

import { User, Settings, Home, Bell } from 'lucide-react';

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  if (pathname.startsWith('/edit/') || pathname === '/new') return null;
  if (pathname === '/login') return null;

  const handleNav = (path: string) => {
    router.push(path);
  };

  return (
    <nav className="mobile-nav">

      {/* Account Tab (Left) */}
      <div
        onClick={() => handleNav('/account')}
        className={`nav-pill ${isActive('/account') ? 'active' : ''}`}
        role="button"
      >
        <User size={20} />
        <span className="sr-only">Account</span>
      </div>

      {/* Dashboard (Middle Left) */}
      <div
        onClick={() => handleNav('/')}
        className={`nav-pill ${isActive('/') ? 'active' : ''}`}
        role="button"
      >
        <Home size={20} />
        <span className="sr-only">Home</span>
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

      {/* Results (Middle Right) */}
      <div
        onClick={() => handleNav('/logs')}
        className={`nav-pill ${isActive('/logs') ? 'active' : ''}`}
        role="button"
      >
        <Bell size={20} />
        <span className="sr-only">Results</span>
      </div>

      {/* Settings Tab (Right) */}
      <div
        onClick={() => handleNav('/settings')}
        className={`nav-pill ${isActive('/settings') ? 'active' : ''}`}
        role="button"
      >
        <Settings size={20} />
        <span className="sr-only">Settings</span>
      </div>

    </nav>
  );
}
