import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function EmployeeDashboard() {
    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Dashboard Employee
                </h2>
            }
        >
            <Head title="Dashboard Employee" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Bienvenue, Employee!</h3>
                            <p className="mb-4">
                                Vous avez accès aux fonctionnalités de base de l'application.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Consultation</h4>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                                        Consultez les informations disponibles
                                    </p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-900 dark:text-green-100">Tâches</h4>
                                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                        Gérez vos tâches quotidiennes
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

