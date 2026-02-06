import { db } from '@/lib/db';
import { watchers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import EditView from './EditView';

export default async function EditWatcherPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const watcher = await db.query.watchers.findFirst({
        where: eq(watchers.id, parseInt(id))
    });

    if (!watcher) {
        redirect('/');
    }

    return <EditView watcher={watcher} />;
}
