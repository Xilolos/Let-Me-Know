
import { getUserEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NewWatcherForm from './NewWatcherForm';

export default async function NewWatcherPage() {
    const userEmail = await getUserEmail();

    if (!userEmail) {
        redirect('/login');
    }

    return <NewWatcherForm />;
}
