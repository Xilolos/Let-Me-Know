import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const watchers = sqliteTable('watchers', {
    id: integer('id').primaryKey(),
    userEmail: text('user_email'), // The owner of this watcher
    name: text('name').notNull(),
    query: text('query').notNull(), // What the user wants to know
    urls: text('urls').notNull(), // JSON array of URLs to check
    prompt: text('prompt'), // System prompt for the AI
    schedule: text('schedule').default('0 * * * *'), // Cron expression (default hourly)
    status: text('status').default('active'), // active, paused
    lastRunAt: integer('last_run_at', { mode: 'timestamp' }),
    searchQueries: text('search_queries'), // JSON array of cached search queries
    createdAt: integer('created_at', { mode: 'timestamp' }).default(new Date()),
});

export const results = sqliteTable('results', {
    id: integer('id').primaryKey(),
    watcherId: integer('watcher_id').references(() => watchers.id),
    content: text('content').notNull(), // Markdown summary
    sources: text('sources'), // JSON array of { name: string, url: string }
    foundAt: integer('found_at', { mode: 'timestamp' }).default(new Date()),
    isRead: integer('is_read', { mode: 'boolean' }).default(false),
});
