import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const { username } = await request.json();

    if (!username || username.trim() === '') {
        return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    cookieStore.set('user-name', username.trim(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return NextResponse.json({ success: true });
}
