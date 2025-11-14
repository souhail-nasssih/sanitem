import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { showToast } from '@/Components/Toast';
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
    const { t } = useTranslation();
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
            showToast(t('please_select_employee'), 'error');
            return;
        }

        if (!selectedEmployee) {
            showToast(t('employee_not_found'), 'error');
            return;
        }

        // Validate CIN
        if (!cinInput.trim()) {
            showToast(t('please_enter_cin'), 'error');
            return;
        }

        if (cinInput.trim() !== selectedEmployee.cin) {
            showToast(t('cin_mismatch'), 'error');
            return;
        }

        router.post('/vendeur/select-employee', {
            employee_id: selectedEmployeeId,
            cin: cinInput.trim(),
        }, {
            onSuccess: () => {
                showToast(t('confirmation_request_sent'), 'success');
            },
            onError: (errors) => {
                if (errors.cin) {
                    showToast(errors.cin, 'error');
                } else {
                    showToast(t('error_selecting_employee'), 'error');
                }
            },
        });
    };

    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('select_employee')}
                </h2>
            }
        >
            <Head title={t('select_employee')} />

                <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100">
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-semibold mb-2">
                                        {t('select_employee_title')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                        {t('select_employee_description')}
                                    </p>
                                </div>

                                {employees && employees.length > 0 ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                                        {employees.map((employee) => (
                                            <div
                                                key={employee.id}
                                                onClick={() => handleSelectEmployee(employee.id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedEmployeeId === employee.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-full ${
                                                        selectedEmployeeId === employee.id
                                                            ? 'bg-blue-500 text-white'
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
                                                        <div className="text-blue-500">
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
                                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-indigo-900/20 border border-blue-200 dark:border-indigo-800 rounded-lg">
                                                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                <div className="p-2 bg-blue-100 dark:bg-indigo-900/40 rounded-full">
                                                    <Shield className="h-5 w-5 text-blue-600 dark:text-indigo-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                                                        {t('security_confirmation')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {t('enter_employee_cin', { name: selectedEmployee.nom_complet })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="cin">{t('employee_cin_label')}</Label>
                                                <Input
                                                    id="cin"
                                                    type="text"
                                                    required
                                                    placeholder={t('enter_employee_cin_placeholder')}
                                                    className="w-full"
                                                    value={cinInput}
                                                    onChange={(e) => setCinInput(e.target.value)}
                                                    autoFocus
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {t('must_enter_cin', { name: selectedEmployee.nom_complet })}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                        <div className="flex items-center justify-end gap-2 sm:gap-4">
                                            <Button
                                                type="submit"
                                                disabled={!selectedEmployeeId || !cinInput.trim() || (selectedEmployee && cinInput.trim() !== selectedEmployee.cin)}
                                                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {t('send_confirmation_request')}
                                            </Button>
                                        </div>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                                        {t('no_employee_available')}
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

