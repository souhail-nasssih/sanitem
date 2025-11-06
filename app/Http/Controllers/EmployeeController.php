<?php

namespace App\Http\Controllers;

use App\Models\Employee;
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
