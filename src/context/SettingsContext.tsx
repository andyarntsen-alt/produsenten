import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Supported languages
export type Language = 'no' | 'en';

// Settings interface
export interface AppSettings {
    language: Language;
}

// Context interface
interface SettingsContextType {
    settings: AppSettings;
    setLanguage: (lang: Language) => void;
}

// Default settings
const defaultSettings: AppSettings = {
    language: 'no', // Norwegian as default
};

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Storage key
const SETTINGS_KEY = 'produsenten_settings';

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings>(() => {
        // Load from localStorage on init
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                return { ...defaultSettings, ...JSON.parse(saved) };
            }
        } catch {
            console.warn('Failed to load settings from localStorage');
        }
        return defaultSettings;
    });

    // Persist to localStorage when settings change
    useEffect(() => {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            console.warn('Failed to save settings to localStorage');
        }
    }, [settings]);

    const setLanguage = (lang: Language) => {
        setSettings(prev => ({ ...prev, language: lang }));
    };

    return (
        <SettingsContext.Provider value={{ settings, setLanguage }}>
            {children}
        </SettingsContext.Provider>
    );
};

// Hook for using settings
export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// Language display names
export const LANGUAGE_OPTIONS: { value: Language; label: string; flag: string }[] = [
    { value: 'no', label: 'Norsk', flag: '🇳🇴' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
];
