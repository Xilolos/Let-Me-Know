'use client';

import { createWatcher } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function NewWatcherPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

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
        <div className="page-container">
            <header>
                <h1>New Watcher</h1>
            </header>

            <form action={handleSubmit} className="glass-panel form-stack">
                <div className="field-group">
                    <label htmlFor="name">Agent Name</label>
                    <input type="text" name="name" id="name" placeholder="e.g. Metro Updates" required autoFocus />
                </div>

                <div className="field-group">
                    <label htmlFor="query">What should I look for?</label>
                    <textarea
                        name="query"
                        id="query"
                        rows={3}
                        placeholder="e.g. Schedule changes, delays, or strikes in Athens Metro"
                        required
                    />
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
        </div>
    );
}
