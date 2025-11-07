import { useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import InputError from '@/components/input-error';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    unite: string;
    qte_stock: number;
    prix_achat: number;
    prix_vente: number;
}

interface EditProduitProps {
    produit: Produit;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function EditProduit({ produit, onSuccess, onCancel }: EditProduitProps) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, reset } = useForm({
        reférence: produit.reférence || '',
        discription: produit.discription || '',
        unite: produit.unite || '',
        qte_stock: produit.qte_stock?.toString() || '',
        prix_achat: produit.prix_achat?.toString() || '',
        prix_vente: produit.prix_vente?.toString() || '',
    });

    useEffect(() => {
        reset({
            reférence: produit.reférence || '',
            discription: produit.discription || '',
            unite: produit.unite || '',
            qte_stock: produit.qte_stock?.toString() || '',
            prix_achat: produit.prix_achat?.toString() || '',
            prix_vente: produit.prix_vente?.toString() || '',
        });
    }, [produit, reset]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/produits/${produit.id}`, {
            onSuccess: () => {
                showToast(t('product_updated_success'), 'success');
                reset();
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                showToast(t('product_update_error'), 'error');
            },
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {t('edit_product')}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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

