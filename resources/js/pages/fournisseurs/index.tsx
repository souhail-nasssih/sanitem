import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import CreateFournisseur from '@/components/fournisseurs/CreateFournisseur';
import EditFournisseur from '@/components/fournisseurs/EditFournisseur';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface Fournisseur {
    id: number;
    nom_complet: string;
    numero_tel: string;
    adresse: string;
    created_at: string;
    updated_at: string;
}

interface FournisseursIndexProps {
    fournisseurs?: {
        data: Fournisseur[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function FournisseursIndex({ fournisseurs }: FournisseursIndexProps) {
    const { t, locale } = useTranslation();
    const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; fournisseurId: number | null }>({
        isOpen: false,
        fournisseurId: null,
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
        router.reload({ only: ['fournisseurs'] });
    };

    const handleEdit = (fournisseur: Fournisseur) => {
        setEditingFournisseur(fournisseur);
    };

    const handleCancelEdit = () => {
        setEditingFournisseur(null);
    };

    const handleDeleteClick = (fournisseurId: number) => {
        setDeleteConfirm({ isOpen: true, fournisseurId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.fournisseurId) {
            router.delete(`/fournisseurs/${deleteConfirm.fournisseurId}`, {
                onSuccess: () => {
                    showToast(t('supplier_deleted_success'), 'success');
                    setDeleteConfirm({ isOpen: false, fournisseurId: null });
                    handleSuccess();
                },
                onError: () => {
                    showToast(t('supplier_delete_error'), 'error');
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, fournisseurId: null });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('fournisseurs')}
                </h2>
            }
        >
            <Head title={t('fournisseurs')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Create Fournisseur Component */}
                    {!editingFournisseur && <CreateFournisseur onSuccess={handleSuccess} />}

                    {/* Edit Fournisseur Component */}
                    {editingFournisseur && (
                        <div className="mb-6">
                            <EditFournisseur
                                fournisseur={editingFournisseur}
                                onSuccess={() => {
                                    setEditingFournisseur(null);
                                    handleSuccess();
                                }}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    )}

                    {/* Fournisseurs List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('list_suppliers')}</h3>

                            {fournisseurs && fournisseurs.data && fournisseurs.data.length > 0 ? (
                                <div className="overflow-x-auto -mx-3 sm:mx-0">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('nom_complet')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('numero_tel')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell`}>
                                                    {t('adresse')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {fournisseurs.data.map((fournisseur) => (
                                                <tr key={fournisseur.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className="flex flex-col">
                                                            <span>{fournisseur.nom_complet}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 md:hidden">{fournisseur.adresse}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {fournisseur.numero_tel}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {fournisseur.adresse}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-1 sm:gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2"
                                                  >
                                                                <Link href={`/fournisseurs/${fournisseur.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(fournisseur)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 sm:p-2"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(fournisseur.id)}
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
                                    {t('no_suppliers_found')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={t('delete_supplier')}
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

