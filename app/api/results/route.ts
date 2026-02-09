import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { results, watchers } from '@/lib/schema';
import { desc, eq, and, inArray } from 'drizzle-orm';
import { getUserEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const userEmail = await getUserEmail();

        if (!userEmail) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const view = searchParams.get('view') === 'history' ? 'history' : 'updates';
        const watchersParam = searchParams.get('watchers');
        const isHistory = view === 'history';

        // Parse selected watcher IDs
        const selectedWatcherIds = watchersParam
            ? watchersParam.split(',').filter(Boolean).map(Number)
            : [];

        // Fetch all watchers for the user
        const allWatchers = await db.select({
            id: watchers.id,
            name: watchers.name
        })
            .from(watchers)
            .where(eq(watchers.userEmail, userEmail))
            .orderBy(watchers.name);

        // Build results query with optional watcher filter
        const conditions = [
            eq(watchers.userEmail, userEmail),
            eq(results.isRead, isHistory)
        ];

        if (selectedWatcherIds.length > 0) {
            conditions.push(inArray(results.watcherId, selectedWatcherIds));
        }

        const allResults = await db.select({
            id: results.id,
            content: results.content,
            sources: results.sources,
            foundAt: results.foundAt,
            isRead: results.isRead,
            thumbnail: results.thumbnail,
            watcherName: watchers.name
        })
            .from(results)
            .leftJoin(watchers, eq(results.watcherId, watchers.id))
            .where(and(...conditions))
            .orderBy(desc(results.foundAt));

        return NextResponse.json({
            results: allResults,
            watchers: allWatchers
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
