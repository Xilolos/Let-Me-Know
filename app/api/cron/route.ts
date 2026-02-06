import { NextResponse } from 'next/server';
import { processActiveWatchers } from '@/lib/process';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET() {
    const result = await processActiveWatchers();

    if (!result.success) {
        return NextResponse.json(result, { status: 500 });
    }
    return NextResponse.json(result);
}
