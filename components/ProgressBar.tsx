'use client';

import { useEffect, useState } from 'react';

export default function ProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Start progress on mount (initial load)
        setProgress(30);

        const timer1 = setTimeout(() => setProgress(60), 200);
        const timer2 = setTimeout(() => setProgress(85), 500);
        const timer3 = setTimeout(() => setProgress(100), 800);

        const finishTimer = setTimeout(() => {
            setProgress(0);
        }, 1100);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(finishTimer);
        };
    }, []); // Run only on mount

    if (progress === 0) return null;

    return (
        <div className="progress-container">
            <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
            />
            <style jsx>{`
        .progress-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          z-index: 10000;
          pointer-events: none;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          transition: width 0.3s ease-out;
          box-shadow: 0 0 10px var(--accent-primary);
        }
      `}</style>
        </div>
    );
}
