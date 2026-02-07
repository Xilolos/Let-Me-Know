'use client';

import { useActionState } from 'react';
import { login } from './actions';

const initialState = {
    error: '',
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, initialState);

    return (
        <div className="login-page">
            <div className="glass-panel login-card">
                <img src="/logo.JPG" alt="LMK Logo" className="login-logo" />
                <h1>Welcome</h1>
                <p>Enter your email to access your watchers.</p>

                <form action={formAction} className="login-form">
                    <input
                        type="text"
                        name="username"
                        placeholder="Your name"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        required
                    />
                    {state?.error && (
                        <p className="error-msg">{state.error}</p>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="primary-button"
                    >
                        {isPending ? 'Signing in...' : 'Continue'}
                    </button>
                </form>
            </div>

            <style jsx>{`
                .login-page {
                    min-height: 80vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .login-card {
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                    padding: 40px 30px;
                }

                .login-card h1 {
                    margin-bottom: 8px;
                }

                .login-card p {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .error-msg {
                    color: var(--error) !important;
                    font-size: 0.9rem;
                    margin: 0 !important;
                }
            `}</style>
        </div>
    );
}
