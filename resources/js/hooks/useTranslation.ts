import { usePage } from '@inertiajs/react';

interface Translations {
    [key: string]: string;
}

export function useTranslation() {
    const { locale, translations } = usePage().props as any;

    const t = (key: string, replacements?: Record<string, string>): string => {
        let translation = translations?.[key] || key;

        // Replace placeholders if provided
        if (replacements) {
            Object.keys(replacements).forEach((placeholder) => {
                translation = translation.replace(`:${placeholder}`, replacements[placeholder]);
            });
        }

        return translation;
    };

    return {
        t,
        locale: locale || 'fr',
    };
}

