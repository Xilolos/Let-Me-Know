
import { cookies } from 'next/headers';

const COOKIE_NAME = 'lmk_user_email';

export async function getUserEmail() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    return cookie?.value || null;
}

export async function setUserEmail(email: string) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
    });
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}
