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

    // Get current user
    const { getUserEmail } = await import('./auth');
    const userEmail = await getUserEmail();

    if (!userEmail) {
        return { error: 'You must be logged in' };
    }

    // Generate search queries immediately
    const { generateSearchQueries } = await import('./ai');
    let searchQueries: string[] = [];
    try {
        searchQueries = await generateSearchQueries(query);
    } catch (e) {
        console.error('Failed to generate queries on create:', e);
        searchQueries = [query];
    }

    await db.insert(watchers).values({
        userEmail, // Save the owner
        name,
        query,
        urls: JSON.stringify(urls),
        searchQueries: JSON.stringify(searchQueries),
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

export async function runManualCheck(id?: number) {
    const { getUserEmail } = await import('./auth');
    const userEmail = await getUserEmail();

    if (!userEmail) return { success: false, error: 'Not logged in', logs: [] };

    const { processActiveWatchers } = await import('./process');
    // Only process THIS user's watchers to avoid timeouts
    const result = await processActiveWatchers(userEmail, id);

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

    // Regenerate queries if the topic changed
    let searchQueries = undefined;
    const existing = await db.query.watchers.findFirst({
        where: eq(watchers.id, id),
        columns: { query: true }
    });

    if (existing && existing.query !== query) {
        const { generateSearchQueries } = await import('./ai');
        try {
            const qs = await generateSearchQueries(query);
            searchQueries = JSON.stringify(qs);
        } catch (e) { }
    }

    await db.update(watchers)
        .set({
            name,
            query,
            urls: JSON.stringify(urls),
            ...(searchQueries ? { searchQueries } : {})
        })
        .where(eq(watchers.id, id));

    revalidatePath('/');
    return { success: true };
}

export async function testWatcher(id: number) {
    // 1. Auth & Fetch
    const { getUserEmail } = await import('./auth');
    const userEmail = await getUserEmail();
    if (!userEmail) return { success: false, error: 'Not logged in' };

    const watcher = await db.query.watchers.findFirst({
        where: eq(watchers.id, id)
    });

    if (!watcher || watcher.userEmail !== userEmail) {
        return { success: false, error: 'Watcher not found' };
    }

    // 2. Resolve URL
    let urlToCheck = '';
    const logs: string[] = [];

    try {
        const parsed = JSON.parse(watcher.urls);
        if (Array.isArray(parsed) && parsed.length > 0) {
            urlToCheck = parsed[0];
            logs.push(`Using explicit URL: ${urlToCheck}`);
        }
    } catch (e) { }

    if (!urlToCheck) {
        logs.push('No explicit URL, searching...');
        const { generateSearchQueries } = await import('./ai');
        const { searchWeb } = await import('./search');

        try {
            const queries = await generateSearchQueries(watcher.query);
            logs.push(`Generated query: ${queries[0]}`);

            if (!queries || queries.length === 0) {
                logs.push('AI failed to generate queries');
            } else {
                const results = await searchWeb(queries[0]);
                logs.push(`Search found ${results.length} results`);

                if (results.length > 0) {
                    urlToCheck = results[0];
                    logs.push(`Found URL: ${urlToCheck}`);
                } else {
                    logs.push('Search returned no results');
                }
            }
        } catch (err: any) {
            logs.push(`Error during search: ${err.message}`);
        }
    }

    if (!urlToCheck) {
        return { success: false, error: 'No URLs found to test', logs };
    }

    // 3. Scrape
    const { scrapeUrl } = await import('./scraper');
    const result = await scrapeUrl(urlToCheck);

    if (!result || !result.content) {
        return { success: false, error: `Failed to scrape ${urlToCheck}`, logs };
    }
    const { content } = result;

    // 4. Analyze
    const { analyzeContent } = await import('./ai');
    const analysis = await analyzeContent(watcher.query, [{ url: urlToCheck, content }]);

    return {
        success: true,
        data: {
            url: urlToCheck,
            snippet: content.slice(0, 500) + '...',
            analysis,
        },
        logs
    };
}
