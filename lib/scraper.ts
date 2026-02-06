import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other noise
        $('script').remove();
        $('style').remove();
        $('nav').remove();
        $('footer').remove();
        $('header').remove();

        // extract meaningful text
        const text = $('body').text().replace(/\s+/g, ' ').trim();
        return text;
    } catch (error) {
        console.error(`Scrape Error for ${url}:`, error);
        return null;
    }
}
