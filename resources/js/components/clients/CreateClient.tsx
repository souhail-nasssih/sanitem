import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface CreateClientProps {
    onSuccess?: () => void;
}

export default function CreateClient({ onSuccess }: CreateClientProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nom_complet: '',
        numero_tel: '',
        adresse: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/clients', {
            onSuccess: () => {
                showToast(t('client_created_success'), 'success');
                reset();
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('client_create_error'), 'error');
            },
        });
    };

    return (
        <div className="mb-6">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {t('add_client')}
                </Button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            {t('new_client')}
                        </h3>
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nom_complet">{t('nom_complet')} *</Label>
                                <Input
                                    id="nom_complet"
                                    type="text"
                                    required
                                    placeholder={t('client_full_name_placeholder')}
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
                                    placeholder="0612345678"
                                    className="w-full"
                                    value={data.numero_tel}
                                    onChange={(e) => setData('numero_tel', e.target.value)}
                                />
                                <InputError message={errors.numero_tel} />
                            </div>
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
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {processing && <Spinner />}
                                {t('create_client')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsOpen(false);
                                    reset();
                                }}
                                disabled={processing}
                            >
                                {t('cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

