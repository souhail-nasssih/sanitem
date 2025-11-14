import { router, usePage } from '@inertiajs/react';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

export default function LanguageSwitcher() {
    const { locale } = usePage().props as any;
    const currentLocale = locale || 'fr';

    const languages = [
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    ];

    const handleLanguageChange = (localeCode: string) => {
        if (localeCode === currentLocale) return;

        router.post(`/language/${localeCode}`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Reload the page to apply translations
                window.location.reload();
            },
        });
    };

    const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Globe className="h-4 w-4" />
                    <span className="hidden md:inline">{currentLanguage.flag} {currentLanguage.name}</span>
                    <span className="md:hidden">{currentLanguage.flag}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((language) => (
                    <DropdownMenuItem
                        key={language.code}
                        onClick={() => handleLanguageChange(language.code)}
                        className={currentLocale === language.code ? 'bg-blue-50 dark:bg-indigo-900/20' : ''}
                    >
                        <span className="mr-2">{language.flag}</span>
                        <span>{language.name}</span>
                        {currentLocale === language.code && (
                            <span className="ml-auto">✓</span>
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

