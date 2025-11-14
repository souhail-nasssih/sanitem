import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import CreateBonLivraison from '@/components/bl-clients/CreateBonLivraison';
import EditBonLivraison from '@/components/bl-clients/EditBonLivraison';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye, FileText, Calendar, Users, Monitor, Package } from 'lucide-react';

interface Client {
    id: number;
    nom_complet: string;
}

interface Vendeur {
    id: number;
    numero_post: string;
    user?: {
        id: number;
        name: string;
    };
}

interface BonLivraison {
    id: number;
    numero_bl: string;
    date_bl: string;
    client_id: number;
    vendeur_id: number;
    client?: Client;
    vendeur?: Vendeur;
    created_at: string;
    updated_at: string;
}

interface BLClientsIndexProps {
    bonLivraisons?: {
        data: BonLivraison[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    clients?: Client[];
    vendeurs?: Vendeur[];
    produits?: {
        id: number;
        reférence: string;
        discription: string;
    }[];
    nextNumeroBL?: string;
    currentVendeurId?: number | null;
}

export default function BLClientsIndex({ bonLivraisons, clients = [], vendeurs = [], produits = [], nextNumeroBL, currentVendeurId }: BLClientsIndexProps) {
    const { t, locale } = useTranslation();
    const [editingBonLivraison, setEditingBonLivraison] = useState<BonLivraison | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; bonLivraisonId: number | null }>({
        isOpen: false,
        bonLivraisonId: null,
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
        router.reload({ only: ['bonLivraisons'] });
    };

    const handleEdit = (bonLivraison: BonLivraison) => {
        setEditingBonLivraison(bonLivraison);
    };

    const handleCancelEdit = () => {
        setEditingBonLivraison(null);
    };

    const handleDeleteClick = (bonLivraisonId: number) => {
        setDeleteConfirm({ isOpen: true, bonLivraisonId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.bonLivraisonId) {
            router.delete(`/bl-clients/${deleteConfirm.bonLivraisonId}`, {
                onSuccess: () => {
                    showToast(t('bl_client_deleted_success'), 'success');
                    setDeleteConfirm({ isOpen: false, bonLivraisonId: null });
                    handleSuccess();
                },
                onError: () => {
                    showToast(t('bl_client_delete_error'), 'error');
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, bonLivraisonId: null });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('bl_clients')}
                </h2>
            }
        >
            <Head title={t('bl_clients')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Create Bon Livraison Component */}
                    {!editingBonLivraison && (
                        <CreateBonLivraison 
                            clients={clients}
                            vendeurs={vendeurs}
                            produits={produits}
                            nextNumeroBL={nextNumeroBL}
                            currentVendeurId={currentVendeurId}
                            onSuccess={handleSuccess} 
                        />
                    )}

                    {/* Edit Bon Livraison Component */}
                    {editingBonLivraison && (
                        <div className="mb-6">
                            <EditBonLivraison
                                bonLivraison={editingBonLivraison}
                                clients={clients}
                                vendeurs={vendeurs}
                                produits={produits}
                                onSuccess={() => {
                                    setEditingBonLivraison(null);
                                    handleSuccess();
                                }}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    )}

                    {/* Bon Livraisons List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('list_bl_clients')}</h3>

                            {bonLivraisons && bonLivraisons.data && bonLivraisons.data.length > 0 ? (
                                <div className="overflow-x-auto -mx-3 sm:mx-0">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                        <FileText className="h-4 w-4" />
                                                        <span>{t('numero_bl')}</span>
                                                    </div>
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{t('date_bl')}</span>
                                                    </div>
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell`}>
                                                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                        <Users className="h-4 w-4" />
                                                        <span>{t('client')}</span>
                                                    </div>
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell`}>
                                                    <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                        <Monitor className="h-4 w-4" />
                                                        <span>{t('vendeur')}</span>
                                                    </div>
                                                </th>
                                                <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                    {t('actions')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {bonLivraisons.data.map((bonLivraison) => (
                                                <tr key={bonLivraison.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className="flex flex-col">
                                                            <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                                <FileText className="h-4 w-4 text-blue-600 dark:text-indigo-400" />
                                                                <span>{bonLivraison.numero_bl}</span>
                                                            </div>
                                                            {bonLivraison.client && (
                                                                <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400 sm:hidden ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                                    <Users className="h-3 w-3" />
                                                                    <span>{bonLivraison.client.nom_complet}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Calendar className="h-4 w-4 text-gray-400" />
                                                            <span>{new Date(bonLivraison.date_bl).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 hidden sm:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Users className="h-4 w-4 text-gray-400" />
                                                            <span>{bonLivraison.client?.nom_complet || '-'}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Monitor className="h-4 w-4 text-gray-400" />
                                                            <span>{bonLivraison.vendeur?.user?.name || `Vendeur #${bonLivraison.vendeur?.numero_post || '-'}`}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-1 sm:gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.visit(`/bl-clients/${bonLivraison.id}`)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2"
                                                                title={t('view_details') || 'View Details'}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(bonLivraison)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 sm:p-2"
                                                                title={t('edit') || 'Edit'}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(bonLivraison.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1.5 sm:p-2"
                                                                title={t('delete') || 'Delete'}
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
                                    {t('no_bl_clients_found')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={t('delete_bl_client')}
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
