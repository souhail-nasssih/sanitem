<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $fournisseurs = Fournisseur::latest()->paginate(10);
        
        return inertia('fournisseurs/index', [
            'fournisseurs' => $fournisseurs,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Fournisseur $fournisseur)
    {
        $fournisseur->load([
            'blFournisseurs' => function ($query) {
                $query->orderBy('date_bl_fournisseur', 'desc')
                      ->orderBy('numero_bl', 'desc');
            },
            'blFournisseurs.employee',
            'blFournisseurs.detailBLFournisseurs' => function ($query) {
                $query->orderBy('id');
            },
            'blFournisseurs.detailBLFournisseurs.produit'
        ]);
        
        return inertia('fournisseurs/show', [
            'fournisseur' => $fournisseur,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_complet' => ['required', 'string', 'max:255'],
            'numero_tel' => ['required', 'string', 'max:255'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        $fournisseur = Fournisseur::create($validated);

        // If request is from Inertia, return redirect back with fournisseur data
        if ($request->header('X-Inertia')) {
            return back()->with([
                'success' => 'Fournisseur créé avec succès.',
                'created_fournisseur' => $fournisseur,
            ]);
        }

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur créé avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Fournisseur $fournisseur)
    {
        $validated = $request->validate([
            'nom_complet' => ['required', 'string', 'max:255'],
            'numero_tel' => ['required', 'string', 'max:255'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        $fournisseur->update($validated);

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Fournisseur $fournisseur)
    {
        $fournisseur->delete();

        return redirect()->route('fournisseurs.index')
            ->with('success', 'Fournisseur supprimé avec succès.');
    }
}

