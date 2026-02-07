
export default function Loading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '60vh',
            color: '#888',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div className="spinner"></div>
            <p className="pulse">Loading...</p>

            <style>{`
                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(255,255,255,0.1);
                    border-radius: 50%;
                    border-top-color: var(--accent-primary);
                    animation: spin 1s ease-in-out infinite;
                }
                .pulse {
                    animation: pulse 1.5s ease-in-out infinite;
                    font-size: 0.9rem;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
