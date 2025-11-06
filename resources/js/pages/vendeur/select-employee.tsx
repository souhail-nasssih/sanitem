import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon, Shield } from 'lucide-react';

interface Employee {
    id: number;
    nom_complet: string;
    cin: string;
    adresse: string;
}

interface SelectEmployeeProps {
    employees: Employee[];
}

export default function SelectEmployee({ employees }: SelectEmployeeProps) {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [cinInput, setCinInput] = useState('');
    const { flash } = usePage().props as any;

    // Get selected employee details
    const selectedEmployee = selectedEmployeeId 
        ? employees.find(emp => emp.id === selectedEmployeeId)
        : null;

    // Show toast messages from flash data
    useEffect(() => {
        if (flash?.success) {
            showToast(flash.success, 'success');
        }
        if (flash?.error) {
            showToast(flash.error, 'error');
        }
    }, [flash]);

    // Reset CIN input when employee selection changes
    useEffect(() => {
        setCinInput('');
    }, [selectedEmployeeId]);

    const handleSelectEmployee = (employeeId: number) => {
        setSelectedEmployeeId(employeeId);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedEmployeeId) {
            showToast('Veuillez sélectionner un employee', 'error');
            return;
        }

        if (!selectedEmployee) {
            showToast('Employee sélectionné non trouvé', 'error');
            return;
        }

        // Validate CIN
        if (!cinInput.trim()) {
            showToast('Veuillez entrer le CIN de l\'employee', 'error');
            return;
        }

        if (cinInput.trim() !== selectedEmployee.cin) {
            showToast('Le CIN saisi ne correspond pas à l\'employee sélectionné', 'error');
            return;
        }

        router.post('/vendeur/select-employee', {
            employee_id: selectedEmployeeId,
            cin: cinInput.trim(),
        }, {
            onSuccess: () => {
                showToast('Demande de confirmation envoyée', 'success');
            },
            onError: (errors) => {
                if (errors.cin) {
                    showToast(errors.cin, 'error');
                } else {
                    showToast('Erreur lors de la sélection de l\'employee', 'error');
                }
            },
        });
    };

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Sélectionner un Employee
                </h2>
            }
        >
            <Head title="Sélectionner un Employee" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">
                                    Sélectionnez l'employee qui va travailler avec cette machine
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Choisissez un employee dans la liste ci-dessous pour commencer à travailler.
                                </p>
                            </div>

                            {employees && employees.length > 0 ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        {employees.map((employee) => (
                                            <div
                                                key={employee.id}
                                                onClick={() => handleSelectEmployee(employee.id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedEmployeeId === employee.id
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-full ${
                                                        selectedEmployeeId === employee.id
                                                            ? 'bg-indigo-500 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                                    }`}>
                                                        <UserIcon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                            {employee.nom_complet}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                            {employee.adresse}
                                                        </p>
                                                    </div>
                                                    {selectedEmployeeId === employee.id && (
                                                        <div className="text-indigo-500">
                                                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* CIN Confirmation Section */}
                                    {selectedEmployee && (
                                        <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                            <div className="flex items-start gap-3 mb-4">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-full">
                                                    <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                        Confirmation de sécurité
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Veuillez entrer le CIN de <span className="font-medium">{selectedEmployee.nom_complet}</span> pour confirmer la sélection.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="cin">CIN de l'Employee *</Label>
                                                <Input
                                                    id="cin"
                                                    type="text"
                                                    required
                                                    placeholder="Entrez le CIN de l'employee sélectionné"
                                                    className="w-full"
                                                    value={cinInput}
                                                    onChange={(e) => setCinInput(e.target.value)}
                                                    autoFocus
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Vous devez entrer le CIN de {selectedEmployee.nom_complet} pour confirmer la sélection.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-end gap-4">
                                        <Button
                                            type="submit"
                                            disabled={!selectedEmployeeId || !cinInput.trim() || (selectedEmployee && cinInput.trim() !== selectedEmployee.cin)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Envoyer la demande de confirmation
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        Aucun employee disponible. Veuillez contacter l'administrateur.
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

