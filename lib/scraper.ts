import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string): Promise<{ content: string; datePublished?: Date; thumbnail?: string } | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
            },
            redirect: 'follow', // Explicitly allow redirects
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        let html = await response.text();
        let $ = cheerio.load(html);

        // CHECK FOR GOOGLE NEWS REDIRECTS
        // Google News often returns a page with "Opening..." and a link/script to redirect.
        // We need to follow that link.
        if (url.includes('news.google.com') || html.includes('Opening...')) {
            const redirectLink = $('a[jsname]').attr('href') || $('a').attr('href');
            if (redirectLink && redirectLink.startsWith('http')) {
                console.log(`[Scraper] Following Google News redirect to: ${redirectLink}`);
                // Fetched the real article
                const realResponse = await fetch(redirectLink, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    }
                });
                if (realResponse.ok) {
                    html = await realResponse.text();
                    $ = cheerio.load(html);
                }
            }
        }

        // Remove scripts, styles, and other noise
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();
        $('noscript').remove(); // remove noscript tags which often contain warning text
        $('iframe').remove();

        // extract meaningful text
        // Improve extraction: specific main content areas first
        let text = '';
        const mainSelectors = ['main', 'article', '#content', '.content', '.post-content', '.article-body'];

        for (const selector of mainSelectors) {
            if ($(selector).length > 0) {
                text = $(selector).text();
                break;
            }
        }

        // Falback to body if no main content found
        if (!text || text.length < 100) {
            text = $('body').text();
        }

        // Extract metadata for deduplication and thumbnail
        let datePublished: Date | undefined;
        const dateStr = $('meta[property="article:published_time"]').attr('content') ||
            $('meta[name="date"]').attr('content') ||
            $('time').attr('datetime');

        if (dateStr) {
            datePublished = new Date(dateStr);
            if (isNaN(datePublished.getTime())) {
                datePublished = undefined;
            }
        }

        // Extract Thumbnail
        let thumbnail = $('meta[property="og:image"]').attr('content') ||
            $('meta[name="twitter:image"]').attr('content');

        if (!thumbnail) {
            // Fallback: Find the first substantial image in the article body
            const firstImg = $(mainSelectors.join(', ')).find('img').first();
            const src = firstImg.attr('src');
            if (src && src.startsWith('http')) {
                thumbnail = src;
            }
        }

        return {
            content: text.replace(/\s+/g, ' ').trim(),
            datePublished,
            thumbnail
        };
    } catch (error) {
        console.error(`Scrape Error for ${url}:`, error);
        return null;
    }
}
