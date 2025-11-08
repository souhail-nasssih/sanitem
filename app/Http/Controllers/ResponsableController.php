<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Fournisseur;
use App\Models\Employee;
use App\Models\Produit;
use App\Models\BonLivraison;
use App\Models\BLfournisseur;
use App\Models\VendeurEmployeeConfirmation;
use App\Models\DetailBL;
use App\Models\DetailBLfournisseur;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ResponsableController extends Controller
{
    /**
     * Display the responsable dashboard with statistics.
     */
    public function dashboard()
    {
        // Basic counts
        $totalClients = Client::count();
        $totalFournisseurs = Fournisseur::count();
        $totalEmployees = Employee::count();
        $totalProduits = Produit::count();
        $totalBLClients = BonLivraison::count();
        $totalBLFournisseurs = BLfournisseur::count();
        $pendingConfirmations = VendeurEmployeeConfirmation::where('status', 'pending')->count();

        // Calculate total sales value (from BL Clients)
        $totalSalesValue = DetailBL::selectRaw('SUM(qte * prix) as total')
            ->value('total') ?? 0;

        // Calculate total purchase value (from BL Fournisseurs)
        $totalPurchaseValue = DetailBLfournisseur::selectRaw('SUM(qte * prix) as total')
            ->value('total') ?? 0;

        // Products with low stock (assuming threshold of 10 or less)
        $lowStockProducts = Produit::where('qte_stock', '<=', 10)
            ->orderBy('qte_stock', 'asc')
            ->limit(5)
            ->get(['id', 'reférence', 'discription', 'qte_stock']);

        // Recent BL Clients (last 5)
        $recentBLClients = BonLivraison::with(['client', 'vendeur.user'])
            ->latest()
            ->limit(5)
            ->get();

        // Recent BL Fournisseurs (last 5)
        $recentBLFournisseurs = BLfournisseur::with(['fournisseur', 'employee'])
            ->latest()
            ->limit(5)
            ->get();

        // This month's statistics
        $thisMonthBLClients = BonLivraison::whereMonth('date_bl', now()->month)
            ->whereYear('date_bl', now()->year)
            ->count();

        $thisMonthBLFournisseurs = BLfournisseur::whereMonth('date_bl_fournisseur', now()->month)
            ->whereYear('date_bl_fournisseur', now()->year)
            ->count();

        $thisMonthSalesValue = DetailBL::whereHas('bonLivraison', function ($query) {
                $query->whereMonth('date_bl', now()->month)
                      ->whereYear('date_bl', now()->year);
            })
            ->selectRaw('SUM(qte * prix) as total')
            ->value('total') ?? 0;

        $thisMonthPurchaseValue = DetailBLfournisseur::whereHas('blFournisseur', function ($query) {
                $query->whereMonth('date_bl_fournisseur', now()->month)
                      ->whereYear('date_bl_fournisseur', now()->year);
            })
            ->selectRaw('SUM(qte * prix) as total')
            ->value('total') ?? 0;

        return Inertia::render('responsable/dashboard', [
            'stats' => [
                'totalClients' => $totalClients,
                'totalFournisseurs' => $totalFournisseurs,
                'totalEmployees' => $totalEmployees,
                'totalProduits' => $totalProduits,
                'totalBLClients' => $totalBLClients,
                'totalBLFournisseurs' => $totalBLFournisseurs,
                'pendingConfirmations' => $pendingConfirmations,
                'totalSalesValue' => $totalSalesValue,
                'totalPurchaseValue' => $totalPurchaseValue,
                'thisMonthBLClients' => $thisMonthBLClients,
                'thisMonthBLFournisseurs' => $thisMonthBLFournisseurs,
                'thisMonthSalesValue' => $thisMonthSalesValue,
                'thisMonthPurchaseValue' => $thisMonthPurchaseValue,
            ],
            'lowStockProducts' => $lowStockProducts,
            'recentBLClients' => $recentBLClients,
            'recentBLFournisseurs' => $recentBLFournisseurs,
        ]);
    }
}
