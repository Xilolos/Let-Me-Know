'use client';

import { getUserEmail } from '@/lib/auth';
import { getUserName } from '@/lib/username';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import { useEffect, useState } from 'react';

export default function AccountPage() {
    const [mounted, setMounted] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [tempUsername, setTempUsername] = useState('');

    useEffect(() => {
        async function loadUserData() {
            // Get email from cookie via server action
            const userEmail = await fetch('/api/user-data').then(r => r.json()).then(d => d.email);
            const userName = await fetch('/api/user-data').then(r => r.json()).then(d => d.username);

            if (!userEmail) {
                redirect('/login');
            }

            setEmail(userEmail);
            setUsername(userName || 'User');
            setTempUsername(userName || 'User');
            setMounted(true);
        }
        loadUserData();
    }, []);

    const handleSave = async () => {
        // Save to cookie via API
        await fetch('/api/update-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: tempUsername })
        });
        setUsername(tempUsername);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setTempUsername(username);
        setIsEditing(false);
    };

    if (!mounted) {
        return (
            <div className="page-container">
                <header className="dashboard-header">
                    <h1>Account</h1>
                </header>
                <div className="glass-panel">Loading...</div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="dashboard-header">
                <h1>Account</h1>
            </header>

            <div className="glass-panel">
                <div className="account-info">
                    <div className="avatar-placeholder">
                        {username[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="info-text">
                        {isEditing ? (
                            <div className="edit-mode">
                                <input
                                    type="text"
                                    value={tempUsername}
                                    onChange={(e) => setTempUsername(e.target.value)}
                                    className="username-input"
                                    autoFocus
                                />
                                <div className="edit-actions">
                                    <button onClick={handleSave} className="save-btn">Save</button>
                                    <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <h3>{username}</h3>
                                <p>{email}</p>
                                <button onClick={() => setIsEditing(true)} className="edit-btn">
                                    Edit name
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="divider"></div>

                <div className="action-section">
                    <LogoutButton />
                </div>
            </div>

            <style jsx>{`
        .account-info {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }
        .avatar-placeholder {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            flex-shrink: 0;
        }
        .info-text {
            flex: 1;
        }
        .info-text h3 {
            margin: 0 0 4px 0;
            font-size: 1.2rem;
        }
        .info-text p {
            margin: 0 0 8px 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .edit-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--accent-primary);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .edit-btn:hover {
            background: var(--bg-secondary);
            border-color: var(--accent-primary);
        }
        .edit-mode {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .username-input {
            padding: 10px 14px;
            background: var(--bg-secondary);
            border: 1px solid var(--accent-primary);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 1rem;
            outline: none;
        }
        .edit-actions {
            display: flex;
            gap: 8px;
        }
        .save-btn, .cancel-btn {
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 0.9rem;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
        }
        .save-btn {
            background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
            color: white;
        }
        .cancel-btn {
            background: var(--bg-secondary);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
        }
        .cancel-btn:hover {
            background: var(--bg-tertiary);
        }
        .divider {
            height: 1px;
            background: var(--border-color);
            margin: 20px 0;
        }
        .action-section {
            display: flex;
            justify-content: center;
        }
      `}</style>
        </div>
    );
}
