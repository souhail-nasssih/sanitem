import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateEmployee from '@/components/employees/CreateEmployee';
import EditEmployee from '@/components/employees/EditEmployee';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Employee {
    id: number;
    nom_complet: string;
    cin: string;
    type: string;
    adresse: string;
    created_at: string;
    updated_at: string;
}

interface EmployeesIndexProps {
    employees?: {
        data: Employee[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function EmployeesIndex({ employees }: EmployeesIndexProps) {
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; employeeId: number | null }>({
        isOpen: false,
        employeeId: null,
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

    const handleSuccess = () => {
        router.reload({ only: ['employees'] });
    };

    const handleEdit = (employee: Employee) => {
        setEditingEmployee(employee);
    };

    const handleCancelEdit = () => {
        setEditingEmployee(null);
    };

    const handleDeleteClick = (employeeId: number) => {
        setDeleteConfirm({ isOpen: true, employeeId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.employeeId) {
            router.delete(`/employees/${deleteConfirm.employeeId}`, {
                onSuccess: () => {
                    showToast('Employee supprimé avec succès', 'success');
                    setDeleteConfirm({ isOpen: false, employeeId: null });
                    handleSuccess();
                },
                onError: (errors) => {
                    showToast('Erreur lors de la suppression de l\'employee', 'error');
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, employeeId: null });
    };

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Employees
                </h2>
            }
        >
            <Head title="Employees" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Create Employee Component */}
                    {!editingEmployee && <CreateEmployee onSuccess={handleSuccess} />}

                    {/* Edit Employee Component */}
                    {editingEmployee && (
                        <div className="mb-6">
                            <EditEmployee
                                employee={editingEmployee}
                                onSuccess={() => {
                                    setEditingEmployee(null);
                                    handleSuccess();
                                }}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    )}

                    {/* Employees List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Liste des Employees</h3>
                            
                            {employees && employees.data && employees.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Nom Complet
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    CIN
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Adresse
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {employees.data.map((employee) => (
                                                <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {employee.nom_complet}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {employee.cin}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {employee.type}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {employee.adresse}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(employee)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(employee.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    Aucun employee trouvé. Créez votre premier employee en cliquant sur "Ajouter un Employee".
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Supprimer l'employee"
                message="Êtes-vous sûr de vouloir supprimer cet employee ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </AuthenticatedLayout>
    );
}

