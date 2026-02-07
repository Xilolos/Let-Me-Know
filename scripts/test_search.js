
// Standalone script
async function run() {
    console.log('Testing search for "Athens Metro Schedule"...');

    try {
        const query = "Athens Metro Schedule";
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

        console.log(`Fetching ${searchUrl}...`);
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            console.error('Fetch failed:', response.status, response.statusText);
            return;
        }

        const html = await response.text();
        console.log(`Fetched ${html.length} bytes.`);

        // Simple check for result links
        if (html.includes('result__a')) {
            console.log('SUCCESS: Found result class "result__a". searchWeb should work.');
        } else {
            console.log('FAILURE: Did NOT find result class "result__a". Dumping first 500 chars:');
            console.log(html.slice(0, 500));
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
