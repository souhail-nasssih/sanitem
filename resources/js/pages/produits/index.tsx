import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import CreateProduit from '@/components/produits/CreateProduit';
import EditProduit from '@/components/produits/EditProduit';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    unite: string;
    qte_stock: number;
    prix_vente: number;
    prix_achat: number;
    created_at: string;
    updated_at: string;
}

interface ProduitsIndexProps {
    produits?: {
        data: Produit[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function ProduitsIndex({ produits }: ProduitsIndexProps) {
    const { t, locale } = useTranslation();
    const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; produitId: number | null }>({
        isOpen: false,
        produitId: null,
    });
    const { flash } = usePage().props as { flash?: { success?: string; error?: string } };

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
        router.reload({ only: ['produits'] });
    };

    const handleEdit = (produit: Produit) => {
        setEditingProduit(produit);
    };

    const handleCancelEdit = () => {
        setEditingProduit(null);
    };

    const handleDeleteClick = (produitId: number) => {
        setDeleteConfirm({ isOpen: true, produitId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.produitId) {
            router.delete(`/produits/${deleteConfirm.produitId}`, {
                onSuccess: () => {
                    showToast(t('product_deleted_success'), 'success');
                    setDeleteConfirm({ isOpen: false, produitId: null });
                    handleSuccess();
                },
                    onError: () => {
                        showToast(t('product_delete_error'), 'error');
                    },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, produitId: null });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('produits')}
                </h2>
            }
        >
            <Head title={t('produits')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Create Produit Component */}
                    {!editingProduit && <CreateProduit onSuccess={handleSuccess} />}

                    {/* Edit Produit Component */}
                    {editingProduit && (
                        <div className="mb-6">
                            <EditProduit
                                produit={editingProduit}
                                onSuccess={() => {
                                    setEditingProduit(null);
                                    handleSuccess();
                                }}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    )}

                    {/* Produits List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('list_products')}</h3>

                            {produits && produits.data && produits.data.length > 0 ? (
                                <div className="overflow-x-auto -mx-3 sm:mx-0">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('reference')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell`}>
                                                    {t('description')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell`}>
                                                    {t('unite')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('qte_stock')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell`}>
                                                    {t('prix_achat')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell`}>
                                                    {t('prix_vente')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {produits.data.map((produit) => (
                                                <tr key={produit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className="flex flex-col">
                                                            <span>{produit.reférence}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">{produit.discription}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {produit.discription}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {produit.unite}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {produit.qte_stock}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden lg:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {produit.prix_achat.toFixed(2)} MAD
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 hidden lg:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {produit.prix_vente.toFixed(2)} MAD
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-1 sm:gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(produit)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 sm:p-2"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(produit.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 sm:p-2"
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
                                    {t('no_products_found')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={t('delete_product')}
                message={t('are_you_sure') + ' ' + t('this_action_cannot_be_undone')}
                confirmText={t('delete')}
                cancelText={t('cancel')}
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </AuthenticatedLayout>
    );
}

