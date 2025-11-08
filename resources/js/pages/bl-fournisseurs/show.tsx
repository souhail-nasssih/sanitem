import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';

interface Fournisseur {
    id: number;
    nom_complet: string;
    numero_tel?: string;
    adresse?: string;
}

interface Employee {
    id: number;
    nom_complet: string;
}

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    prix_achat: number;
}

interface DetailBLFournisseur {
    id: number;
    produit_id: number;
    qte: number;
    prix: number;
    discription: string;
    produit?: Produit;
}

interface BLFournisseur {
    id: number;
    numero_bl: string;
    date_bl_fournisseur: string;
    fournisseur_id: number;
    employee_id: number;
    fournisseur?: Fournisseur;
    employee?: Employee;
    detailBLFournisseurs?: DetailBLFournisseur[];
    detail_b_l_fournisseurs?: DetailBLFournisseur[];
    created_at: string;
    updated_at: string;
}

interface BLFournisseurShowProps {
    blFournisseur: BLFournisseur;
}

export default function BLFournisseurShow({ blFournisseur }: BLFournisseurShowProps) {
    const { t, locale } = useTranslation();

    const calculateTotal = (details: DetailBLFournisseur[] = []) => {
        if (!details || !Array.isArray(details)) return 0;
        return details.reduce((sum, detail) => sum + (detail.qte * detail.prix), 0);
    };

    // Get details - check all possible property names
    // Laravel serializes relationship method names to snake_case
    // detailBLFournisseurs() becomes detail_b_l_fournisseurs in JSON
    const blFournisseurAny = blFournisseur as BLFournisseur & { detail_b_l_fournisseurs?: DetailBLFournisseur[] };
    const details = blFournisseurAny.detail_b_l_fournisseurs ||
                   blFournisseur.detailBLFournisseurs ||
                   [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('bl_supplier_details') || 'BL Supplier Details'}
                </h2>
            }
        >
            <Head title={`${t('bl_supplier_details') || 'BL Supplier Details'} - ${blFournisseur.numero_bl}`} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/bl-fournisseurs')}
                            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('back') || 'Back'}
                        </Button>
                    </div>

                    {/* BL Fournisseur Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 sm:p-6">
                            {/* Header */}
                            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                    {t('numero_bl')}: {blFournisseur.numero_bl}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            <strong>{t('date_bl')}:</strong> {new Date(blFournisseur.date_bl_fournisseur).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {blFournisseur.employee && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <User className="h-4 w-4" />
                                            <span>
                                                <strong>{t('employee')}:</strong> {blFournisseur.employee.nom_complet}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Fournisseur Information */}
                            {blFournisseur.fournisseur && (
                                <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        {t('supplier_information') || 'Supplier Information'}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 dark:text-gray-400">{t('nom_complet')}:</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{blFournisseur.fournisseur.nom_complet}</p>
                                        </div>
                                        {blFournisseur.fournisseur.numero_tel && (
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">{t('numero_tel')}:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">{blFournisseur.fournisseur.numero_tel}</p>
                                            </div>
                                        )}
                                        {blFournisseur.fournisseur.adresse && (
                                            <div className="sm:col-span-2">
                                                <span className="text-gray-500 dark:text-gray-400">{t('adresse')}:</span>
                                                <p className="font-medium text-gray-900 dark:text-white">{blFournisseur.fournisseur.adresse}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Products List */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    {t('products') || 'Products'}
                                </h4>
                                {details && details.length > 0 ? (
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
                                )}
                            </div>

                            {/* Total */}
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
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

