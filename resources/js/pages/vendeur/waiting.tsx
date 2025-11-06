import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { showToast } from '@/components/Toast';
import { Loader2 } from 'lucide-react';

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
    const [isPolling, setIsPolling] = useState(true);
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
                        showToast('Confirmation approuvée! Redirection...', 'success');
                        setTimeout(() => {
                            router.visit('/vendeur/dashboard');
                        }, 1000);
                    } else if (confirmationData && confirmationData.status === 'rejected') {
                        setIsPolling(false);
                        showToast('Confirmation rejetée', 'error');
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
                    En attente de confirmation
                </h2>
            }
        >
            <Head title="En attente de confirmation" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="text-center">
                                <div className="flex justify-center mb-4">
                                    <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">
                                    En attente de confirmation
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                    Votre demande de confirmation a été envoyée au Responsable.
                                    <br />
                                    Veuillez patienter pendant que votre demande est examinée.
                                </p>

                                {confirmation && confirmation.employee && (
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                            Employee demandé:
                                        </h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">{confirmation.employee.nom_complet}</span>
                                            <br />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                CIN: {confirmation.employee.cin}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Cette page se met à jour automatiquement...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

