'use server';

import { db } from './db';
import { results } from './schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function markResultAsRead(id: number) {
    await db.update(results)
        .set({ isRead: true })
        .where(eq(results.id, id));

    revalidatePath('/logs');
    return { success: true };
}

export async function markResultAsUnread(id: number) {
    await db.update(results)
        .set({ isRead: false })
        .where(eq(results.id, id));

    revalidatePath('/logs');
    return { success: true };
}
