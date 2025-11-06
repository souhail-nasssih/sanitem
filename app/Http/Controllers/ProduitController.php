<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProduitController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $produits = Produit::latest()->paginate(10);
        
        return inertia('produits/index', [
            'produits' => $produits,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reférence' => ['required', 'string', 'max:255', 'unique:produits,reférence'],
            'discription' => ['required', 'string', 'max:255'],
            'unite' => ['required', 'string', 'max:50'],
            'qte_stock' => ['required', 'numeric', 'min:0'],
            'prix_achat' => ['required', 'numeric', 'min:0'],
            'prix_vente' => ['required', 'numeric', 'min:0'],
        ]);

        Produit::create($validated);

        return redirect()->route('produits.index')
            ->with('success', 'Produit créé avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Produit $produit)
    {
        $validated = $request->validate([
            'reférence' => ['required', 'string', 'max:255', Rule::unique('produits')->ignore($produit->id)],
            'discription' => ['required', 'string', 'max:255'],
            'unite' => ['required', 'string', 'max:50'],
            'qte_stock' => ['required', 'numeric', 'min:0'],
            'prix_achat' => ['required', 'numeric', 'min:0'],
            'prix_vente' => ['required', 'numeric', 'min:0'],
        ]);

        $produit->update($validated);

        return redirect()->route('produits.index')
            ->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Produit $produit)
    {
        $produit->delete();

        return redirect()->route('produits.index')
            ->with('success', 'Produit supprimé avec succès.');
    }
}
