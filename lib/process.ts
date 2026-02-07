import { db } from '@/lib/db';
import { watchers, results } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { searchWeb } from '@/lib/search';
import { scrapeUrl } from '@/lib/scraper';
import { analyzeContent, generateSearchQueries } from '@/lib/ai';

// ... imports

export async function processActiveWatchers(targetUserEmail?: string) {
    const logs: string[] = [];
    try {
        const conditions = [eq(watchers.status, 'active')];
        if (targetUserEmail) {
            conditions.push(eq(watchers.userEmail, targetUserEmail));
        }

        const activeWatchers = await db.select().from(watchers).where(and(...conditions));

        for (const watcher of activeWatchers) {
            // ... existing loop
            // check if watcher matches targetUserEmail if provided? 
            // The query above handles it but let's be safe if I used raw sql. 
            // Drizzle query builder above is correct.
            if (targetUserEmail && watcher.userEmail !== targetUserEmail) continue;

            try {
                // ... rest of loop
                // Add delay to respect API rate limits (15 RPM free tier)
                await new Promise(r => setTimeout(r, 2000));

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
                        // small delay between searches
                        await new Promise(r => setTimeout(r, 1000));
                    }
                    urls = Array.from(new Set(urls)).slice(0, 5);
                    logs.push(`Found ${urls.length} URLs for ${watcher.name}`);
                }

                if (urls.length > 0) {
                    const findings: { source: string; summary: string; link: string }[] = [];

                    for (const url of urls) {
                        // Scrape
                        const content = await scrapeUrl(url);
                        if (!content) {
                            logs.push(`Failed to scrape ${url}`);
                            continue;
                        }

                        // Analyze
                        try {
                            const analysis = await analyzeContent(watcher.query, content);

                            if (analysis.relevant) {
                                await db.insert(results).values({
                                    watcherId: watcher.id,
                                    content: analysis.summary,
                                    foundAt: new Date(),
                                    isRead: false,
                                });
                                logs.push(`Found info for ${watcher.name} on ${url}`);

                                findings.push({
                                    source: url,
                                    summary: analysis.summary,
                                    link: url
                                });
                            }
                            // Delay between analysis calls
                            await new Promise(r => setTimeout(r, 4000));
                        } catch (err) {
                            console.error(`Analysis failed for ${url}:`, err);
                            logs.push(`Analysis failed for ${url}`);
                        }
                    }

                    // Send Aggregated Email
                    const recipient = watcher.userEmail || process.env.EMAIL_TO || process.env.EMAIL_USER;

                    if (findings.length > 0 && process.env.EMAIL_USER && recipient) {
                        const { sendNotification } = await import('@/lib/email');
                        await sendNotification(
                            recipient,
                            watcher.name,
                            findings
                        );
                        logs.push(`Summary email sent to ${recipient} with ${findings.length} updates`);
                    }
                } else {
                    logs.push(`No URLs found for watcher ${watcher.name}`);
                }

                // Update Last Run if successful (or even if no URLs found, to avoid stuck state)
                await db.update(watchers)
                    .set({ lastRunAt: new Date() })
                    .where(eq(watchers.id, watcher.id));

            } catch (watcherError) {
                console.error(`Error processing watcher ${watcher.name}:`, watcherError);
                logs.push(`Error processing watcher ${watcher.name}`);
                // Continue to next watcher!
            }
        }
        return { success: true, logs };
    } catch (error) {
        console.error('Fatal Processing Error:', error);
        return { success: false, error: 'Internal Error', logs };
    }
}
