import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import CreateBLFournisseur from '@/components/bl-fournisseurs/CreateBLFournisseur';
import EditBLFournisseur from '@/components/bl-fournisseurs/EditBLFournisseur';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface Fournisseur {
    id: number;
    nom_complet: string;
}

interface Employee {
    id: number;
    nom_complet: string;
}

interface BLFournisseur {
    id: number;
    numero_bl: number;
    date_bl_fournisseur: string;
    fournisseur_id: number;
    employee_id: number;
    fournisseur?: Fournisseur;
    employee?: Employee;
    created_at: string;
    updated_at: string;
}

interface Produit {
    id: number;
    reférence: string;
    discription: string;
}

interface BLFournisseursIndexProps {
    blFournisseurs?: {
        data: BLFournisseur[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    fournisseurs?: Fournisseur[];
    employees?: Employee[];
    produits?: Produit[];
    nextNumeroBL?: string;
}

export default function BLFournisseursIndex({ blFournisseurs, fournisseurs = [], employees = [], produits = [], nextNumeroBL }: BLFournisseursIndexProps) {
    const { t, locale } = useTranslation();
    const [editingBLFournisseur, setEditingBLFournisseur] = useState<BLFournisseur | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; blFournisseurId: number | null }>({
        isOpen: false,
        blFournisseurId: null,
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
        router.reload({ only: ['blFournisseurs'] });
    };

    const handleEdit = (blFournisseur: BLFournisseur) => {
        setEditingBLFournisseur(blFournisseur);
    };

    const handleCancelEdit = () => {
        setEditingBLFournisseur(null);
    };

    const handleDeleteClick = (blFournisseurId: number) => {
        setDeleteConfirm({ isOpen: true, blFournisseurId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.blFournisseurId) {
            router.delete(`/bl-fournisseurs/${deleteConfirm.blFournisseurId}`, {
                onSuccess: () => {
                    showToast(t('bl_supplier_deleted_success'), 'success');
                    setDeleteConfirm({ isOpen: false, blFournisseurId: null });
                    handleSuccess();
                },
                onError: () => {
                    showToast(t('bl_supplier_delete_error'), 'error');
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, blFournisseurId: null });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('bl_fournisseurs')}
                </h2>
            }
        >
            <Head title={t('bl_fournisseurs')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Create BL Fournisseur Component */}
                    {!editingBLFournisseur && (
                        <CreateBLFournisseur 
                            fournisseurs={fournisseurs}
                            employees={employees}
                            produits={produits}
                            nextNumeroBL={nextNumeroBL}
                            onSuccess={handleSuccess} 
                        />
                    )}

                    {/* Edit BL Fournisseur Component */}
                    {editingBLFournisseur && (
                        <div className="mb-6">
                            <EditBLFournisseur
                                blFournisseur={editingBLFournisseur}
                                fournisseurs={fournisseurs}
                                employees={employees}
                                produits={produits}
                                onSuccess={() => {
                                    setEditingBLFournisseur(null);
                                    handleSuccess();
                                }}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    )}

                    {/* BL Fournisseurs List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('list_bl_suppliers')}</h3>

                            {blFournisseurs && blFournisseurs.data && blFournisseurs.data.length > 0 ? (
                                <div className="overflow-x-auto -mx-3 sm:mx-0">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('numero_bl')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('date_bl')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell`}>
                                                    {t('fournisseur')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell`}>
                                                    {t('employee')}
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {blFournisseurs.data.map((blFournisseur) => (
                                                <tr key={blFournisseur.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className="flex flex-col">
                                                            <span>{blFournisseur.numero_bl}</span>
                                                            {blFournisseur.fournisseur && (
                                                                <span className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
                                                                    {blFournisseur.fournisseur.nom_complet}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {new Date(blFournisseur.date_bl_fournisseur).toLocaleDateString()}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {blFournisseur.fournisseur?.nom_complet || '-'}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {blFournisseur.employee?.nom_complet || '-'}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-1 sm:gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(blFournisseur)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 sm:p-2"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(blFournisseur.id)}
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
                                    {t('no_bl_suppliers_found')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={t('delete_bl_supplier')}
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

