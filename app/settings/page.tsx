'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun, Smartphone } from 'lucide-react';
import { useAccent, accentColors } from '@/components/AccentProvider';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { accent, setAccent } = useAccent();
    const [mounted, setMounted] = useState(false);
    const [amoledMode, setAmoledMode] = useState(false);
    const [searchInterval, setSearchInterval] = useState<number>(6);

    useEffect(() => {
        setMounted(true);
        // Load AMOLED preference
        const savedAmoled = localStorage.getItem('lmk-amoled') === 'true';
        setAmoledMode(savedAmoled);
        // Load search interval preference
        const savedInterval = localStorage.getItem('lmk-interval');
        setSearchInterval(savedInterval ? parseInt(savedInterval) : 6);
    }, []);

    const toggleAmoled = () => {
        const newValue = !amoledMode;
        setAmoledMode(newValue);
        localStorage.setItem('lmk-amoled', newValue.toString());
        // Trigger event for AmoledProvider to pick up the change
        window.dispatchEvent(new Event('amoled-changed'));
    };

    const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setSearchInterval(value);
        localStorage.setItem('lmk-interval', value.toString());
    };

    if (!mounted) {
        return (
            <div className="page-container">
                <header className="dashboard-header">
                    <h1>Settings</h1>
                </header>
                <div className="glass-panel">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="dashboard-header sticky-header">
                <h1>Settings</h1>
            </header>

            <div className="glass-panel">
                <h2 className="section-title">General</h2>

                <div className="setting-item">
                    <div className="setting-label">
                        <h3>Search Interval</h3>
                        <p>How often watchers should check for updates</p>
                    </div>
                    <select
                        value={searchInterval}
                        onChange={handleIntervalChange}
                        className="interval-select"
                    >
                        <option value="6">Every 6 hours</option>
                        <option value="12">Every 12 hours</option>
                        <option value="24">Daily</option>
                    </select>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '20px' }}>
                <h2 className="section-title">Appearance</h2>

                <div className="setting-item">
                    <div className="setting-label">
                        <h3>Theme</h3>
                        <p>Choose your preferred theme</p>
                    </div>

                    <div className="theme-toggle">
                        <button
                            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                            aria-label="Light Mode"
                        >
                            <Sun size={20} />
                            <span>Light</span>
                        </button>
                        <button
                            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                            aria-label="Dark Mode"
                        >
                            <Moon size={20} />
                            <span>Dark</span>
                        </button>
                        <button
                            className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                            onClick={() => setTheme('system')}
                            aria-label="System Mode"
                        >
                            <Smartphone size={20} />
                            <span>System</span>
                        </button>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="setting-item">
                    <div className="setting-label">
                        <h3>AMOLED Mode</h3>
                        <p>Use pure black when dark theme is active</p>
                    </div>
                    <label className="toggle-switch">
                        <input
                            type="checkbox"
                            checked={amoledMode}
                            onChange={toggleAmoled}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                </div>

                <div className="divider"></div>

                <div className="setting-item">
                    <div className="setting-label">
                        <h3>Accent Color</h3>
                        <p>Customize the app's primary color</p>
                    </div>
                    <div className="accent-grid">
                        {(Object.entries(accentColors) as [string, any][]).map(([key, value]) => (
                            <button
                                key={key}
                                className={`accent-dot ${accent === key ? 'active' : ''}`}
                                onClick={() => setAccent(key as any)}
                                aria-label={`Select ${value.label} accent`}
                                title={value.label}
                                style={{
                                    backgroundColor: `hsl(${value.h}, ${value.s}, 50%)`
                                }}
                            >
                                {accent === key && (
                                    <div className="dot-indicator" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .section-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin: 0 0 20px 0;
            color: var(--text-primary);
        }
        .setting-item {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        .setting-label h3 {
            margin: 0 0 4px 0;
            font-size: 1.1rem;
        }
        .setting-label p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .theme-toggle {
            display: flex;
            background: var(--bg-toggle);
            padding: 4px;
            border-radius: 12px;
            gap: 4px;
        }
        .theme-btn {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 12px 8px;
            background: transparent;
            border: none;
            border-radius: 8px;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.85rem;
        }
        .theme-btn.active {
            background: var(--bg-primary);
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .theme-btn:hover {
            color: var(--text-primary);
        }
        .divider {
            height: 1px;
            background: var(--border-color);
            margin: 20px 0;
        }
        .accent-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
        }
        .accent-dot {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 3px solid transparent;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .accent-dot.active {
            border-color: var(--text-primary);
            transform: scale(1.1);
        }
        .accent-dot:hover {
            transform: scale(1.05);
        }
        .dot-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .toggle-switch {
            position: relative;
            display: inline-block;
            width: 52px;
            height: 28px;
            cursor: pointer;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .toggle-slider {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 28px;
            transition: 0.3s;
        }
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 4px;
            bottom: 3px;
            background: var(--text-muted);
            border-radius: 50%;
            transition: 0.3s;
        }
        input:checked + .toggle-slider {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            border-color: transparent;
        }
        input:checked + .toggle-slider:before {
            transform: translateX(24px);
            background: white;
        }
        .interval-select {
            padding: 10px 14px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            min-width: 160px;
        }
        .interval-select:hover {
            border-color: var(--accent-primary);
        }
        .interval-select:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(var(--accent-primary-rgb), 0.1);
        }
      `}</style>
        </div>
    );
}
