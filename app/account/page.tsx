
import { getUserEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import Link from 'next/link';

export default async function AccountPage() {
    const userEmail = await getUserEmail();

    if (!userEmail) {
        redirect('/login');
    }

    return (
        <div className="page-container">
            <header className="dashboard-header">
                <h1>Account</h1>
            </header>

            <div className="glass-panel">
                <div className="account-info">
                    <div className="avatar-placeholder">
                        {userEmail[0].toUpperCase()}
                    </div>
                    <div className="info-text">
                        <h3>My Account</h3>
                        <p>{userEmail}</p>
                    </div>
                </div>

                <div className="divider"></div>

                <div className="action-section">
                    <LogoutButton />
                </div>
            </div>

            <style>{`
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
        }
        .info-text h3 {
            margin: 0 0 4px 0;
            font-size: 1.1rem;
        }
        .info-text p {
            margin: 0;
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        .divider {
            height: 1px;
            background: rgba(255,255,255,0.1);
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
