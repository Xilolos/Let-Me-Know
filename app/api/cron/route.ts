import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { watchers, results } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { scrapeUrl } from '@/lib/scraper';
import { analyzeContent } from '@/lib/ai';

export const maxDuration = 60; // Allow 60 seconds execution (for Vercel/Serverless)
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Get all active watchers
        const activeWatchers = await db.select().from(watchers).where(eq(watchers.status, 'active'));

        const logs = [];

        for (const watcher of activeWatchers) {
            // Parse URLs
            let urls: string[] = [];
            try {
                urls = JSON.parse(watcher.urls);
            } catch (e) {
                logs.push(`Error parsing URLs for watcher ${watcher.id}`);
                continue;
            }

            for (const url of urls) {
                // 2. Scrape
                const content = await scrapeUrl(url);
                if (!content) {
                    logs.push(`Failed to scrape ${url} for watcher ${watcher.id}`);
                    continue;
                }

                // 3. Analyze
                const analysis = await analyzeContent(watcher.query, content);

                if (analysis.relevant) {
                    // 4. Save Result
                    await db.insert(results).values({
                        watcherId: watcher.id,
                        content: analysis.summary,
                        foundAt: new Date(),
                        isRead: false,
                    });
                    logs.push(`Found info for watcher ${watcher.id} on ${url}`);
                } else {
                    logs.push(`No info for watcher ${watcher.id} on ${url}`);
                }
            }

            // 5. Update Last Run
            await db.update(watchers)
                .set({ lastRunAt: new Date() })
                .where(eq(watchers.id, watcher.id));
        }

        return NextResponse.json({ success: true, logs });
    } catch (error) {
        console.error('Cron Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
