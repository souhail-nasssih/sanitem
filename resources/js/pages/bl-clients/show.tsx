import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User, FileText, Monitor, Users, Phone, MapPin, Package, Hash, DollarSign, Coins } from 'lucide-react';

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

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    prix_vente: number;
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

interface BLClientShowProps {
    bonLivraison: BonLivraison;
}

export default function BLClientShow({ bonLivraison }: BLClientShowProps) {
    const { t, locale } = useTranslation();

    const calculateTotal = (details: DetailBL[] = []) => {
        if (!details || !Array.isArray(details)) return 0;
        return details.reduce((sum, detail) => sum + (detail.qte * detail.prix), 0);
    };

    // Get details - check all possible property names
    // Laravel serializes relationship method names to snake_case
    // detailBLs() becomes detail_b_l_s in JSON
    const bonLivraisonAny = bonLivraison as BonLivraison & { detail_b_l_s?: DetailBL[]; detail_b_ls?: DetailBL[] };
    const details = bonLivraisonAny.detail_b_l_s ||
                   bonLivraisonAny.detail_b_ls ||
                   bonLivraison.detailBLs ||
                   [];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('bl_client_details') || 'BL Client Details'}
                </h2>
            }
        >
            <Head title={`${t('bl_client_details') || 'BL Client Details'} - ${bonLivraison.numero_bl}`} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit('/bl-clients')}
                            className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('back') || 'Back'}
                        </Button>
                    </div>

                    {/* BL Client Details Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 sm:p-6">
                            {/* Header */}
                            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className={`flex items-center gap-3 mb-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                        {t('numero_bl')}: {bonLivraison.numero_bl}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        <span>
                                            <strong>{t('date_bl')}:</strong> {new Date(bonLivraison.date_bl).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {bonLivraison.vendeur && (
                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                            <Monitor className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            <span>
                                                <strong>{t('vendeur')}:</strong> {bonLivraison.vendeur.user?.name || `Vendeur #${bonLivraison.vendeur.numero_post}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Client Information */}
                            {bonLivraison.client && (
                                <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className={`flex items-center gap-2 mb-3 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                        <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {t('client_information') || 'Client Information'}
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className={`flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                <User className="h-4 w-4" />
                                                <span>{t('nom_complet')}:</span>
                                            </div>
                                            <p className="font-medium text-gray-900 dark:text-white">{bonLivraison.client.nom_complet}</p>
                                        </div>
                                        {bonLivraison.client.numero_tel && (
                                            <div>
                                                <div className={`flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                    <Phone className="h-4 w-4" />
                                                    <span>{t('numero_tel')}:</span>
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-white">{bonLivraison.client.numero_tel}</p>
                                            </div>
                                        )}
                                        {bonLivraison.client.adresse && (
                                            <div className="sm:col-span-2">
                                                <div className={`flex items-center gap-2 mb-1 text-gray-500 dark:text-gray-400 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{t('adresse')}:</span>
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-white">{bonLivraison.client.adresse}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Products List */}
                            <div className="mb-6">
                                <div className={`flex items-center gap-2 mb-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                    <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {t('products') || 'Products'}
                                    </h4>
                                </div>
                                {details && details.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Hash className="h-4 w-4" />
                                                            <span>{t('reference') || 'Reference'}</span>
                                                        </div>
                                                    </th>
                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <FileText className="h-4 w-4" />
                                                            <span>{t('description') || 'Description'}</span>
                                                        </div>
                                                    </th>
                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Package className="h-4 w-4" />
                                                            <span>{t('quantite') || 'Quantity'}</span>
                                                        </div>
                                                    </th>
                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <DollarSign className="h-4 w-4" />
                                                            <span>{t('prix') || 'Price'}</span>
                                                        </div>
                                                    </th>
                                                    <th className={`px-4 py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                        <div className={`flex items-center gap-2 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                                                            <Coins className="h-4 w-4" />
                                                            <span>{t('total') || 'Total'}</span>
                                                        </div>
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
                                )}
                            </div>

                            {/* Total */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className={`flex items-center justify-between ${locale === 'fr' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-2 ${locale === 'fr' ? 'order-1' : locale === 'ar' ? 'order-2' : ''}`}>
                                        <Coins className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                            {calculateTotal(details).toFixed(2)} MAD
                                        </span>
                                    </div>
                                    <div className={`flex items-center gap-2 ${locale === 'fr' ? 'order-2' : locale === 'ar' ? 'order-1' : ''}`}>
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {t('total') || 'Total'}:
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

