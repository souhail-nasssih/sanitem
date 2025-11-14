import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import CreateClient from '@/components/clients/CreateClient';
import EditClient from '@/components/clients/EditClient';
import ConfirmDialog from '@/components/ConfirmDialog';
import { showToast } from '@/Components/Toast';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface Client {
    id: number;
    nom_complet: string;
    numero_tel: string;
    adresse: string;
    created_at: string;
    updated_at: string;
}

interface ClientsIndexProps {
    clients?: {
        data: Client[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function ClientsIndex({ clients }: ClientsIndexProps) {
    const { t, locale } = useTranslation();
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; clientId: number | null }>({
        isOpen: false,
        clientId: null,
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
        router.reload({ only: ['clients'] });
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
    };

    const handleCancelEdit = () => {
        setEditingClient(null);
    };

    const handleDeleteClick = (clientId: number) => {
        setDeleteConfirm({ isOpen: true, clientId });
    };

    const handleDeleteConfirm = () => {
        if (deleteConfirm.clientId) {
            router.delete(`/clients/${deleteConfirm.clientId}`, {
                onSuccess: () => {
                    showToast(t('client_deleted_success'), 'success');
                    setDeleteConfirm({ isOpen: false, clientId: null });
                    handleSuccess();
                },
                onError: () => {
                    showToast(t('client_delete_error'), 'error');
                },
            });
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ isOpen: false, clientId: null });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('clients')}
                </h2>
            }
        >
            <Head title={t('clients')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Create Client Component */}
                    {!editingClient && <CreateClient onSuccess={handleSuccess} />}

                    {/* Edit Client Component */}
                    {editingClient && (
                        <div className="mb-6">
                            <EditClient
                                client={editingClient}
                                onSuccess={() => {
                                    setEditingClient(null);
                                    handleSuccess();
                                }}
                                onCancel={handleCancelEdit}
                            />
                        </div>
                    )}

                    {/* Clients List */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-3 sm:p-4 md:p-6 text-gray-900 dark:text-gray-100">
                            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">{t('list_clients')}</h3>

                            {clients && clients.data && clients.data.length > 0 ? (
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
                                            {clients.data.map((client) => (
                                                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className="flex flex-col">
                                                            <span>{client.nom_complet}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 md:hidden">{client.adresse}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {client.numero_tel}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 hidden md:table-cell ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        {client.adresse}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                        <div className={`flex items-center gap-1 sm:gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                asChild
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1.5 sm:p-2"
                                                            >
                                                                <Link href={`/clients/${client.id}`}>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleEdit(client)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1.5 sm:p-2"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(client.id)}
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
                                    {t('no_clients_found')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={t('delete_client')}
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
