import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface Fournisseur {
    id: number;
    nom_complet: string;
    numero_tel: string;
    adresse: string;
}

interface EditFournisseurProps {
    fournisseur: Fournisseur;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EditFournisseur({ fournisseur, onSuccess, onCancel }: EditFournisseurProps) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, reset } = useForm({
        nom_complet: fournisseur.nom_complet || '',
        numero_tel: fournisseur.numero_tel || '',
        adresse: fournisseur.adresse || '',
    });

    useEffect(() => {
        reset({
            nom_complet: fournisseur.nom_complet || '',
            numero_tel: fournisseur.numero_tel || '',
            adresse: fournisseur.adresse || '',
        });
    }, [fournisseur, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/fournisseurs/${fournisseur.id}`, {
            onSuccess: () => {
                showToast(t('supplier_updated_success'), 'success');
                reset();
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('supplier_update_error'), 'error');
            },
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {t('edit_supplier')}
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
                        placeholder={t('supplier_full_name_placeholder')}
                        className="w-full"
                        value={data.nom_complet}
                        onChange={(e) => setData('nom_complet', e.target.value)}
                    />
                    <InputError message={errors.nom_complet} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="numero_tel">{t('numero_tel')} *</Label>
                    <Input
                        id="numero_tel"
                        type="text"
                        required
                        placeholder="+212 6XX XXX XXX"
                        className="w-full"
                        value={data.numero_tel}
                        onChange={(e) => setData('numero_tel', e.target.value)}
                    />
                    <InputError message={errors.numero_tel} />
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

