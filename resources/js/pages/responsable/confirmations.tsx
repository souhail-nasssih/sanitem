import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Check, X, User, Loader2 } from 'lucide-react';

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
    created_at: string;
    employee: Employee;
    vendeur: Vendeur;
}

interface ConfirmationsProps {
    confirmations: Confirmation[];
}

export default function Confirmations({ confirmations: initialConfirmations }: ConfirmationsProps) {
    const { t } = useTranslation();
    const [confirmations, setConfirmations] = useState(initialConfirmations);
    const [processing, setProcessing] = useState<number | null>(null);
    const [approveConfirm, setApproveConfirm] = useState<{ isOpen: boolean; confirmationId: number | null; confirmation: Confirmation | null }>({
        isOpen: false,
        confirmationId: null,
        confirmation: null,
    });
    const { flash } = usePage().props as any;

    // Show toast messages from flash data
    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    // Poll for new confirmations
    useEffect(() => {
        const pollInterval = setInterval(() => {
            router.reload({
                only: ['confirmations'],
                preserveState: false,
                preserveScroll: true,
                onSuccess: (page) => {
                    const newConfirmations = (page.props as any).confirmations;
                    setConfirmations(newConfirmations || []);
                },
            });
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(pollInterval);
    }, []);

    const handleApproveClick = (confirmation: Confirmation) => {
        setApproveConfirm({
            isOpen: true,
            confirmationId: confirmation.id,
            confirmation: confirmation,
        });
    };

    const handleApproveConfirm = async () => {
        if (!approveConfirm.confirmationId) return;

        const confirmationId = approveConfirm.confirmationId;
        setApproveConfirm({ isOpen: false, confirmationId: null, confirmation: null });
        setProcessing(confirmationId);

        try {
            const response = await fetch(`/confirmations/${confirmationId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || t('confirmation_approved'), 'success');
                // Remove from list
                setConfirmations(prev => prev.filter(c => c.id !== confirmationId));
            } else {
                showToast(data.error || t('approval_error'), 'error');
            }
        } catch (error) {
            showToast(t('approval_error'), 'error');
        } finally {
            setProcessing(null);
        }
    };

    const handleApproveCancel = () => {
        setApproveConfirm({ isOpen: false, confirmationId: null, confirmation: null });
    };

    const handleReject = async (confirmationId: number) => {
        setProcessing(confirmationId);
        try {
            const response = await fetch(`/confirmations/${confirmationId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message || t('confirmation_rejected'), 'success');
                // Remove from list
                setConfirmations(prev => prev.filter(c => c.id !== confirmationId));
            } else {
                showToast(data.error || t('rejection_error'), 'error');
            }
        } catch (error) {
            showToast(t('rejection_error'), 'error');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('confirmations_pending')}
                </h2>
            }
        >
            <Head title={t('confirmations')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('confirmation_requests')}</h3>
                            
                            {confirmations && confirmations.length > 0 ? (
                                <div className="space-y-4">
                                    {confirmations.map((confirmation) => (
                                        <div
                                            key={confirmation.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
                                                            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                                {t('vendeur_requests_access', { name: confirmation.vendeur?.user?.name || t('vendeur') })}
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {t('machine', { name: confirmation.vendeur?.numero_post || 'N/A' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-11 mt-2">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">{t('employee')}:</span> {confirmation.employee.nom_complet}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {t('cin')}: {confirmation.employee.cin} | {confirmation.employee.adresse}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                            {t('requested_on', { date: new Date(confirmation.created_at).toLocaleString('fr-FR') })}
                                                        </p>
                                                    </div>
                                                </div>

                                                    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-4">
                                                        <Button
                                                            onClick={() => handleApproveClick(confirmation)}
                                                            disabled={processing === confirmation.id}
                                                            className="flex-1 sm:flex-initial bg-green-600 hover:bg-green-700 text-white text-sm"
                                                            size="sm"
                                                        >
                                                            {processing === confirmation.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Check className="h-4 w-4 mr-1" />
                                                                    {t('approve')}
                                                                </>
                                                            )}
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleReject(confirmation.id)}
                                                            disabled={processing === confirmation.id}
                                                            variant="outline"
                                                            className="flex-1 sm:flex-initial border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 text-sm"
                                                            size="sm"
                                                        >
                                                            {processing === confirmation.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <X className="h-4 w-4 mr-1" />
                                                                    {t('reject')}
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {t('no_data')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Approval Confirmation Dialog */}
            {approveConfirm.confirmation && (
                <ConfirmDialog
                    isOpen={approveConfirm.isOpen}
                    title={t('approve_confirmation')}
                    message={t('approve_confirmation_message', { 
                        vendeur: approveConfirm.confirmation.vendeur?.user?.name || t('vendeur'),
                        employee: approveConfirm.confirmation.employee.nom_complet 
                    })}
                    confirmText={t('approve')}
                    cancelText={t('cancel')}
                    variant="info"
                    onConfirm={handleApproveConfirm}
                    onCancel={handleApproveCancel}
                />
            )}
        </AuthenticatedLayout>
    );
}

