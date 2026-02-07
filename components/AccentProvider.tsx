'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type AccentColor = 'orange' | 'blue' | 'red' | 'green' | 'grey';

interface AccentContextType {
    accent: AccentColor;
    setAccent: (color: AccentColor) => void;
}

const AccentContext = createContext<AccentContextType>({
    accent: 'orange',
    setAccent: () => { },
});

export const accentColors: Record<AccentColor, { h: number; s: string; label: string }> = {
    orange: { h: 25, s: '100%', label: 'Orange' },
    blue: { h: 210, s: '100%', label: 'Blue' },
    red: { h: 350, s: '90%', label: 'Red' },
    green: { h: 145, s: '65%', label: 'Green' },
    grey: { h: 220, s: '10%', label: 'Grey' },
};

export function AccentProvider({ children }: { children: React.ReactNode }) {
    const [accent, setAccentState] = useState<AccentColor>('orange');

    useEffect(() => {
        // Load from local storage
        const saved = localStorage.getItem('lmk-accent') as AccentColor;
        if (saved && accentColors[saved]) {
            setAccentState(saved);
            applyAccent(saved);
        } else {
            applyAccent('orange');
        }
    }, []);

    const applyAccent = (color: AccentColor) => {
        const { h, s } = accentColors[color];
        document.documentElement.style.setProperty('--accent-h', h.toString());
        document.documentElement.style.setProperty('--accent-s', s);
    };

    const setAccent = (color: AccentColor) => {
        setAccentState(color);
        localStorage.setItem('lmk-accent', color);
        applyAccent(color);
    };

    return (
        <AccentContext.Provider value={{ accent, setAccent }}>
            {children}
        </AccentContext.Provider>
    );
}

export const useAccent = () => useContext(AccentContext);
