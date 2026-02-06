import * as cheerio from 'cheerio';

export async function searchWeb(query: string): Promise<string[]> {
    try {
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            console.error('Search failed:', response.statusText);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const links: string[] = [];

        // Select DDG result links
        $('.result__a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && !href.includes('duckduckgo.com')) {
                // Decode the DDG redirect url if needed, or usually it's direct in html version?
                // Actually DDG html often wraps in /l/?kh=-1&uddg=...
                // Let's try to get the raw URL or decode it.

                const urlObj = new URL(href, 'https://html.duckduckgo.com');
                const realUrl = urlObj.searchParams.get('uddg');
                if (realUrl) {
                    links.push(realUrl);
                } else if (href.startsWith('http')) {
                    links.push(href);
                }
            }
        });

        // Return top 5 unique links
        return Array.from(new Set(links)).slice(0, 5);
    } catch (error) {
        console.error('Search Error:', error);
        return [];
    }
}
