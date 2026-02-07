import { db } from '@/lib/db';
import { watchers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import EditView from './EditView';

import { getUserEmail } from '@/lib/auth';
import { and } from 'drizzle-orm';

export default async function EditWatcherPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userEmail = await getUserEmail();

    if (!userEmail) {
        redirect('/login');
    }

    const watcher = await db.query.watchers.findFirst({
        where: and(
            eq(watchers.id, parseInt(id)),
            eq(watchers.userEmail, userEmail)
        )
    });

    if (!watcher) {
        redirect('/');
    }

    return <EditView watcher={watcher} />;
}
