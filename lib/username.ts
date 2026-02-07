import { cookies } from 'next/headers';

export async function getUserName(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('user-name')?.value || null;
}
