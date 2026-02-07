'use server';

import { setUserEmail, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function login(prevState: any, formData: FormData) {
    const rawEmail = formData.get('email') as string;
    const email = rawEmail ? rawEmail.trim().toLowerCase() : '';

    if (!email || !email.includes('@')) {
        return { error: 'Please enter a valid email' };
    }

    await setUserEmail(email);
    redirect('/');
}

export async function signout() {
    await logout();
    redirect('/login');
}
