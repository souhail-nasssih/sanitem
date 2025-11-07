import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface Employee {
    id: number;
    nom_complet: string;
    cin: string;
    type: string;
    adresse: string;
}

interface EditEmployeeProps {
    employee: Employee;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EditEmployee({ employee, onSuccess, onCancel }: EditEmployeeProps) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, reset } = useForm({
        nom_complet: employee.nom_complet || '',
        cin: employee.cin || '',
        adresse: employee.adresse || '',
    });

    useEffect(() => {
        reset({
            nom_complet: employee.nom_complet || '',
            cin: employee.cin || '',
            adresse: employee.adresse || '',
        });
    }, [employee, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/employees/${employee.id}`, {
            onSuccess: () => {
                showToast(t('employee_updated_success'), 'success');
                reset();
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('employee_update_error'), 'error');
            },
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('edit_employee')}
                </h3>
                {onCancel && (
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="nom_complet">{t('nom_complet')} *</Label>
                    <Input
                        id="nom_complet"
                        type="text"
                        required
                        placeholder={t('employee_full_name_placeholder')}
                        className="w-full"
                        value={data.nom_complet}
                        onChange={(e) => setData('nom_complet', e.target.value)}
                    />
                    <InputError message={errors.nom_complet} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cin">{t('cin')} *</Label>
                        <Input
                            id="cin"
                            type="text"
                            required
                            placeholder="CIN123456"
                            className="w-full"
                            value={data.cin}
                            onChange={(e) => setData('cin', e.target.value)}
                        />
                        <InputError message={errors.cin} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="adresse">{t('adresse')} *</Label>
                        <Input
                            id="adresse"
                            type="text"
                            required
                            placeholder={t('complete_address_placeholder')}
                            className="w-full"
                            value={data.adresse}
                            onChange={(e) => setData('adresse', e.target.value)}
                        />
                        <InputError message={errors.adresse} />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 pt-3 sm:pt-4">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {processing && <Spinner />}
                        {t('update')}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            {t('cancel')}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}

