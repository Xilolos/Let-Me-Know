'use client';

import { createWatcher } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import Link from 'next/link';
import { Maximize2, Minimize2, Check } from 'lucide-react';

export default function NewWatcherForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        // Basic Client side validation or feedback could go here
        startTransition(async () => {
            const result = await createWatcher(formData);
            if (result.success) {
                router.push('/');
            }
        });
    };

    return (
        <div className="page-container new-page">
            <header>
                <h1>New Watcher</h1>
            </header>

            <form action={handleSubmit} className="glass-panel form-stack">
                <div className="field-group">
                    <label htmlFor="name">Agent Name</label>
                    <input type="text" name="name" id="name" placeholder="e.g. Metro Updates" required autoFocus />
                </div>

                <div className={`field-group ${isExpanded ? 'expanded-overlay' : ''}`}>
                    <div className="label-row">
                        <label htmlFor="query">What should I look for?</label>
                        <button
                            type="button"
                            className="expand-btn"
                            onClick={() => setIsExpanded(!isExpanded)}
                            aria-label={isExpanded ? "Minimize" : "Expand"}
                        >
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>

                    <textarea
                        name="query"
                        id="query"
                        rows={isExpanded ? 15 : 3}
                        placeholder="e.g. Schedule changes, delays, or strikes in Athens Metro"
                        required
                        className={isExpanded ? 'expanded-textarea' : ''}
                    />

                    {isExpanded && (
                        <button
                            type="button"
                            className="primary-button done-btn"
                            onClick={() => setIsExpanded(false)}
                        >
                            <Check size={20} /> Done
                        </button>
                    )}
                </div>

                <div className="field-group">
                    <label htmlFor="urls">Target URLs (Optional - Leave empty for Auto-Search)</label>
                    <textarea
                        name="urls"
                        id="urls"
                        rows={3}
                        placeholder="Leave empty to let AI find sources..."
                    />
                </div>

                <button type="submit" className="primary-button" disabled={isPending}>
                    {isPending ? 'Creating Agent...' : 'Create Watcher'}
                </button>
            </form>

            <div className="close-btn-container">
                <Link href="/" className="close-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </Link>
            </div>

            <style jsx>{`
        .new-page {
          min-height: 80vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-bottom: 100px;
        }

        .label-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .expand-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
        }

        .expand-btn:hover {
            color: var(--accent-primary);
        }

        /* Expanded Mode Styles */
        .expanded-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-secondary);
            z-index: 2000; /* High z-index to cover everything */
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }

        .expanded-overlay .label-row {
            margin-top: calc(env(safe-area-inset-top) + 20px);
            margin-bottom: 20px;
        }

        .expanded-overlay label {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .expanded-textarea {
            flex-grow: 1;
            font-size: 1.1rem;
            line-height: 1.6;
            padding: 20px;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent-primary), transparent 80%);
        }

        .done-btn {
            margin-top: 20px;
            margin-bottom: calc(env(safe-area-inset-bottom) + 20px);
        }

        .close-btn-container {
          position: fixed;
          bottom: calc(20px + env(safe-area-inset-bottom));
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          z-index: 1000;
          pointer-events: none;
        }

        /* Target the Link component directly */
        :global(.close-btn) {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
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
