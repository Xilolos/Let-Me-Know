'use client';

import { useState } from 'react';
import { runManualCheck } from '@/lib/actions';
import { Zap } from 'lucide-react';

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
            title="Check All Watchers"
        >
            <Zap size={20} />

            {/* hidden status text for accessibility/debugging */}
            <span className="sr-only">{loading ? 'Running...' : 'Run Check'}</span>

            <style jsx>{`
            .spinning {
                animation: pulse 1.5s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.95); }
                100% { opacity: 1; transform: scale(1); }
            }
        `}</style>
        </button>
    );
}
