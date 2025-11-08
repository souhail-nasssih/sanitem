<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::latest()->paginate(10);
        
        return inertia('clients/index', [
            'clients' => $clients,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $client->load([
            'bonLivraisons' => function ($query) {
                $query->orderBy('date_bl', 'desc')
                      ->orderBy('numero_bl', 'desc');
            },
            'bonLivraisons.vendeur.user',
            'bonLivraisons.detailBLs' => function ($query) {
                $query->orderBy('id');
            },
            'bonLivraisons.detailBLs.produit'
        ]);
        
        return inertia('clients/show', [
            'client' => $client,
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

        $client = Client::create($validated);

        // If request is from Inertia, return redirect back with client data
        if ($request->header('X-Inertia')) {
            return back()->with([
                'success' => 'Client créé avec succès.',
                'created_client' => $client,
            ]);
        }

        return redirect()->route('clients.index')
            ->with('success', 'Client créé avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'nom_complet' => ['required', 'string', 'max:255'],
            'numero_tel' => ['required', 'string', 'max:255'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        $client->update($validated);

        return redirect()->route('clients.index')
            ->with('success', 'Client mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return redirect()->route('clients.index')
            ->with('success', 'Client supprimé avec succès.');
    }
}

