<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendeurController extends Controller
{
    /**
     * Show employee selection page for Vendeur
     */
    public function selectEmployee(Request $request)
    {
        // Ensure user is Vendeur
        if (!$request->user()->hasRole('Vendeur')) {
            return redirect()->route('dashboard');
        }

        $employees = Employee::latest()->get();
        
        return Inertia::render('vendeur/select-employee', [
            'employees' => $employees,
        ]);
    }

    /**
     * Store selected employee in session
     */
    public function storeSelectedEmployee(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
        ]);

        // Store selected employee in session
        $request->session()->put('selected_employee_id', $validated['employee_id']);
        $request->session()->put('selected_employee', Employee::find($validated['employee_id']));

        return redirect()->route('vendeur.dashboard')
            ->with('success', 'Employee sélectionné avec succès.');
    }

    /**
     * Show vendeur dashboard with selected employee
     */
    public function dashboard(Request $request)
    {
        // Ensure user is Vendeur
        if (!$request->user()->hasRole('Vendeur')) {
            return redirect()->route('dashboard');
        }

        // Check if employee is selected
        if (!$request->session()->has('selected_employee_id')) {
            return redirect()->route('vendeur.select-employee');
        }

        $selectedEmployee = $request->session()->get('selected_employee');
        
        return Inertia::render('vendeur/dashboard', [
            'selectedEmployee' => $selectedEmployee,
        ]);
    }

    /**
     * Clear selected employee from session
     */
    public function clearSelectedEmployee(Request $request)
    {
        $request->session()->forget('selected_employee_id');
        $request->session()->forget('selected_employee');

        return redirect()->route('vendeur.select-employee')
            ->with('success', 'Employee désélectionné.');
    }
}
