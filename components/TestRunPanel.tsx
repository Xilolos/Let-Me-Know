
'use client';

import { useState } from 'react';
import { testWatcher } from '@/lib/actions';

export default function TestRunPanel({ watcherId }: { watcherId: number }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState('');

    const handleTest = async () => {
        setLoading(true);
        setResult(null);
        setError('');

        try {
            const res = await testWatcher(watcherId);
            if (res.success) {
                setResult(res.data);
            } else {
                setError(res.error || 'Unknown error');
            }
        } catch (e) {
            setError('Failed to run test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel test-panel">
            <div className="test-header">
                <h3>Debug & Test</h3>
                <button
                    onClick={handleTest}
                    disabled={loading}
                    className="primary-button small-btn"
                >
                    {loading ? 'Running...' : 'Run Test'}
                </button>
            </div>

            <p className="description">
                Check if your watcher is finding the right content. This runs a single check immediately without sending emails.
            </p>

            {error && (
                <div className="result-box error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {result && (
                <div className="result-box success">
                    <div className="result-row">
                        <span className="label">Checked URL:</span>
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="url-link">
                            {new URL(result.url).hostname}...
                        </a>
                    </div>

                    <div className="result-row">
                        <span className="label">AI Verdict:</span>
                        {result.analysis.error ? (
                            <span className="badge error">AI ERROR ⚠️</span>
                        ) : (
                            <span className={`badge ${result.analysis.relevant ? 'relevant' : 'irrelevant'}`}>
                                {result.analysis.relevant ? 'RELEVANT ✅' : 'NOT RELEVANT ❌'}
                            </span>
                        )}
                    </div>

                    <div className="result-row column">
                        <span className="label">AI Summary:</span>
                        <p className={`summary-text ${result.analysis.error ? 'error-text' : ''}`}>
                            {result.analysis.summary}
                        </p>
                    </div>

                    <details className="result-row column">
                        <summary className="label pointer">View Scraped Content Snippet</summary>
                        <pre className="snippet">{result.snippet}</pre>
                    </details>
                </div>
            )}

            <style jsx>{`
                .test-panel {
                    margin-top: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .test-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .test-header h3 {
                    margin: 0;
                    font-size: 1.1rem;
                }

                .description {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 20px;
                }

                .small-btn {
                    width: auto;
                    padding: 8px 16px;
                    font-size: 0.85rem;
                }

                .result-box {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 16px;
                    border-radius: 12px;
                    margin-top: 16px;
                }

                .result-box.error {
                    border-left: 3px solid var(--error);
                    color: var(--error);
                }

                .result-box.success {
                    border-left: 3px solid var(--success);
                }

                .result-row {
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .result-row.column {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 6px;
                }

                .label {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                
                .pointer {
                    cursor: pointer;
                    color: var(--accent-primary);
                }

                .url-link {
                    color: var(--accent-primary);
                    text-decoration: none;
                    font-size: 0.9rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 200px;
                }

                .badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: bold;
                }

                .badge.relevant {
                    background: rgba(var(--success-rgb), 0.2);
                    color: var(--success);
                }

                .badge.irrelevant {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text-muted);
                }

                .summary-text {
                    color: var(--text-primary);
                    font-size: 0.95rem;
                    line-height: 1.5;
                }

                .snippet {
                    font-family: monospace;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    background: rgba(0, 0, 0, 0.3);
                    padding: 10px;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    max-height: 200px;
                    overflow-y: auto;
                    width: 100%;
                }
            `}</style>
        </div>
    );
}
