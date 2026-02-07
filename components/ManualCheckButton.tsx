'use client';

import { useState } from 'react';
import { runManualCheck } from '@/lib/actions';

export default function ManualCheckButton() {
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        setLoading(true);
        try {
            const result = await runManualCheck();
            if (result.success) {
                // Use a simple alert for now, or toast if available
                // Assuming no toast lib installed yet based on package.json
                const logMsg = result.logs ? result.logs.slice(-5).join('\n') : '';
                alert(`Manual check complete!\nLogs:\n${logMsg}`);
            } else {
                alert(`Check failed: ${result.error || 'Unknown error'}`);
            }
        } catch (e: any) {
            console.error(e);
            alert(`Check failed: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheck}
            disabled={loading}
            className={`icon-btn ${loading ? 'spinning' : ''}`}
            title="Run Manual Check"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" /></svg>

            {/* hidden status text for accessibility/debugging */}
            <span className="sr-only">{loading ? 'Running...' : 'Run Check'}</span>

            <style jsx>{`
            /* ... existing styles ... */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            /* ... ensure previous styles are preserved or use the previous block */
        .icon-btn {
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: transparent;
          transition: all 0.2s;
        }

        .icon-btn:hover {
            background: rgba(255,255,255,0.05);
            color: var(--text-primary);
        }
        
        .spinning svg {
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
        </button>
    );
}
