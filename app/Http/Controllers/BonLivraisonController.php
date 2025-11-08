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

        $validated = $request->validate([
            'date_bl' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
            'vendeur_id' => ['nullable', 'exists:vendeurs,id'],
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

