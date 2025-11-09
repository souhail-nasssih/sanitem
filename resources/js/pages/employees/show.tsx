import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, FileText, Eye, Monitor, X, ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface Fournisseur {
    id: number;
    nom_complet: string;
    numero_tel?: string;
    adresse?: string;
}

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    prix_achat: number;
    prix_vente?: number;
}

interface DetailBLFournisseur {
    id: number;
    produit_id: number;
    qte: number;
    prix: number;
    discription: string;
    produit?: Produit;
}

interface Employee {
    id: number;
    nom_complet: string;
}

interface BLFournisseur {
    id: number;
    numero_bl: string;
    date_bl_fournisseur: string;
    fournisseur_id: number;
    employee_id: number;
    vendeur_id?: number;
    fournisseur?: Fournisseur;
    employee?: Employee;
    vendeur?: Vendeur;
    detailBLFournisseurs?: DetailBLFournisseur[];
    detail_b_l_fournisseurs?: DetailBLFournisseur[];
    created_at: string;
    updated_at: string;
}

interface Client {
    id: number;
    nom_complet: string;
    numero_tel?: string;
    adresse?: string;
}

interface Vendeur {
    id: number;
    numero_post: string;
    user?: {
        id: number;
        name: string;
    };
}

interface DetailBL {
    id: number;
    produit_id: number;
    qte: number;
    prix: number;
    produit?: Produit;
}

interface BonLivraison {
    id: number;
    numero_bl: string;
    date_bl: string;
    client_id: number;
    vendeur_id: number;
    client?: Client;
    vendeur?: Vendeur;
    detailBLs?: DetailBL[];
    detail_b_l_s?: DetailBL[];
    created_at: string;
    updated_at: string;
}

interface EmployeeFull {
    id: number;
    nom_complet: string;
    cin: string;
    type?: string;
    adresse: string;
    bl_fournisseurs?: BLFournisseur[];
    blFournisseurs?: BLFournisseur[];
    created_at: string;
    updated_at: string;
}

interface EmployeeShowProps {
    employee: EmployeeFull;
    blClients?: BonLivraison[];
}

export default function EmployeeShow({ employee, blClients = [] }: EmployeeShowProps) {
    const { t, locale } = useTranslation();
    const [selectedBLFournisseur, setSelectedBLFournisseur] = useState<BLFournisseur | null>(null);
    const [selectedBLClient, setSelectedBLClient] = useState<BonLivraison | null>(null);

    const calculateTotal = (details: DetailBLFournisseur[] = []) => {
        if (!details || !Array.isArray(details)) return 0;
        return details.reduce((sum, detail) => sum + (detail.qte * detail.prix), 0);
    };

    const calculateBLClientTotal = (details: DetailBL[] = []) => {
        if (!details || !Array.isArray(details)) return 0;
        return details.reduce((sum, detail) => sum + (detail.qte * detail.prix), 0);
    };

    // Get BLs - check all possible property names
    const employeeAny = employee as EmployeeFull & { bl_fournisseurs?: BLFournisseur[] };
    const blFournisseurs = employeeAny.bl_fournisseurs ||
                          employee.blFournisseurs ||
                          [];

    // Get details for a BL - check all possible property names
    const getBLDetails = (bl: BLFournisseur): DetailBLFournisseur[] => {
        const blAny = bl as BLFournisseur & { detail_b_l_fournisseurs?: DetailBLFournisseur[] };
        return blAny.detail_b_l_fournisseurs ||
               bl.detailBLFournisseurs ||
               [];
    };

    // Get details for a BL Client - check all possible property names
    const getBLClientDetails = (bl: BonLivraison): DetailBL[] => {
        const blAny = bl as BonLivraison & { detail_b_l_s?: DetailBL[] };
        return blAny.detail_b_l_s ||
               bl.detailBLs ||
               [];
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('employee_details') || 'Employee Details'}
                </h2>
            }
        >
            <Head title={`${t('employee_details') || 'Employee Details'} - ${employee.nom_complet}`} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/employees')}
                            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('back') || 'Back'}
                        </Button>
                    </div>

                    {/* Employee Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                        <div className="p-4 sm:p-6">
                            {/* Header */}
                            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {employee.nom_complet}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <User className="h-4 w-4" />
                                        <span>
                                            <strong>{t('cin')}:</strong> {employee.cin}
                                        </span>
                                    </div>
                                    {employee.type && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <FileText className="h-4 w-4" />
                                            <span>
                                                <strong>{t('type') || 'Type'}:</strong> {employee.type}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 sm:col-span-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            <strong>{t('adresse')}:</strong> {employee.adresse}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BL Fournisseurs List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                        <div className="p-4 sm:p-6">
                            {!selectedBLFournisseur ? (
                                <>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {t('bl_suppliers_created') || 'BL Suppliers Created'} ({blFournisseurs.length})
                                    </h4>
                                    {blFournisseurs && blFournisseurs.length > 0 ? (
                                        <div className="space-y-4">
                                            {blFournisseurs.map((bl) => {
                                                const details = getBLDetails(bl);
                                                return (
                                                    <div
                                                        key={bl.id}
                                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                                    {t('numero_bl')}: {bl.numero_bl}
                                                                </h5>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    {t('date_bl')}: {new Date(bl.date_bl_fournisseur).toLocaleDateString()}
                                                                </p>
                                                                {bl.fournisseur && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                        {t('fournisseur')}: {bl.fournisseur.nom_complet}
                                                                    </p>
                                                                )}
                                                                {bl.vendeur && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                                                        <Monitor className="h-3 w-3" />
                                                                        <span>
                                                                            <strong>{t('vendeur')}:</strong> {bl.vendeur.user?.name || bl.vendeur.numero_post}
                                                                        </span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSelectedBLFournisseur(bl)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                {t('view_details') || 'View Details'}
                                                            </Button>
                                                        </div>
                                                        {details && details.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                    <strong>{t('products') || 'Products'}:</strong> {details.length} |{' '}
                                                                    <strong>{t('total') || 'Total'}:</strong>{' '}
                                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                                        {calculateTotal(details).toFixed(2)} MAD
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {t('no_bl_suppliers_found_employee') || 'No BL suppliers found for this employee'}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    {/* Back Button */}
                                    <div className="mb-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSelectedBLFournisseur(null)}
                                            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            {t('back') || 'Back'}
                                        </Button>
                                    </div>

                                    {/* BL Fournisseur Details */}
                                    <div className="space-y-6">
                                        {/* Header Info */}
                                        <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                                {t('bl_supplier_details') || 'BL Supplier Details'} - {selectedBLFournisseur.numero_bl}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        <strong>{t('date_bl')}:</strong> {new Date(selectedBLFournisseur.date_bl_fournisseur).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {selectedBLFournisseur.employee && (
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                        <User className="h-4 w-4" />
                                                        <span>
                                                            <strong>{t('employee')}:</strong> {selectedBLFournisseur.employee.nom_complet}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedBLFournisseur.vendeur && (
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                        <Monitor className="h-4 w-4" />
                                                        <span>
                                                            <strong>{t('vendeur')}:</strong> {selectedBLFournisseur.vendeur.user?.name || selectedBLFournisseur.vendeur.numero_post}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Fournisseur Information */}
                                        {selectedBLFournisseur.fournisseur && (
                                            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                    {t('supplier_information') || 'Supplier Information'}
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">{t('nom_complet')}:</span>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBLFournisseur.fournisseur.nom_complet}</p>
                                                    </div>
                                                    {selectedBLFournisseur.fournisseur.numero_tel && (
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{t('numero_tel')}:</span>
                                                            <p className="font-medium text-gray-900 dark:text-white">{selectedBLFournisseur.fournisseur.numero_tel}</p>
                                                        </div>
                                                    )}
                                                    {selectedBLFournisseur.fournisseur.adresse && (
                                                        <div className="sm:col-span-2">
                                                            <span className="text-gray-500 dark:text-gray-400">{t('adresse')}:</span>
                                                            <p className="font-medium text-gray-900 dark:text-white">{selectedBLFournisseur.fournisseur.adresse}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Products List */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                {t('products') || 'Products'}
                                            </h4>
                                            {(() => {
                                                const details = getBLDetails(selectedBLFournisseur);
                                                return details && details.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                                <tr>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('reference') || 'Reference'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('description') || 'Description'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('quantite') || 'Quantity'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('prix') || 'Price'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('discription') || 'Product Description'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('total') || 'Total'}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                                {details.map((detail: DetailBLFournisseur) => (
                                                                    <tr key={detail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                        <td className={`px-4 py-3 text-sm text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.produit?.reférence || '-'}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.produit?.discription || '-'}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.qte}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.prix.toFixed(2)} MAD
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.discription || '-'}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {(detail.qte * detail.prix).toFixed(2)} MAD
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">{t('no_products') || 'No products found'}</p>
                                                );
                                            })()}
                                        </div>

                                        {/* Total */}
                                        {(() => {
                                            const details = getBLDetails(selectedBLFournisseur);
                                            return (
                                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <div className={`flex items-center justify-between ${locale === 'fr' ? 'flex-row-reverse' : ''}`}>
                                                        <span className={`text-2xl font-bold text-indigo-600 dark:text-indigo-400 ${locale === 'fr' ? 'order-1' : locale === 'ar' ? 'order-2' : ''}`}>
                                                            {calculateTotal(details).toFixed(2)} MAD
                                                        </span>
                                                        <span className={`text-lg font-semibold text-gray-900 dark:text-white ${locale === 'fr' ? 'order-2' : locale === 'ar' ? 'order-1' : ''}`}>
                                                            {t('total') || 'Total'}:
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* BL Clients List */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 sm:p-6">
                            {!selectedBLClient ? (
                                <>
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        {t('bl_clients_created') || 'BL Clients Created'} ({blClients.length})
                                    </h4>
                                    {blClients && blClients.length > 0 ? (
                                        <div className="space-y-4">
                                            {blClients.map((bl) => {
                                                const details = getBLClientDetails(bl);
                                                return (
                                                    <div
                                                        key={bl.id}
                                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div>
                                                                <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                                    {t('numero_bl')}: {bl.numero_bl}
                                                                </h5>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                    {t('date_bl')}: {new Date(bl.date_bl).toLocaleDateString()}
                                                                </p>
                                                                {bl.client && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                                        {t('client')}: {bl.client.nom_complet}
                                                                    </p>
                                                                )}
                                                                {bl.vendeur && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                                                                        <Monitor className="h-3 w-3" />
                                                                        <span>
                                                                            <strong>{t('vendeur')}:</strong> {bl.vendeur.user?.name || bl.vendeur.numero_post}
                                                                        </span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSelectedBLClient(bl)}
                                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                {t('view_details') || 'View Details'}
                                                            </Button>
                                                        </div>
                                                        {details && details.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                    <strong>{t('products') || 'Products'}:</strong> {details.length} |{' '}
                                                                    <strong>{t('total') || 'Total'}:</strong>{' '}
                                                                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                                        {calculateBLClientTotal(details).toFixed(2)} MAD
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400">
                                            {t('no_bl_clients_found_employee') || 'No BL clients found for this employee'}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-6">
                                    {/* Back Button */}
                                    <div className="mb-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setSelectedBLClient(null)}
                                            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            {t('back') || 'Back'}
                                        </Button>
                                    </div>

                                    {/* BL Client Details */}
                                    <div className="space-y-6">
                                        {/* Header Info */}
                                        <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                                {t('bl_client_details') || 'BL Client Details'} - {selectedBLClient.numero_bl}
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        <strong>{t('date_bl')}:</strong> {new Date(selectedBLClient.date_bl).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {selectedBLClient.vendeur && (
                                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                                        <Monitor className="h-4 w-4" />
                                                        <span>
                                                            <strong>{t('vendeur')}:</strong> {selectedBLClient.vendeur.user?.name || selectedBLClient.vendeur.numero_post}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Client Information */}
                                        {selectedBLClient.client && (
                                            <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                    {t('client_information') || 'Client Information'}
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 dark:text-gray-400">{t('nom_complet')}:</span>
                                                        <p className="font-medium text-gray-900 dark:text-white">{selectedBLClient.client.nom_complet}</p>
                                                    </div>
                                                    {selectedBLClient.client.numero_tel && (
                                                        <div>
                                                            <span className="text-gray-500 dark:text-gray-400">{t('numero_tel')}:</span>
                                                            <p className="font-medium text-gray-900 dark:text-white">{selectedBLClient.client.numero_tel}</p>
                                                        </div>
                                                    )}
                                                    {selectedBLClient.client.adresse && (
                                                        <div className="sm:col-span-2">
                                                            <span className="text-gray-500 dark:text-gray-400">{t('adresse')}:</span>
                                                            <p className="font-medium text-gray-900 dark:text-white">{selectedBLClient.client.adresse}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Products List */}
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                {t('products') || 'Products'}
                                            </h4>
                                            {(() => {
                                                const details = getBLClientDetails(selectedBLClient);
                                                return details && details.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                                <tr>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('reference') || 'Reference'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('description') || 'Description'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('quantite') || 'Quantity'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('prix') || 'Price'}
                                                                    </th>
                                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('total') || 'Total'}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                                {details.map((detail) => (
                                                                    <tr key={detail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                        <td className={`px-4 py-3 text-sm text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.produit?.reférence || '-'}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.produit?.discription || '-'}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.qte}
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {detail.prix.toFixed(2)} MAD
                                                                        </td>
                                                                        <td className={`px-4 py-3 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                            {(detail.qte * detail.prix).toFixed(2)} MAD
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400">{t('no_products') || 'No products found'}</p>
                                                );
                                            })()}
                                        </div>

                                        {/* Total */}
                                        {(() => {
                                            const details = getBLClientDetails(selectedBLClient);
                                            return (
                                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <div className={`flex items-center justify-between ${locale === 'fr' ? 'flex-row-reverse' : ''}`}>
                                                        <span className={`text-2xl font-bold text-indigo-600 dark:text-indigo-400 ${locale === 'fr' ? 'order-1' : locale === 'ar' ? 'order-2' : ''}`}>
                                                            {calculateBLClientTotal(details).toFixed(2)} MAD
                                                        </span>
                                                        <span className={`text-lg font-semibold text-gray-900 dark:text-white ${locale === 'fr' ? 'order-2' : locale === 'ar' ? 'order-1' : ''}`}>
                                                            {t('total') || 'Total'}:
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>
    );
}

