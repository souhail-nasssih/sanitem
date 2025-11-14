import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { showToast } from '@/Components/Toast';
import { Loader2 } from 'lucide-react';
import echo from '@/echo';

interface Employee {
    id: number;
    nom_complet: string;
    cin: string;
    adresse: string;
}

interface Vendeur {
    id: number;
    numero_post: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Confirmation {
    id: number;
    vendeur_id: number;
    employee_id: number;
    status: string;
    employee: Employee;
    vendeur?: Vendeur;
}

interface WaitingProps {
    confirmation: Confirmation;
}

export default function Waiting({ confirmation }: WaitingProps) {
    const { t } = useTranslation();
    const [isPolling, setIsPolling] = useState(true);
    const { flash, auth } = usePage().props as any;
    const vendeurId = auth?.user?.vendeur?.id;

    // Show toast messages from flash data
    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    // Setup WebSocket listener for real-time rejection
    useEffect(() => {
        if (!vendeurId || !isPolling) return;

        const channel = echo.private(`vendeur.${vendeurId}`);

        channel.listen('.confirmation.rejected', (data) => {
            setIsPolling(false);
            showToast(t('confirmation_rejected'), 'error');
            setTimeout(() => {
                router.visit('/vendeur/select-employee');
            }, 1500);
        });

        channel.listen('.confirmation.approved', (data) => {
            setIsPolling(false);
            showToast(t('confirmation_approved_redirect'), 'success');
            setTimeout(() => {
                router.visit('/vendeur/dashboard');
            }, 1000);
        });

        return () => {
            echo.leave(`vendeur.${vendeurId}`);
        };
    }, [vendeurId, isPolling, t]);

    // Poll for confirmation status
    useEffect(() => {
        if (!isPolling) return;

        const pollInterval = setInterval(() => {
            router.reload({
                only: ['confirmation'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const confirmationData = (page.props as any).confirmation;
                    if (confirmationData && confirmationData.status === 'approved') {
                        setIsPolling(false);
                        showToast(t('confirmation_approved_redirect'), 'success');
                        setTimeout(() => {
                            router.visit('/vendeur/dashboard');
                        }, 1000);
                    } else if (confirmationData && confirmationData.status === 'rejected') {
                        setIsPolling(false);
                        showToast(t('confirmation_rejected'), 'error');
                        setTimeout(() => {
                            router.visit('/vendeur/select-employee');
                        }, 2000);
                    }
                },
            });
        }, 3000); // Poll every 3 seconds

        return () => clearInterval(pollInterval);
    }, [isPolling]);

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('waiting_confirmation')}
                </h2>
            }
        >
            <Head title={t('waiting_confirmation')} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <Loader2 className="h-12 w-12 text-blue-600 dark:text-indigo-400 animate-spin" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    {t('waiting_confirmation')}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    {t('waiting_confirmation_description')}
                                    <br />
                                    {t('please_wait')}
                                </p>

                                {confirmation && confirmation.employee && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                            {t('employee_requested')}
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">{confirmation.employee.nom_complet}</span>
                                            <br />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {t('cin')}: {confirmation.employee.cin}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('page_updates_automatically')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

