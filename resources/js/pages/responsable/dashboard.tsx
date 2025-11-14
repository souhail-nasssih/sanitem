import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTranslation } from '@/hooks/useTranslation';
import { Users, Package, Truck, ClipboardCheck, ClipboardList, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface Stats {
    totalClients: number;
    totalFournisseurs: number;
    totalEmployees: number;
    totalProduits: number;
    totalBLClients: number;
    totalBLFournisseurs: number;
    pendingConfirmations: number;
    totalSalesValue: number;
    totalPurchaseValue: number;
    thisMonthBLClients: number;
    thisMonthBLFournisseurs: number;
    thisMonthSalesValue: number;
    thisMonthPurchaseValue: number;
}

interface LowStockProduct {
    id: number;
    reférence: string;
    discription: string;
    qte_stock: number;
}

interface RecentBLClient {
    id: number;
    numero_bl: string;
    date_bl: string;
    client?: { nom_complet: string };
    vendeur?: { user?: { name: string } };
}

interface RecentBLFournisseur {
    id: number;
    numero_bl: string;
    date_bl_fournisseur: string;
    fournisseur?: { nom_complet: string };
    employee?: { nom_complet: string };
}

interface ResponsableDashboardProps {
    stats: Stats;
    lowStockProducts: LowStockProduct[];
    recentBLClients: RecentBLClient[];
    recentBLFournisseurs: RecentBLFournisseur[];
}

export default function ResponsableDashboard({ stats, lowStockProducts, recentBLClients, recentBLFournisseurs }: ResponsableDashboardProps) {
    const { t, locale } = useTranslation();
    
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR', {
            style: 'currency',
            currency: 'MAD'
        }).format(amount);
    };

    const formatNumber = (number: number) => {
        return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'fr-FR').format(number);
    };

    const netProfit = stats.totalSalesValue - stats.totalPurchaseValue;
    
    return (
        <AuthenticatedLayout 
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    {t('dashboard_responsable')}
                </h2>
            }
        >
            <Head title={t('dashboard_responsable')} />

            <div className="py-4 sm:py-6 md:py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    {/* Main Statistics Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
                        {/* Total Clients */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('clients')}</h3>
                                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stats.totalClients)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('total_clients')}
                            </p>
                        </div>

                        {/* Total Fournisseurs */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('fournisseurs')}</h3>
                                <Truck className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stats.totalFournisseurs)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('total_suppliers')}
                            </p>
                        </div>

                        {/* Total Employees */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('employees')}</h3>
                                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stats.totalEmployees)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('total_employees')}
                            </p>
                        </div>

                        {/* Total Produits */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('produits')}</h3>
                                <Package className="h-6 w-6 text-blue-600 dark:text-indigo-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stats.totalProduits)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('total_products')}
                            </p>
                        </div>
                    </div>

                    {/* Financial Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
                        {/* Total Sales Value */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('total_sales')}</h3>
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(stats.totalSalesValue)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('from_bl_clients')}
                            </p>
                        </div>

                        {/* Total Purchase Value */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('total_purchases')}</h3>
                                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                                {formatCurrency(stats.totalPurchaseValue)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('from_bl_suppliers')}
                            </p>
                        </div>

                        {/* Net Profit */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('net_profit')}</h3>
                                <TrendingUp className={`h-6 w-6 ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                            </div>
                            <p className={`mt-2 text-2xl sm:text-3xl font-bold ${netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(netProfit)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('sales_minus_purchases')}
                            </p>
                        </div>

                        {/* This Month Sales */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('this_month_sales')}</h3>
                                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(stats.thisMonthSalesValue)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {formatNumber(stats.thisMonthBLClients)} {t('bl_clients')}
                            </p>
                        </div>
                    </div>

                    {/* Activity Statistics */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
                        {/* Total BL Clients */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('bl_clients')}</h3>
                                <ClipboardCheck className="h-6 w-6 text-blue-600 dark:text-indigo-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stats.totalBLClients)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('total_delivery_notes')}
                            </p>
                        </div>

                        {/* Total BL Fournisseurs */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('bl_fournisseurs')}</h3>
                                <ClipboardList className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                {formatNumber(stats.totalBLFournisseurs)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {t('total_supplier_delivery_notes')}
                            </p>
                        </div>

                        {/* Pending Confirmations */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">{t('pending_confirmations')}</h3>
                                <CheckCircle2 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="mt-2 text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {formatNumber(stats.pendingConfirmations)}
                            </p>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                {stats.pendingConfirmations > 0 ? (
                                    <Link href="/responsable/confirmations" className="text-yellow-600 dark:text-yellow-400 hover:underline">
                                        {t('view_confirmations')}
                                    </Link>
                                ) : (
                                    t('no_pending_confirmations')
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Alerts and Recent Activity */}
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 mb-6 sm:mb-8">
                        {/* Low Stock Products */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('low_stock_products')}</h3>
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            {lowStockProducts && lowStockProducts.length > 0 ? (
                                <div className="space-y-3">
                                    {lowStockProducts.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{product.reférence}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{product.discription}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600 dark:text-red-400">{formatNumber(product.qte_stock)}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{t('in_stock')}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <Link href="/produits" className="block text-center text-sm text-blue-600 dark:text-indigo-400 hover:underline mt-4">
                                        {t('view_all_products')}
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t('no_low_stock_products')}</p>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recent_activity')}</h3>
                                <Calendar className="h-6 w-6 text-blue-600 dark:text-indigo-400" />
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('recent_bl_clients')}</h4>
                                    {recentBLClients && recentBLClients.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentBLClients.map((bl) => (
                                                <div key={bl.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                                                    <p className="font-medium text-gray-900 dark:text-white">{bl.numero_bl}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {bl.client?.nom_complet} - {new Date(bl.date_bl).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_recent_activity')}</p>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('recent_bl_suppliers')}</h4>
                                    {recentBLFournisseurs && recentBLFournisseurs.length > 0 ? (
                                        <div className="space-y-2">
                                            {recentBLFournisseurs.map((bl) => (
                                                <div key={bl.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                                                    <p className="font-medium text-gray-900 dark:text-white">{bl.numero_bl}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {bl.fournisseur?.nom_complet} - {new Date(bl.date_bl_fournisseur).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">{t('no_recent_activity')}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
