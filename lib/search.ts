import * as cheerio from 'cheerio';

export async function searchWeb(query: string): Promise<string[]> {
    try {
        // Use Bing News RSS (Reliable, provides target URL in query param)
        const searchUrl = `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=RSS`;

        console.log(`[Search] Fetching RSS: ${searchUrl}`);

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        if (!response.ok) {
            console.error('[Search] RSS failed:', response.statusText);
            return [];
        }

        const xml = await response.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        const links: string[] = [];

        $('item').each((i, el) => {
            const link = $(el).find('link').text();
            if (link) {
                // Bing links are like: http://www.bing.com/news/apiclick.aspx?...&url=https%3a%2f%2f...
                try {
                    const urlObj = new URL(link);
                    const realUrl = urlObj.searchParams.get('url');
                    if (realUrl) {
                        links.push(realUrl);
                    } else {
                        links.push(link); // Fallback to original if no url param
                    }
                } catch (e) {
                    links.push(link);
                }
            }
        });

        console.log(`[Search] Found ${links.length} items`);

        // Return top 5 unique links
        return Array.from(new Set(links)).slice(0, 5);

    } catch (error) {
        console.error('[Search] Error:', error);
        return [];
    }
}
