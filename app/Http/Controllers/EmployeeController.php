<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\BonLivraison;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $employees = Employee::latest()->paginate(10);

        return inertia('employees/index', [
            'employees' => $employees,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        $employee->load([
            'blFournisseurs' => function ($query) {
                $query->orderBy('date_bl_fournisseur', 'desc')
                      ->orderBy('numero_bl', 'desc');
            },
            'blFournisseurs.fournisseur',
            'blFournisseurs.employee',
            'blFournisseurs.vendeur.user',
            'blFournisseurs.detailBLFournisseurs' => function ($query) {
                $query->orderBy('id');
            },
            'blFournisseurs.detailBLFournisseurs.produit'
        ]);

        // Get BL clients directly linked to the employee via employee_id
        $blClients = $employee->bonLivraisons()
            ->with([
                'client',
                'vendeur.user',
                'detailBLs' => function ($query) {
                    $query->orderBy('id');
                },
                'detailBLs.produit'
            ])
            ->orderBy('date_bl', 'desc')
            ->orderBy('numero_bl', 'desc')
            ->get();

        return inertia('employees/show', [
            'employee' => $employee,
            'blClients' => $blClients,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_complet' => ['required', 'string', 'max:255'],
            'cin' => ['required', 'string', 'max:255', 'unique:employees,cin'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        Employee::create($validated);

        return redirect()->route('employees.index')
            ->with('success', 'Employee créé avec succès.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'nom_complet' => ['required', 'string', 'max:255'],
            'cin' => ['required', 'string', 'max:255', \Illuminate\Validation\Rule::unique('employees')->ignore($employee->id)],
            'type' => ['required', 'string', 'max:255'],
            'adresse' => ['required', 'string', 'max:255'],
        ]);

        $employee->update($validated);

        return redirect()->route('employees.index')
            ->with('success', 'Employee mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        $employee->delete();

        return redirect()->route('employees.index')
            ->with('success', 'Employee supprimé avec succès.');
    }
}
