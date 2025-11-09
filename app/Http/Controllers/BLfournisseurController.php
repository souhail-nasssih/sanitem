<?php

namespace App\Http\Controllers;

use App\Models\BLfournisseur;
use App\Models\DetailBLfournisseur;
use App\Models\Fournisseur;
use App\Models\Employee;
use App\Models\Produit;
use App\Models\Vendeur;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BLfournisseurController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $blFournisseurs = BLfournisseur::with(['fournisseur', 'employee', 'vendeur.user', 'detailBLFournisseurs'])
            ->latest()
            ->paginate(10);
        
        $fournisseurs = Fournisseur::orderBy('nom_complet')->get();
        $employees = Employee::orderBy('nom_complet')->get();
        $produits = Produit::select('id', 'reférence', 'discription', 'prix_achat', 'qte_stock')->orderBy('reférence')->get();
        
        // Get the next BL number for display in the form
        $nextNumeroBL = BLfournisseur::generateNextNumero();
        
        // Get current user's employee ID
        $currentEmployeeId = null;
        $user = $request->user();
        if ($user) {
            // Load roles
            $user->load('roles');
            
            // Check if user has Employee role or if there's a selected employee in session
            if ($user->hasRole('Employee')) {
                // Find employee by matching user name with employee nom_complet
                $employee = Employee::where('nom_complet', $user->name)->first();
                if ($employee) {
                    $currentEmployeeId = $employee->id;
                }
            } elseif ($request->session()->has('selected_employee_id')) {
                // Use selected employee from session (for Vendeurs)
                $currentEmployeeId = $request->session()->get('selected_employee_id');
            } elseif ($user->hasRole('Responsable')) {
                // For Responsable, find or create an employee record
                $employee = Employee::where('nom_complet', $user->name)->first();
                if (!$employee) {
                    // Create employee record for Responsable
                    $employee = Employee::create([
                        'nom_complet' => $user->name,
                        'cin' => 'RESP-' . $user->id,
                        'adresse' => 'N/A',
                    ]);
                }
                $currentEmployeeId = $employee->id;
            }
        }
        
        return inertia('bl-fournisseurs/index', [
            'blFournisseurs' => $blFournisseurs,
            'fournisseurs' => $fournisseurs,
            'employees' => $employees,
            'produits' => $produits,
            'nextNumeroBL' => $nextNumeroBL,
            'currentEmployeeId' => $currentEmployeeId,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(BLfournisseur $blFournisseur)
    {
        $blFournisseur->load([
            'fournisseur',
            'employee',
            'vendeur.user',
            'detailBLFournisseurs.produit'
        ]);

        // Ensure detailBLFournisseurs is accessible - Inertia may serialize it differently
        $blFournisseurData = $blFournisseur->toArray();
        
        // Also add it explicitly as detailBLFournisseurs for frontend compatibility
        if (isset($blFournisseurData['detail_b_l_fournisseurs'])) {
            $blFournisseurData['detailBLFournisseurs'] = $blFournisseurData['detail_b_l_fournisseurs'];
        }

        return inertia('bl-fournisseurs/show', [
            'blFournisseur' => $blFournisseurData,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        
        // Get employee_id from request or use current user's employee
        $employeeId = $request->input('employee_id');
        
        if (!$employeeId && $user) {
            // Load roles
            $user->load('roles');
            
            // Check if user has Employee role or if there's a selected employee in session
            if ($user->hasRole('Employee')) {
                // Find employee by matching user name with employee nom_complet
                $employee = Employee::where('nom_complet', $user->name)->first();
                if ($employee) {
                    $employeeId = $employee->id;
                }
            } elseif ($request->session()->has('selected_employee_id')) {
                // Use selected employee from session (for Vendeurs)
                $employeeId = $request->session()->get('selected_employee_id');
            } elseif ($user->hasRole('Responsable')) {
                // For Responsable, find or create an employee record
                $employee = Employee::where('nom_complet', $user->name)->first();
                if (!$employee) {
                    // Create employee record for Responsable
                    $employee = Employee::create([
                        'nom_complet' => $user->name,
                        'cin' => 'RESP-' . $user->id,
                        'adresse' => 'N/A',
                    ]);
                }
                $employeeId = $employee->id;
            }
        }

        // Get vendeur_id from current user if available
        $vendeurId = null;
        if ($user) {
            $user->load('vendeur');
            if ($user->vendeur) {
                $vendeurId = $user->vendeur->id;
            } elseif ($user->hasRole('Responsable') || $user->hasRole('Vendeur')) {
                // Create a vendeur record for Responsable or Vendeur if they don't have one
                $vendeur = Vendeur::firstOrCreate(
                    ['user_id' => $user->id],
                    ['numero_post' => $user->name]
                );
                $vendeurId = $vendeur->id;
            }
        }

        $validated = $request->validate([
            'date_bl_fournisseur' => ['required', 'date'],
            'fournisseur_id' => ['required', 'exists:fournisseurs,id'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'vendeur_id' => ['nullable', 'exists:vendeurs,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
            'details.*.discription' => ['required', 'string', 'max:255'],
        ]);

        // Ensure employee_id is set
        if (!$employeeId) {
            return redirect()->back()
                ->withErrors(['employee_id' => 'Employee is required.'])
                ->withInput();
        }

        $validated['employee_id'] = $employeeId;
        
        // Set vendeur_id if available
        if ($vendeurId) {
            $validated['vendeur_id'] = $vendeurId;
        }

        // Use database transaction to ensure atomicity and prevent race conditions
        return \DB::transaction(function () use ($validated) {
            // Generate the next BL number automatically
            $numeroBL = BLfournisseur::generateNextNumero();
            
            // Verify uniqueness (should not happen, but safety check)
            while (BLfournisseur::where('numero_bl', $numeroBL)->exists()) {
                // Extract number and increment
                if (preg_match('/BL(\d+)/', $numeroBL, $matches)) {
                    $number = (int) $matches[1] + 1;
                    $numeroBL = 'BL' . str_pad($number, 5, '0', STR_PAD_LEFT);
                } else {
                    $numeroBL = BLfournisseur::generateNextNumero();
                    break;
                }
            }

            $blFournisseur = BLfournisseur::create([
                'numero_bl' => $numeroBL,
                'date_bl_fournisseur' => $validated['date_bl_fournisseur'],
                'fournisseur_id' => $validated['fournisseur_id'],
                'employee_id' => $validated['employee_id'],
                'vendeur_id' => $validated['vendeur_id'] ?? null,
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
        });
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BLfournisseur $blFournisseur)
    {
        $user = $request->user();
        
        // Get vendeur_id from current user if available
        $vendeurId = null;
        if ($user) {
            $user->load('vendeur');
            if ($user->vendeur) {
                $vendeurId = $user->vendeur->id;
            } elseif ($user->hasRole('Responsable') || $user->hasRole('Vendeur')) {
                // Create a vendeur record for Responsable or Vendeur if they don't have one
                $vendeur = Vendeur::firstOrCreate(
                    ['user_id' => $user->id],
                    ['numero_post' => $user->name]
                );
                $vendeurId = $vendeur->id;
            }
        }

        $validated = $request->validate([
            'numero_bl' => ['required', 'string'],
            'date_bl_fournisseur' => ['required', 'date'],
            'fournisseur_id' => ['required', 'exists:fournisseurs,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'vendeur_id' => ['nullable', 'exists:vendeurs,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.produit_id' => ['required', 'exists:produits,id'],
            'details.*.qte' => ['required', 'numeric', 'min:0.01'],
            'details.*.prix' => ['required', 'numeric', 'min:0'],
            'details.*.discription' => ['required', 'string', 'max:255'],
        ]);

        // Set vendeur_id if available, otherwise preserve existing
        if ($vendeurId) {
            $validated['vendeur_id'] = $vendeurId;
        } elseif (!isset($validated['vendeur_id'])) {
            $validated['vendeur_id'] = $blFournisseur->vendeur_id;
        }

        $blFournisseur->update([
            'numero_bl' => $validated['numero_bl'],
            'date_bl_fournisseur' => $validated['date_bl_fournisseur'],
            'fournisseur_id' => $validated['fournisseur_id'],
            'employee_id' => $validated['employee_id'],
            'vendeur_id' => $validated['vendeur_id'] ?? null,
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

