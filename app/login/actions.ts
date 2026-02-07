'use server';

import { setUserEmail, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const rawEmail = formData.get('email') as string;
    const rawUsername = formData.get('username') as string;
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';
    const username = rawUsername ? rawUsername.trim() : '';

    if (!email || !email.includes('@')) {
        return { error: 'Please enter a valid email' };
    }

    if (!username) {
        return { error: 'Please enter your name' };
    }

    await setUserEmail(email);
    // Store username in cookie as well
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    cookieStore.set('user-name', username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
    });
    redirect('/');
}

export async function signout() {
    await logout();
    redirect('/login');
}
