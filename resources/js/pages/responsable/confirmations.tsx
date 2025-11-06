import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { showToast } from '@/components/Toast';
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
    const [confirmations, setConfirmations] = useState(initialConfirmations);
    const [processing, setProcessing] = useState<number | null>(null);
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

    const handleApprove = async (confirmationId: number) => {
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
                showToast(data.message || 'Confirmation approuvée avec succès', 'success');
                // Remove from list
                setConfirmations(prev => prev.filter(c => c.id !== confirmationId));
            } else {
                showToast(data.error || 'Erreur lors de l\'approbation', 'error');
            }
        } catch (error) {
            showToast('Erreur lors de l\'approbation', 'error');
        } finally {
            setProcessing(null);
        }
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
                showToast(data.message || 'Confirmation rejetée', 'success');
                // Remove from list
                setConfirmations(prev => prev.filter(c => c.id !== confirmationId));
            } else {
                showToast(data.error || 'Erreur lors du rejet', 'error');
            }
        } catch (error) {
            showToast('Erreur lors du rejet', 'error');
        } finally {
            setProcessing(null);
        }
    };

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Confirmations en attente
                </h2>
            }
        >
            <Head title="Confirmations" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Demandes de confirmation</h3>
                            
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
                                                                {confirmation.vendeur?.user?.name || 'Vendeur'} demande l'accès
                                                            </h4>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Machine: {confirmation.vendeur?.numero_post || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-11 mt-2">
                                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                                            <span className="font-medium">Employee:</span> {confirmation.employee.nom_complet}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            CIN: {confirmation.employee.cin} | {confirmation.employee.adresse}
                                                        </p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                            Demandé le: {new Date(confirmation.created_at).toLocaleString('fr-FR')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    <Button
                                                        onClick={() => handleApprove(confirmation.id)}
                                                        disabled={processing === confirmation.id}
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        size="sm"
                                                    >
                                                        {processing === confirmation.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Check className="h-4 w-4 mr-1" />
                                                                Approuver
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleReject(confirmation.id)}
                                                        disabled={processing === confirmation.id}
                                                        variant="outline"
                                                        className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        size="sm"
                                                    >
                                                        {processing === confirmation.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <X className="h-4 w-4 mr-1" />
                                                                Rejeter
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
                                        Aucune demande de confirmation en attente.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

