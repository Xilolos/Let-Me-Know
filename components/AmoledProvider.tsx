'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export function AmoledProvider({ children }: { children: React.ReactNode }) {
    const { theme, resolvedTheme } = useTheme();

    useEffect(() => {
        // Check AMOLED preference
        const amoledEnabled = localStorage.getItem('lmk-amoled') === 'true';

        // Determine if the effective theme is dark
        const effectiveTheme = theme === 'system' ? resolvedTheme : theme;
        const isDark = effectiveTheme === 'dark';

        // Apply AMOLED class only when dark theme is active and AMOLED is enabled
        if (isDark && amoledEnabled) {
            document.documentElement.classList.add('amoled');
        } else {
            document.documentElement.classList.remove('amoled');
        }
    }, [theme, resolvedTheme]);

    // Listen for storage changes (when toggle is changed in Settings)
    useEffect(() => {
        const handleStorageChange = () => {
            const amoledEnabled = localStorage.getItem('lmk-amoled') === 'true';
            const effectiveTheme = theme === 'system' ? resolvedTheme : theme;
            const isDark = effectiveTheme === 'dark';

            if (isDark && amoledEnabled) {
                document.documentElement.classList.add('amoled');
            } else {
                document.documentElement.classList.remove('amoled');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Custom event for same-tab changes
        window.addEventListener('amoled-changed', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('amoled-changed', handleStorageChange);
        };
    }, [theme, resolvedTheme]);

    return <>{children}</>;
}
