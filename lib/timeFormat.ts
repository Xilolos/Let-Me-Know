export function getTimeFormat(): '24hr' | '12hr' {
    if (typeof window === 'undefined') return '24hr';
    const saved = localStorage.getItem('lmk-time-format');
    return (saved === '12hr' ? '12hr' : '24hr');
}

export function formatTime(date: Date, format?: '24hr' | '12hr'): string {
    const timeFormat = format || getTimeFormat();

    if (timeFormat === '24hr') {
        return date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } else {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }
}

export function calculateNextRun(lastRunAt: Date | null, schedule: string): Date | null {
    if (!lastRunAt) return null;

    const now = new Date();
    const lastRun = new Date(lastRunAt);

    // Get interval from localStorage (user's preference)
    let intervalHours = 6; // Default to 6 hours

    if (typeof window !== 'undefined') {
        const savedInterval = localStorage.getItem('lmk-interval');
        intervalHours = savedInterval ? parseInt(savedInterval) : 6;
    }

    // Calculate next run time
    const nextRun = new Date(lastRun.getTime() + intervalHours * 60 * 60 * 1000);

    // If next run is in the past, keep adding intervals until it's in the future
    while (nextRun < now) {
        nextRun.setTime(nextRun.getTime() + intervalHours * 60 * 60 * 1000);
    }

    return nextRun;
}
