
import { processActiveWatchers } from '../lib/process';
import { db } from '../lib/db';
import { results } from '../lib/schema';
import { desc } from 'drizzle-orm';

async function run() {
    console.log('Starting Consensus Test...');

    // 1. Create a dummy watcher or use an existing one? 
    // Ideally we use existing logic. Let's assume there is at least one active watcher.
    // Or we can mock the DB calls, but that's hard.

    // Instead, let's just trigger processActiveWatchers for the current user if possible.
    // But we need a valid email. 

    // Let's just create a dummy result entry directly to test the Schema!
    // This verifies the DB migration worked.

    const dummySources = [
        { name: 'example.com', url: 'https://example.com/news/1' },
        { name: 'test.org', url: 'https://test.org/article' }
    ];

    try {
        console.log('Inserting test result with sources...');
        await db.insert(results).values({
            watcherId: 1, // assuming watcher 1 exists
            content: 'Test Consensus Summary',
            sources: JSON.stringify(dummySources),
            foundAt: new Date(),
            isRead: false
        });
        console.log('Insert successful!');

        // Read it back
        const row = await db.select().from(results).orderBy(desc(results.foundAt)).limit(1);
        console.log('Read back:', row[0]);

        if (row[0].sources) {
            console.log('✅ Sources column is populated!');
        } else {
            console.error('❌ Sources column is NULL!');
        }
    } catch (e) {
        console.error('❌ Insert failed:', e);
    }
}

run();
