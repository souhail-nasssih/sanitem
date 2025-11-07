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
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_complet' => ['required', 'string', 'max:255'],
            'numero_tel' => ['required', 'string', 'max:255'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        Fournisseur::create($validated);

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

