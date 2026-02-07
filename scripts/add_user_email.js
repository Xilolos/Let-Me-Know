
const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

try {
    console.log('Adding user_email column...');
    db.prepare('ALTER TABLE watchers ADD COLUMN user_email TEXT').run();
    console.log('Successfully added user_email column.');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('Column user_email already exists.');
    } else {
        console.error('Error adding column:', error);
    }
}
