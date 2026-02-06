import { db } from '@/lib/db';
import { watchers, results } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { searchWeb } from '@/lib/search';
import { scrapeUrl } from '@/lib/scraper';
import { analyzeContent, generateSearchQueries } from '@/lib/ai';

export async function processActiveWatchers() {
    const logs: string[] = [];
    try {
        const activeWatchers = await db.select().from(watchers).where(eq(watchers.status, 'active'));

        for (const watcher of activeWatchers) {
            let urls: string[] = [];

            // A. Try to parse explicit URLs
            try {
                const parsed = JSON.parse(watcher.urls);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    urls = parsed;
                }
            } catch (e) { /* ignore json error */ }

            // B. If no URLs, use Smart Discovery
            if (urls.length === 0) {
                logs.push(`Auto-discovering for: ${watcher.query}`);
                const distinctQueries = await generateSearchQueries(watcher.query);

                for (const q of distinctQueries) {
                    const foundLinks = await searchWeb(q);
                    urls.push(...foundLinks);
                }
                urls = Array.from(new Set(urls)).slice(0, 5);
                logs.push(`Found ${urls.length} URLs for ${watcher.name}`);
            }

            if (urls.length === 0) {
                logs.push(`No URLs found for watcher ${watcher.name}`);
                continue;
            }

            for (const url of urls) {
                // Scrape
                const content = await scrapeUrl(url);
                if (!content) {
                    logs.push(`Failed to scrape ${url}`);
                    continue;
                }

                // Analyze
                const analysis = await analyzeContent(watcher.query, content);

                if (analysis.relevant) {
                    await db.insert(results).values({
                        watcherId: watcher.id,
                        content: analysis.summary,
                        foundAt: new Date(),
                        isRead: false,
                    });
                    logs.push(`Found info for ${watcher.name} on ${url}`);

                    // Send Email
                    if (process.env.EMAIL_USER) {
                        const { sendNotification } = await import('@/lib/email');
                        await sendNotification(
                            process.env.EMAIL_USER,
                            `New Update: ${watcher.name}`,
                            `<p><strong>${watcher.name}</strong> found something:</p>
                             <blockquote>${analysis.summary}</blockquote>
                             <p>Link: <a href="${url}">${url}</a></p>`
                        );
                        logs.push(`Email sent to ${process.env.EMAIL_USER}`);
                    }
                }
            }

            // Update Last Run
            await db.update(watchers)
                .set({ lastRunAt: new Date() })
                .where(eq(watchers.id, watcher.id));
        }
        return { success: true, logs };
    } catch (error) {
        console.error('Processing Error:', error);
        return { success: false, error: 'Internal Error', logs };
    }
}
