import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface CreateProduitProps {
    onSuccess?: () => void;
}

export default function CreateProduit({ onSuccess }: CreateProduitProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        reférence: '',
        discription: '',
        unite: '',
        qte_stock: '',
        prix_achat: '',
        prix_vente: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/produits', {
            onSuccess: () => {
                showToast(t('product_created_success'), 'success');
                reset();
                setIsOpen(false);
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('product_create_error'), 'error');
            },
        });
    };

    return (
        <div className="mb-6">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {t('add_product')}
                </Button>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('new_product')}
                        </h3>
                        <Button
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            ✕
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="reférence">{t('reference')} *</Label>
                                <Input
                                    id="reférence"
                                    type="text"
                                    required
                                    placeholder="REF-001"
                                    className="w-full"
                                    value={data.reférence}
                                    onChange={(e) => setData('reférence', e.target.value)}
                                />
                                <InputError message={errors.reférence} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="unite">{t('unite')} *</Label>
                                <Input
                                    id="unite"
                                    type="text"
                                    required
                                    placeholder="kg, L, pièce, etc."
                                    className="w-full"
                                    value={data.unite}
                                    onChange={(e) => setData('unite', e.target.value)}
                                />
                                <InputError message={errors.unite} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="discription">{t('description')} *</Label>
                            <Input
                                id="discription"
                                type="text"
                                required
                                placeholder={t('product_description_placeholder')}
                                className="w-full"
                                value={data.discription}
                                onChange={(e) => setData('discription', e.target.value)}
                            />
                            <InputError message={errors.discription} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="qte_stock">{t('qte_stock')} *</Label>
                                <Input
                                    id="qte_stock"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full"
                                    value={data.qte_stock}
                                    onChange={(e) => setData('qte_stock', e.target.value)}
                                />
                                <InputError message={errors.qte_stock} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="prix_achat">{t('prix_achat')} *</Label>
                                <Input
                                    id="prix_achat"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full"
                                    value={data.prix_achat}
                                    onChange={(e) => setData('prix_achat', e.target.value)}
                                />
                                <InputError message={errors.prix_achat} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="prix_vente">{t('prix_vente')} *</Label>
                                <Input
                                    id="prix_vente"
                                    type="number"
                                    step="0.01"
                                    required
                                    placeholder="0.00"
                                    className="w-full"
                                    value={data.prix_vente}
                                    onChange={(e) => setData('prix_vente', e.target.value)}
                                />
                                <InputError message={errors.prix_vente} />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {processing && <Spinner />}
                                {t('create_product')}
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

