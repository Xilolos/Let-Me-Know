
const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

const targetEmail = process.argv[2];

if (!targetEmail) {
    console.error('Usage: node scripts/assign_watchers.js <your-email>');
    process.exit(1);
}

try {
    const info = db.prepare('UPDATE watchers SET user_email = ? WHERE user_email IS NULL')
        .run(targetEmail);

    console.log(`Success! Assigned ${info.changes} orphan watchers to ${targetEmail}.`);
} catch (error) {
    console.error('Error migrating watchers:', error);
}
