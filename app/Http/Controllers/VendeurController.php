<?php

namespace App\Http\Controllers;

use App\Events\VendeurEmployeeConfirmationRequested;
use App\Events\NotificationCreated;
use App\Models\Employee;
use App\Models\VendeurEmployeeConfirmation;
use App\Models\User;
use App\Notifications\LoginRequestNotification;
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
     * Store selected employee and create confirmation request
     */
    public function storeSelectedEmployee(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'cin' => ['required', 'string'],
        ]);

        // Get the employee to verify CIN
        $employee = Employee::findOrFail($validated['employee_id']);

        // Validate CIN matches
        if ($validated['cin'] !== $employee->cin) {
            return redirect()->back()
                ->withErrors(['cin' => 'Le CIN saisi ne correspond pas à l\'employee sélectionné.'])
                ->withInput();
        }

        // Get the vendeur for the current user
        $vendeur = $request->user()->vendeur;
        
        if (!$vendeur) {
            return redirect()->back()
                ->with('error', 'Vendeur non trouvé.');
        }

        // Check if there's already a pending confirmation
        $existingConfirmation = VendeurEmployeeConfirmation::where('vendeur_id', $vendeur->id)
            ->where('status', 'pending')
            ->first();

        if ($existingConfirmation) {
            return redirect()->back()
                ->with('error', 'Une demande de confirmation est déjà en attente.');
        }

        // Create confirmation request
        $confirmation = VendeurEmployeeConfirmation::create([
            'vendeur_id' => $vendeur->id,
            'employee_id' => $validated['employee_id'],
            'status' => 'pending',
        ]);

        // Broadcast the confirmation request event
        event(new VendeurEmployeeConfirmationRequested($confirmation));

        // Send notification to all Responsables
        $responsables = User::role('Responsable')->get();
        foreach ($responsables as $responsable) {
            $notification = $responsable->notify(new LoginRequestNotification($confirmation, 'vendeur', $vendeur->user->name));
            // Get the database notification that was just created
            $dbNotification = $responsable->notifications()->latest()->first();
            if ($dbNotification) {
                event(new NotificationCreated($dbNotification, $responsable->id));
            }
        }

        return redirect()->route('vendeur.waiting')
            ->with('success', 'Demande de confirmation envoyée. En attente de l\'approbation du Responsable.');
    }

    /**
     * Show waiting page for confirmation
     */
    public function waiting(Request $request)
    {
        // Ensure user is Vendeur
        if (!$request->user()->hasRole('Vendeur')) {
            return redirect()->route('dashboard');
        }

        $vendeur = $request->user()->vendeur;
        
        if (!$vendeur) {
            return redirect()->route('vendeur.select-employee');
        }

        $confirmation = VendeurEmployeeConfirmation::where('vendeur_id', $vendeur->id)
            ->where('status', 'pending')
            ->with(['employee'])
            ->latest()
            ->first();

        if (!$confirmation) {
            // Check if there's an approved confirmation
            $approvedConfirmation = VendeurEmployeeConfirmation::where('vendeur_id', $vendeur->id)
                ->where('status', 'approved')
                ->with(['employee'])
                ->latest()
                ->first();

            if ($approvedConfirmation) {
                // Store in session and redirect to dashboard
                $request->session()->put('selected_employee_id', $approvedConfirmation->employee_id);
                $request->session()->put('selected_employee', $approvedConfirmation->employee);
                return redirect()->route('vendeur.dashboard');
            }

            return redirect()->route('vendeur.select-employee');
        }
        
        return Inertia::render('vendeur/waiting', [
            'confirmation' => $confirmation,
        ]);
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

        // Check if employee is selected in session
        if (!$request->session()->has('selected_employee_id')) {
            // Check for approved confirmation
            $vendeur = $request->user()->vendeur;
            if ($vendeur) {
                $approvedConfirmation = VendeurEmployeeConfirmation::where('vendeur_id', $vendeur->id)
                    ->where('status', 'approved')
                    ->with(['employee'])
                    ->latest()
                    ->first();

                if ($approvedConfirmation) {
                    $request->session()->put('selected_employee_id', $approvedConfirmation->employee_id);
                    $request->session()->put('selected_employee', $approvedConfirmation->employee);
                } else {
                    return redirect()->route('vendeur.select-employee');
                }
            } else {
                return redirect()->route('vendeur.select-employee');
            }
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
