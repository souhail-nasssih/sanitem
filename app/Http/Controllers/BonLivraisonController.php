<?php

namespace App\Http\Controllers;

use App\Models\BonLivraison;
use App\Models\DetailBL;
use App\Models\Client;
use App\Models\Vendeur;
use App\Models\Produit;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class BonLivraisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $bonLivraisons = BonLivraison::with(['client', 'vendeur.user', 'detailBLs.produit'])
            ->latest()
            ->paginate(10);

        $clients = Client::orderBy('nom_complet')->get();
        $vendeurs = Vendeur::with('user')->get();
        $produits = Produit::select('id', 'reférence', 'discription', 'prix_vente', 'qte_stock')->orderBy('reférence')->get();

        // Get the next BL number for display in the form
        $nextNumeroBL = BonLivraison::generateNextNumero();

        // Get current user's vendeur ID - create one if user is Responsable or Vendeur
        $currentVendeurId = null;
        $user = $request->user();
        if ($user) {
            // Load roles and vendeur relationship
            $user->load('roles', 'vendeur');

            if ($user->vendeur) {
                // User already has a vendeur record
                $currentVendeurId = $user->vendeur->id;
            } elseif ($user->hasRole('Responsable') || $user->hasRole('Vendeur')) {
                // Create a vendeur record for Responsable or Vendeur if they don't have one
                $vendeur = \App\Models\Vendeur::firstOrCreate(
                    ['user_id' => $user->id],
                    ['numero_post' => $user->name]
                );
                $currentVendeurId = $vendeur->id;
            }
        }

        return inertia('bl-clients/index', [
            'bonLivraisons' => $bonLivraisons,
            'clients' => $clients,
            'vendeurs' => $vendeurs,
            'produits' => $produits,
            'nextNumeroBL' => $nextNumeroBL,
            'currentVendeurId' => $currentVendeurId,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(BonLivraison $bonLivraison)
    {
        $bonLivraison->load([
            'client',
            'vendeur.user',
            'detailBLs.produit'
        ]);

        // Ensure detailBLs is accessible - Inertia may serialize it as detail_b_l_s
        $bonLivraisonData = $bonLivraison->toArray();
        
        // Also add it explicitly as detailBLs for frontend compatibility
        if (isset($bonLivraisonData['detail_b_l_s'])) {
            $bonLivraisonData['detailBLs'] = $bonLivraisonData['detail_b_l_s'];
        }

        return inertia('bl-clients/show', [
            'bonLivraison' => $bonLivraisonData,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Get vendeur_id from request or use/create current user's vendeur
        $vendeurId = $request->input('vendeur_id');

        if (!$vendeurId && $user) {
            // Load roles and vendeur relationship
            $user->load('roles', 'vendeur');

            if ($user->vendeur) {
                // User already has a vendeur record
                $vendeurId = $user->vendeur->id;
            } elseif ($user->hasRole('Responsable') || $user->hasRole('Vendeur')) {
                // Create a vendeur record for Responsable or Vendeur if they don't have one
                $vendeur = \App\Models\Vendeur::firstOrCreate(
                    ['user_id' => $user->id],
                    ['numero_post' => $user->name]
                );
                $vendeurId = $vendeur->id;
            }
        }

        // Get employee_id from session if vendeur has selected an employee
        $employeeId = null;
        if ($request->session()->has('selected_employee_id')) {
            $employeeId = $request->session()->get('selected_employee_id');
        }

        $validated = $request->validate([
            'date_bl' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'vendeur_id' => ['nullable', 'exists:vendeurs,id'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
        ]);

        // Ensure vendeur_id is set
        if (!$vendeurId) {
            return redirect()->back()
                ->withErrors(['vendeur_id' => 'Vendeur is required.'])
                ->withInput();
        }

        $validated['vendeur_id'] = $vendeurId;
        
        // Set employee_id if available from session
        if ($employeeId) {
            $validated['employee_id'] = $employeeId;
        }

        // Use database transaction to ensure atomicity and prevent race conditions
        return \DB::transaction(function () use ($validated) {
            // Generate the next BL number automatically
            $numeroBL = BonLivraison::generateNextNumero();

            // Verify uniqueness (should not happen, but safety check)
            while (BonLivraison::where('numero_bl', $numeroBL)->exists()) {
                // Extract number and increment
                if (preg_match('/BL(\d+)/', $numeroBL, $matches)) {
                    $number = (int) $matches[1] + 1;
                    $numeroBL = 'BL' . str_pad($number, 5, '0', STR_PAD_LEFT);
                } else {
                    $numeroBL = BonLivraison::generateNextNumero();
                    break;
                }
            }

            $bonLivraison = BonLivraison::create([
                'numero_bl' => $numeroBL,
                'date_bl' => $validated['date_bl'],
                'client_id' => $validated['client_id'],
                'vendeur_id' => $validated['vendeur_id'],
                'employee_id' => $validated['employee_id'] ?? null,
            ]);

            foreach ($validated['details'] as $detail) {
                DetailBL::create([
                    'bon_livraison_id' => $bonLivraison->id,
                    'produit_id' => $detail['produit_id'],
                    'qte' => $detail['qte'],
                    'prix' => $detail['prix'],
                ]);

                // Update product stock: decrement the sold quantity
                $produit = Produit::find($detail['produit_id']);
                if ($produit) {
                    $produit->decrement('qte_stock', $detail['qte']);
                }
            }

            return redirect()->route('bl-clients.index')
                ->with('success', 'Bon de Livraison créé avec succès.');
        });
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BonLivraison $bonLivraison)
    {
        // Get employee_id from session if vendeur has selected an employee
        $employeeId = null;
        if ($request->session()->has('selected_employee_id')) {
            $employeeId = $request->session()->get('selected_employee_id');
        }

        $validated = $request->validate([
            'date_bl' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'vendeur_id' => ['required', 'exists:vendeurs,id'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
        ]);

        // Set employee_id if available from session, otherwise keep existing or use from request
        if ($employeeId) {
            $validated['employee_id'] = $employeeId;
        } elseif (!isset($validated['employee_id'])) {
            // Preserve existing employee_id if not provided
            $validated['employee_id'] = $bonLivraison->employee_id;
        }

        // Get existing details before deletion to restore stock
        $existingDetails = $bonLivraison->detailBLs;

        // Restore stock: add back old quantities
        foreach ($existingDetails as $existingDetail) {
            $produit = Produit::find($existingDetail->produit_id);
            if ($produit) {
                $produit->increment('qte_stock', $existingDetail->qte);
            }
        }

        // Do not allow modification of numero_bl - it's auto-generated and immutable
        $bonLivraison->update([
            'date_bl' => $validated['date_bl'],
            'client_id' => $validated['client_id'],
            'vendeur_id' => $validated['vendeur_id'],
            'employee_id' => $validated['employee_id'] ?? null,
        ]);

        // Delete existing details
        $bonLivraison->detailBLs()->delete();

        // Create new details and update stock
        foreach ($validated['details'] as $detail) {
            DetailBL::create([
                'bon_livraison_id' => $bonLivraison->id,
                'produit_id' => $detail['produit_id'],
                'qte' => $detail['qte'],
                'prix' => $detail['prix'],
            ]);

            // Update product stock: decrement the sold quantity
            $produit = Produit::find($detail['produit_id']);
            if ($produit) {
                $produit->decrement('qte_stock', $detail['qte']);
            }
        }

        return redirect()->route('bl-clients.index')
            ->with('success', 'Bon de Livraison mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BonLivraison $bonLivraison)
    {
        // Get details before deletion to restore stock
        $details = $bonLivraison->detailBLs;

        // Restore stock: add back quantities to products
        foreach ($details as $detail) {
            $produit = Produit::find($detail->produit_id);
            if ($produit) {
                $produit->increment('qte_stock', $detail->qte);
            }
        }

        $bonLivraison->delete();

        return redirect()->route('bl-clients.index')
            ->with('success', 'Bon de Livraison supprimé avec succès.');
    }

    /**
     * Download PDF for the specified Bon Livraison
     */
    public function downloadPdf(BonLivraison $bonLivraison)
    {
        $bonLivraison->load([
            'client',
            'vendeur.user',
            'detailBLs.produit'
        ]);

        $pdf = PDF::loadView('pdf.bl-client', [
            'bonLivraison' => $bonLivraison,
        ]);

        return $pdf->download('BL-Client-' . $bonLivraison->numero_bl . '.pdf');
    }
}

