<?php

namespace App\Http\Controllers;

use App\Models\BonLivraison;
use App\Models\DetailBL;
use App\Models\Client;
use App\Models\Vendeur;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BonLivraisonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $bonLivraisons = BonLivraison::with(['client', 'vendeur.user', 'detailBLs.produit'])
            ->latest()
            ->paginate(10);
        
        $clients = Client::orderBy('nom_complet')->get();
        $vendeurs = Vendeur::with('user')->get();
        $produits = Produit::select('id', 'reférence', 'discription', 'prix_vente')->orderBy('reférence')->get();
        
        // Get the next BL number for display in the form
        $nextNumeroBL = BonLivraison::generateNextNumero();
        
        return inertia('bl-clients/index', [
            'bonLivraisons' => $bonLivraisons,
            'clients' => $clients,
            'vendeurs' => $vendeurs,
            'produits' => $produits,
            'nextNumeroBL' => $nextNumeroBL,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date_bl' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'vendeur_id' => ['required', 'exists:vendeurs,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
        ]);

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
            ]);

            foreach ($validated['details'] as $detail) {
                DetailBL::create([
                    'bon_livraison_id' => $bonLivraison->id,
                    'produit_id' => $detail['produit_id'],
                    'qte' => $detail['qte'],
                    'prix' => $detail['prix'],
                ]);
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
        $validated = $request->validate([
            'date_bl' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'vendeur_id' => ['required', 'exists:vendeurs,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
        ]);

        // Do not allow modification of numero_bl - it's auto-generated and immutable
        $bonLivraison->update([
            'date_bl' => $validated['date_bl'],
            'client_id' => $validated['client_id'],
            'vendeur_id' => $validated['vendeur_id'],
        ]);

        // Delete existing details
        $bonLivraison->detailBLs()->delete();

        // Create new details
        foreach ($validated['details'] as $detail) {
            DetailBL::create([
                'bon_livraison_id' => $bonLivraison->id,
                'produit_id' => $detail['produit_id'],
                'qte' => $detail['qte'],
                'prix' => $detail['prix'],
            ]);
        }

        return redirect()->route('bl-clients.index')
            ->with('success', 'Bon de Livraison mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BonLivraison $bonLivraison)
    {
        $bonLivraison->delete();

        return redirect()->route('bl-clients.index')
            ->with('success', 'Bon de Livraison supprimé avec succès.');
    }
}

