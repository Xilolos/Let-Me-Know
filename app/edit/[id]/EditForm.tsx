'use client';

import { updateWatcher } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function EditForm({ watcher }: { watcher: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData) => {
        startTransition(async () => {
            const result = await updateWatcher(watcher.id, formData);
            if (result.success) {
                router.push('/');
            }
        });
    };

    // Helper to format URLs for textarea
    const formattedUrls = (() => {
        try {
            const parsed = JSON.parse(watcher.urls);
            return Array.isArray(parsed) ? parsed.join(', ') : '';
        } catch { return ''; }
    })();

    return (
        <form action={handleSubmit} className="form-stack">
            <div className="field-group">
                <label htmlFor="name">Agent Name</label>
                <input type="text" name="name" id="name" defaultValue={watcher.name} required />
            </div>

            <div className="field-group">
                <label htmlFor="query">Query</label>
                <textarea
                    name="query"
                    id="query"
                    rows={3}
                    defaultValue={watcher.query}
                    required
                />
            </div>

            <div className="field-group">
                <label htmlFor="urls">Target URLs (Optional)</label>
                <textarea
                    name="urls"
                    id="urls"
                    rows={3}
                    defaultValue={formattedUrls}
                    placeholder="Leave empty for Auto-Search"
                />
            </div>

            <button type="submit" className="primary-button" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
            </button>

            <style jsx>{`
        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        label {
          display: block;
          color: var(--text-secondary);
          margin-bottom: 8px;
          font-size: 0.9rem;
          font-weight: 500;
        }
      `}</style>
        </form>
    );
}
