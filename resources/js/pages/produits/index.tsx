import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CreateProduit from '@/components/produits/CreateProduit';
import EditProduit from '@/components/produits/EditProduit';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/components/Toast';
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
    const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; produitId: number | null }>({
        isOpen: false,
        produitId: null,
    });
    const { flash } = usePage().props as any;

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
                    showToast('Produit supprimé avec succès', 'success');
                    setDeleteConfirm({ isOpen: false, produitId: null });
                    handleSuccess();
                },
                onError: (errors) => {
                    showToast('Erreur lors de la suppression du produit', 'error');
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
                    Produits
                </h2>
            }
        >
            <Head title="Produits" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-lg font-semibold mb-4">Liste des Produits</h3>
                            
                            {produits && produits.data && produits.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Référence
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Unité
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Prix Achat
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Prix Vente
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {produits.data.map((produit) => (
                                                <tr key={produit.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {produit.reférence}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {produit.discription}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {produit.unite}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {produit.qte_stock}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {produit.prix_achat.toFixed(2)} MAD
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                                        {produit.prix_vente.toFixed(2)} MAD
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(produit)}
                                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(produit.id)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                                    Aucun produit trouvé. Créez votre premier produit en cliquant sur "Ajouter un Produit".
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Supprimer le produit"
                message="Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible."
                confirmText="Supprimer"
                cancelText="Annuler"
                variant="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </AuthenticatedLayout>
    );
}

