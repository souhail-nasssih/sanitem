<?php

namespace App\Http\Responses;

use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request): Response
    {
        $user = $request->user();
        
        // Load roles to ensure they're available
        $user->load('roles');
        
        // Redirect based on user role
        if ($user->hasRole('Responsable')) {
            return redirect()->route('responsable.dashboard');
        } elseif ($user->hasRole('Employee')) {
            return redirect()->route('employee.dashboard');
        } elseif ($user->hasRole('Vendeur')) {
            // Check if there's a pending confirmation
            $vendeur = $user->vendeur;
            if ($vendeur) {
                $pendingConfirmation = \App\Models\VendeurEmployeeConfirmation::where('vendeur_id', $vendeur->id)
                    ->where('status', 'pending')
                    ->first();
                
                if ($pendingConfirmation) {
                    return redirect()->route('vendeur.waiting');
                }
            }
            
            // Check if employee is already selected in session
            if (!$request->session()->has('selected_employee_id')) {
                return redirect()->route('vendeur.select-employee');
            }
            return redirect()->route('vendeur.dashboard');
        }
        
        // Default redirect for other roles
        return redirect()->route('dashboard');
    }
}

