
import { NextResponse } from 'next/server';
import { sendNotification } from '@/lib/email';

export async function GET() {
    if (!process.env.EMAIL_USER) {
        return NextResponse.json({ success: false, error: 'Configure EMAIL_USER in .env.local first' });
    }

    const result = await sendNotification(
        process.env.EMAIL_USER,
        "Test Watcher",
        [
            {
                source: "Example News",
                summary: "This is the first update the AI found. It's very interesting.",
                link: "https://example.com/news1"
            },
            {
                source: "Another Source",
                summary: "This is a second update found on a different site.",
                link: "https://example.com/news2"
            }
        ]
    );

    return NextResponse.json({ success: true, messageId: result?.messageId || 'failed' });
}
