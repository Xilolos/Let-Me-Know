'use server';

import { db } from './db';
import { watchers } from './schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createWatcher(formData: FormData) {
    const name = formData.get('name') as string;
    const query = formData.get('query') as string;
    const rawUrls = formData.get('urls') as string;

    // Basic validation
    if (!name || !query) return { error: 'Missing fields' };

    const urls = rawUrls ? rawUrls.split(',').map(u => u.trim()).filter(Boolean) : [];

    await db.insert(watchers).values({
        name,
        query,
        urls: JSON.stringify(urls),
        status: 'active',
    });

    revalidatePath('/');
    return { success: true };
}

export async function deleteWatcher(id: number) {
    await db.delete(watchers).where(eq(watchers.id, id));
    revalidatePath('/');
}

export async function toggleWatcherStatus(id: number, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await db.update(watchers)
        .set({ status: newStatus })
        .where(eq(watchers.id, id));
    revalidatePath('/');
}

export async function runManualCheck() {
    const { processActiveWatchers } = await import('./process');
    const result = await processActiveWatchers();
    revalidatePath('/');
    revalidatePath('/logs');
    return result;
}

export async function updateWatcher(id: number, formData: FormData) {
    const name = formData.get('name') as string;
    const query = formData.get('query') as string;
    const rawUrls = formData.get('urls') as string;

    if (!name || !query) return { error: 'Missing fields' };

    const urls = rawUrls ? rawUrls.split(',').map(u => u.trim()).filter(Boolean) : [];

    await db.update(watchers)
        .set({
            name,
            query,
            urls: JSON.stringify(urls),
        })
        .where(eq(watchers.id, id));

    revalidatePath('/');
    return { success: true };
}
