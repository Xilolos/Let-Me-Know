import { NextResponse } from 'next/server';
import { getUserEmail } from '@/lib/auth';
import { getUserName } from '@/lib/username';

export async function GET() {
    const email = await getUserEmail();
    const username = await getUserName();

    return NextResponse.json({
        email: email || null,
        username: username || null
    });
}
