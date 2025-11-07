import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowLeft, Calendar, Phone, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Produit {
    id: number;
    reférence: string;
    discription: string;
    unite: string;
}

interface DetailBL {
    id: number;
    qte: number;
    prix: number;
    produit_id: number;
    produit?: Produit;
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
    numero_bl: number;
    date_bl: string;
    client_id: number;
    vendeur_id: number;
    vendeur?: Vendeur;
    detail_b_l_s?: DetailBL[]; // Primary property name from Laravel
    detailBLs?: DetailBL[]; // Support both formats
}

interface Client {
    id: number;
    nom_complet: string;
    numero_tel: string;
    adresse: string;
    created_at: string;
    updated_at: string;
    bon_livraisons?: BonLivraison[];
    bonLivraisons?: BonLivraison[]; // Support both formats
}

interface ClientShowProps {
    client: Client;
}

export default function ClientShow({ client }: ClientShowProps) {
    const { t, locale } = useTranslation();

    const calculateTotal = (details: DetailBL[] = []) => {
        if (!details || !Array.isArray(details)) return 0;
        return details.reduce((sum, detail) => sum + (detail.qte * detail.prix), 0);
    };

    // Get Bon Livraisons - support both snake_case and camelCase
    const bonLivraisons = client.bonLivraisons || client.bon_livraisons || [];
    
    // Debug: Log the data structure
    console.log('Client:', client);
    console.log('Bon Livraisons:', bonLivraisons);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('client_details')}
                </h2>
            }
        >
            <Head title={`${t('client_details')} - ${client.nom_complet}`} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <Link href="/clients">
                            <Button variant="ghost" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {t('back_to_clients')}
                            </Button>
                        </Link>
                    </div>

                    {/* Client Information Card */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>{t('client_information')}</CardTitle>
                            <CardDescription>{t('client_information_description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {t('nom_complet')}
                                        </p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {client.nom_complet}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {t('numero_tel')}
                                        </p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {client.numero_tel}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 md:col-span-2">
                                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            {t('adresse')}
                                        </p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            {client.adresse}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bon Livraisons History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('client_purchase_history')}</CardTitle>
                            <CardDescription>{t('client_purchase_history_description')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bonLivraisons && Array.isArray(bonLivraisons) && bonLivraisons.length > 0 ? (
                                <div className="space-y-6">
                                    {bonLivraisons.map((bonLivraison) => (
                                        <div
                                            key={bonLivraison.id}
                                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                                                <div>
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {t('numero_bl')}: {bonLivraison.numero_bl}
                                                    </h4>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                {t('date_bl')}: {new Date(bonLivraison.date_bl).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        {bonLivraison.vendeur && (
                                                            <div className="flex items-center gap-2">
                                                                <User className="h-4 w-4" />
                                                                <span>
                                                                    {t('vendeur')}: {bonLivraison.vendeur.user?.name || `Vendeur #${bonLivraison.vendeur.numero_post}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`text-lg font-bold text-indigo-600 dark:text-indigo-400 ${locale === 'ar' ? 'text-left' : 'text-right'}`}>
                                                    {t('total')}: {(() => {
                                                        const details = (bonLivraison as any).detail_b_l_s || 
                                                                       (bonLivraison as any).detail_b_ls || 
                                                                       bonLivraison.detailBLs || 
                                                                       [];
                                                        return calculateTotal(details).toFixed(2);
                                                    })()} MAD
                                                </div>
                                            </div>

                                            {(() => {
                                                // Get details - check all possible property names
                                                // Laravel serializes relationship method names to snake_case
                                                // detailBLs() becomes detail_b_l_s in JSON
                                                const details = (bonLivraison as any).detail_b_l_s || 
                                                               (bonLivraison as any).detail_b_ls || 
                                                               bonLivraison.detailBLs || 
                                                               [];
                                                console.log('Bon Livraison ID:', bonLivraison.id);
                                                console.log('Bon Livraison keys:', Object.keys(bonLivraison));
                                                console.log('Details found:', details);
                                                return details && Array.isArray(details) && details.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className={`min-w-full divide-y divide-gray-200 dark:divide-gray-700 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                                <tr>
                                                                    <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('produit')}
                                                                    </th>
                                                                    <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('description')}
                                                                    </th>
                                                                    <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('quantite')}
                                                                    </th>
                                                                    <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('prix')}
                                                                    </th>
                                                                    <th className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 ${locale === 'ar' ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}>
                                                                        {t('total')}
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                                {details.map((detail) => {
                                                                    // Support both snake_case and camelCase for produit
                                                                    const produit = detail.produit || (detail as any).produit;
                                                                    return (
                                                                        <tr key={detail.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                                            <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-medium text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                                {produit?.reférence || detail.produit_id || '-'}
                                                                            </td>
                                                                            <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                                {produit?.discription || '-'}
                                                                            </td>
                                                                            <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                                {detail.qte}
                                                                            </td>
                                                                            <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm text-gray-500 dark:text-gray-300 ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                                {detail.prix.toFixed(2)} MAD
                                                                            </td>
                                                                            <td className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-sm font-semibold text-gray-900 dark:text-white ${locale === 'ar' ? 'text-right' : 'text-left'}`}>
                                                                                {(detail.qte * detail.prix).toFixed(2)} MAD
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                        {t('no_details_found')}
                                                    </p>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">
                                    {t('no_purchase_history')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

