import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';

export default function ResponsableDashboard() {
    const { t } = useTranslation();
    
    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('dashboard_responsable')}
                </h2>
            }
        >
            <Head title={t('dashboard_responsable')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">{t('welcome_responsable')}</h3>
                            <p className="mb-4">
                                {t('access_all_features')}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100">{t('user_management')}</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                        {t('manage_users_roles')}
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-900 dark:text-green-100">{t('manage_products')}</h4>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                        {t('manage_inventory_products')}
                                    </p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-purple-900 dark:text-purple-100">{t('reports_statistics')}</h4>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                                        {t('view_detailed_reports')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

