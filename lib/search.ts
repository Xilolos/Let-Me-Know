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
        // Try multiple selectors as DDG HTML structure can vary
        const selectors = ['.result__a', '.result__url', '.result__snippet'];

        selectors.forEach(selector => {
            $(selector).each((i, el) => {
                const href = $(el).attr('href');
                if (href) {
                    // 1. Handle DDG redirect links (//duckduckgo.com/l/?uddg=...)
                    if (href.includes('duckduckgo.com/l/?')) {
                        try {
                            const urlObj = new URL(href, 'https://duckduckgo.com');
                            const realUrl = urlObj.searchParams.get('uddg');
                            if (realUrl) links.push(realUrl);
                        } catch (e) {
                            // ignore check
                        }
                    }
                    // 2. Handle direct links (if any)
                    else if (!href.includes('duckduckgo.com') && href.startsWith('http')) {
                        links.push(href);
                    }
                }
            });
        });

        // Return top 5 unique links
        return Array.from(new Set(links)).slice(0, 5);
    } catch (error) {
        console.error('Search Error:', error);
        return [];
    }
}
