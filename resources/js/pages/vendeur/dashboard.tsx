import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface Employee {
    id: number;
    nom_complet: string;
    cin: string;
    adresse: string;
}

interface VendeurDashboardProps {
    selectedEmployee?: Employee;
}

export default function VendeurDashboard({ selectedEmployee }: VendeurDashboardProps) {
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

    const handleChangeEmployee = () => {
        router.post('/vendeur/clear-employee', {}, {
            onSuccess: () => {
                router.visit('/vendeur/select-employee');
            },
        });
    };

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Dashboard Vendeur
                </h2>
            }
        >
            <Head title="Dashboard Vendeur" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Selected Employee Card */}
                    {selectedEmployee && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
                                            <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Employee Actuel
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-medium">{selectedEmployee.nom_complet}</span> - CIN: {selectedEmployee.cin}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                {selectedEmployee.adresse}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleChangeEmployee}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Changer d'Employee
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Content */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Bienvenue, Vendeur!</h3>
                            <p className="mb-4">
                                {selectedEmployee 
                                    ? `Vous travaillez avec ${selectedEmployee.nom_complet}. Vous avez accès aux fonctionnalités de vente de l'application.`
                                    : 'Sélectionnez un employee pour commencer à travailler.'
                                }
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Ventes</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                        Gérez vos ventes et bons de livraison
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-900 dark:text-green-100">Clients</h4>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                        Consultez et gérez vos clients
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

