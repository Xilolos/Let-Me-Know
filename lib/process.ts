import { db } from '@/lib/db';
import { watchers, results } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { searchWeb } from '@/lib/search';
import { scrapeUrl } from '@/lib/scraper';
import { analyzeContent, generateSearchQueries } from '@/lib/ai';

// ... imports

export async function processActiveWatchers(targetUserEmail?: string, targetWatcherId?: number) {
    const logs: string[] = [];
    try {
        const conditions = [eq(watchers.status, 'active')];
        if (targetUserEmail) {
            conditions.push(eq(watchers.userEmail, targetUserEmail));
        }
        if (targetWatcherId) {
            conditions.push(eq(watchers.id, targetWatcherId));
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

                    let distinctQueries: string[] = [];
                    // Use stored queries if available
                    if (watcher.searchQueries) {
                        try {
                            const params = JSON.parse(watcher.searchQueries);
                            if (Array.isArray(params) && params.length > 0) {
                                distinctQueries = params;
                                logs.push(`Using ${distinctQueries.length} saved queries`);
                            }
                        } catch (e) { }
                    }

                    // Fallback if no stored queries
                    if (distinctQueries.length === 0) {
                        distinctQueries = await generateSearchQueries(watcher.query);
                        // Optional: Save them for next time? For now just use them.
                    }

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

                    // Scrape all URLs first
                    const validSources: { url: string; content: string }[] = [];

                    // Limit to 5 URLs max for consensus to avoid token limits
                    const limitedUrls = urls.slice(0, 5);

                    for (const url of limitedUrls) {
                        const scrapeResult = await scrapeUrl(url);

                        if (scrapeResult && scrapeResult.content) {
                            // DEDUPLICATION CHECK
                            // Check if the article is newer than the last run
                            if (watcher.lastRunAt && scrapeResult.datePublished) {
                                if (scrapeResult.datePublished <= watcher.lastRunAt) {
                                    logs.push(`Skipping old article: ${url} (Date: ${scrapeResult.datePublished.toISOString()})`);
                                    continue;
                                }
                            }

                            validSources.push({ url, content: scrapeResult.content });
                        }
                        // Small delay to be polite
                        await new Promise(r => setTimeout(r, 1000));
                    }

                    if (validSources.length > 0) {
                        logs.push(`Analyzing ${validSources.length} sources for consensus...`);

                        try {
                            // Analyze all sources together
                            const analysis = await analyzeContent(watcher.query, validSources);

                            if (analysis.relevant) {
                                // Prepare sources metadata for DB
                                const sourcesMeta = validSources.map(s => ({
                                    name: new URL(s.url).hostname.replace('www.', ''),
                                    url: s.url
                                }));

                                await db.insert(results).values({
                                    watcherId: watcher.id,
                                    content: analysis.summary,
                                    sources: JSON.stringify(sourcesMeta),
                                    foundAt: new Date(),
                                    isRead: false,
                                });
                                logs.push(`Consensus found for ${watcher.name}`);

                                // Send Email
                                const recipient = watcher.userEmail || process.env.EMAIL_TO || process.env.EMAIL_USER;
                                if (process.env.EMAIL_USER && recipient) {
                                    const { sendNotification } = await import('@/lib/email');
                                    await sendNotification(
                                        recipient,
                                        watcher.name,
                                        [{
                                            source: "Consensus Summary",
                                            summary: analysis.summary,
                                            link: `http://localhost:3000/logs` // Link to dashboard to see sources
                                        }]
                                    );
                                    logs.push(`Email sent to ${recipient}`);
                                }
                            } else {
                                logs.push(`No relevant news found in consensus.`);
                            }
                        } catch (err) {
                            console.error(`Consensus analysis failed:`, err);
                            logs.push(`Consensus analysis failed`);
                        }
                    } else {
                        logs.push(`No valid content scraped for watcher ${watcher.name}`);
                    }
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
