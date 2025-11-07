import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { useTranslation } from '@/hooks/useTranslation';

import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Appearance() {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout>
            <Head title={t('appearance_settings')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title={t('appearance_settings')}
                        description={t('appearance_settings_description')}
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AuthenticatedLayout>
    );
}
