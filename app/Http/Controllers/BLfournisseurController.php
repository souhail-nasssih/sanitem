<?php

namespace App\Http\Controllers;

use App\Models\BLfournisseur;
use App\Models\DetailBLfournisseur;
use App\Models\Fournisseur;
use App\Models\Employee;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BLfournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $blFournisseurs = BLfournisseur::with(['fournisseur', 'employee', 'detailBLFournisseurs'])
            ->latest()
            ->paginate(10);
        
        $fournisseurs = Fournisseur::orderBy('nom_complet')->get();
        $employees = Employee::orderBy('nom_complet')->get();
        $produits = Produit::select('id', 'reférence', 'discription', 'prix_achat')->orderBy('reférence')->get();
        
        return inertia('bl-fournisseurs/index', [
            'blFournisseurs' => $blFournisseurs,
            'fournisseurs' => $fournisseurs,
            'employees' => $employees,
            'produits' => $produits,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'numero_bl' => ['required', 'integer', 'min:1'],
            'date_bl_fournisseur' => ['required', 'date'],
            'fournisseur_id' => ['required', 'exists:fournisseurs,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
            'details.*.discription' => ['required', 'string', 'max:255'],
        ]);

        $blFournisseur = BLfournisseur::create([
            'numero_bl' => $validated['numero_bl'],
            'date_bl_fournisseur' => $validated['date_bl_fournisseur'],
            'fournisseur_id' => $validated['fournisseur_id'],
            'employee_id' => $validated['employee_id'],
        ]);

        foreach ($validated['details'] as $detail) {
            DetailBLfournisseur::create([
                'bl_fournisseur_id' => $blFournisseur->id,
                'produit_id' => $detail['produit_id'],
                'qte' => $detail['qte'],
                'prix' => $detail['prix'],
                'discription' => $detail['discription'],
            ]);

            // Update product stock: add the purchased quantity
            $produit = Produit::find($detail['produit_id']);
            if ($produit) {
                $produit->increment('qte_stock', $detail['qte']);
            }
        }

        return redirect()->route('bl-fournisseurs.index')
            ->with('success', 'BL Fournisseur créé avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BLfournisseur $blFournisseur)
    {
        $validated = $request->validate([
            'numero_bl' => ['required', 'integer', 'min:1'],
            'date_bl_fournisseur' => ['required', 'date'],
            'fournisseur_id' => ['required', 'exists:fournisseurs,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
            'details.*.discription' => ['required', 'string', 'max:255'],
        ]);

        $blFournisseur->update([
            'numero_bl' => $validated['numero_bl'],
            'date_bl_fournisseur' => $validated['date_bl_fournisseur'],
            'fournisseur_id' => $validated['fournisseur_id'],
            'employee_id' => $validated['employee_id'],
        ]);

        // Get existing details before deletion to restore stock
        $existingDetails = $blFournisseur->detailBLFournisseurs;

        // Restore stock: subtract old quantities
        foreach ($existingDetails as $existingDetail) {
            $produit = Produit::find($existingDetail->produit_id);
            if ($produit) {
                $produit->decrement('qte_stock', $existingDetail->qte);
            }
        }

        // Delete existing details
        $blFournisseur->detailBLFournisseurs()->delete();

        // Create new details and update stock
        foreach ($validated['details'] as $detail) {
            DetailBLfournisseur::create([
                'bl_fournisseur_id' => $blFournisseur->id,
                'produit_id' => $detail['produit_id'],
                'qte' => $detail['qte'],
                'prix' => $detail['prix'],
                'discription' => $detail['discription'],
            ]);

            // Update product stock: add the new purchased quantity
            $produit = Produit::find($detail['produit_id']);
            if ($produit) {
                $produit->increment('qte_stock', $detail['qte']);
            }
        }

        return redirect()->route('bl-fournisseurs.index')
            ->with('success', 'BL Fournisseur mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BLfournisseur $blFournisseur)
    {
        // Get details before deletion to restore stock
        $details = $blFournisseur->detailBLFournisseurs;

        // Restore stock: subtract quantities from products
        foreach ($details as $detail) {
            $produit = Produit::find($detail->produit_id);
            if ($produit) {
                $produit->decrement('qte_stock', $detail->qte);
            }
        }

        $blFournisseur->delete();

        return redirect()->route('bl-fournisseurs.index')
            ->with('success', 'BL Fournisseur supprimé avec succès.');
    }
}

