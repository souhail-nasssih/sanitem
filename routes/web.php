<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Language switching route
Route::post('language/{locale}', [App\Http\Controllers\LanguageController::class, 'switch'])->name('language.switch');

Route::middleware(['auth', 'verified'])->group(function () {
    // Responsable dashboard
    Route::middleware(['role:Responsable'])->group(function () {
        Route::get('responsable/dashboard', function () {
            return Inertia::render('responsable/dashboard');
        })->name('responsable.dashboard');
    });

    // Employee dashboard
    Route::middleware(['role:Employee'])->group(function () {
        Route::get('employee/dashboard', function () {
            return Inertia::render('employee/dashboard');
        })->name('employee.dashboard');
    });

    // Vendeur routes
    Route::middleware(['role:Vendeur'])->group(function () {
        Route::get('vendeur/select-employee', [App\Http\Controllers\VendeurController::class, 'selectEmployee'])->name('vendeur.select-employee');
        Route::post('vendeur/select-employee', [App\Http\Controllers\VendeurController::class, 'storeSelectedEmployee'])->name('vendeur.store-selected-employee');
        Route::get('vendeur/waiting', [App\Http\Controllers\VendeurController::class, 'waiting'])->name('vendeur.waiting');
        Route::get('vendeur/dashboard', [App\Http\Controllers\VendeurController::class, 'dashboard'])->name('vendeur.dashboard');
        Route::post('vendeur/clear-employee', [App\Http\Controllers\VendeurController::class, 'clearSelectedEmployee'])->name('vendeur.clear-employee');
    });

    // Confirmation routes for Responsable
    Route::middleware(['role:Responsable'])->group(function () {
        Route::get('responsable/confirmations', [App\Http\Controllers\ConfirmationController::class, 'index'])->name('responsable.confirmations');
        Route::post('confirmations/{confirmation}/approve', [App\Http\Controllers\ConfirmationController::class, 'approve'])->name('confirmations.approve');
        Route::post('confirmations/{confirmation}/reject', [App\Http\Controllers\ConfirmationController::class, 'reject'])->name('confirmations.reject');
    });

    // Dashboard - redirect based on role
    Route::get('dashboard', function () {
        $user = auth()->user();
        $user->load('roles');
        
        if ($user->hasRole('Responsable')) {
            return redirect()->route('responsable.dashboard');
        } elseif ($user->hasRole('Employee')) {
            return redirect()->route('employee.dashboard');
        } elseif ($user->hasRole('Vendeur')) {
            // Check if employee is already selected in session
            if (!$request->session()->has('selected_employee_id')) {
                return redirect()->route('vendeur.select-employee');
            }
            return redirect()->route('vendeur.dashboard');
        }
        
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Produits
    Route::get('produits', [App\Http\Controllers\ProduitController::class, 'index'])->name('produits.index');
    Route::post('produits', [App\Http\Controllers\ProduitController::class, 'store'])->name('produits.store');
    Route::put('produits/{produit}', [App\Http\Controllers\ProduitController::class, 'update'])->name('produits.update');
    Route::delete('produits/{produit}', [App\Http\Controllers\ProduitController::class, 'destroy'])->name('produits.destroy');

    // Employees
    Route::get('employees', [App\Http\Controllers\EmployeeController::class, 'index'])->name('employees.index');
    Route::post('employees', [App\Http\Controllers\EmployeeController::class, 'store'])->name('employees.store');
    Route::put('employees/{employee}', [App\Http\Controllers\EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('employees/{employee}', [App\Http\Controllers\EmployeeController::class, 'destroy'])->name('employees.destroy');

    // Fournisseurs
    Route::get('fournisseurs', [App\Http\Controllers\FournisseurController::class, 'index'])->name('fournisseurs.index');
    Route::post('fournisseurs', [App\Http\Controllers\FournisseurController::class, 'store'])->name('fournisseurs.store');
    Route::get('fournisseurs/{fournisseur}', [App\Http\Controllers\FournisseurController::class, 'show'])->name('fournisseurs.show');
    Route::put('fournisseurs/{fournisseur}', [App\Http\Controllers\FournisseurController::class, 'update'])->name('fournisseurs.update');
    Route::delete('fournisseurs/{fournisseur}', [App\Http\Controllers\FournisseurController::class, 'destroy'])->name('fournisseurs.destroy');

    // Clients
    Route::get('clients', [App\Http\Controllers\ClientController::class, 'index'])->name('clients.index');
    Route::post('clients', [App\Http\Controllers\ClientController::class, 'store'])->name('clients.store');
    Route::get('clients/{client}', [App\Http\Controllers\ClientController::class, 'show'])->name('clients.show');
    Route::put('clients/{client}', [App\Http\Controllers\ClientController::class, 'update'])->name('clients.update');
    Route::delete('clients/{client}', [App\Http\Controllers\ClientController::class, 'destroy'])->name('clients.destroy');

    // BL Fournisseurs
    Route::get('bl-fournisseurs', [App\Http\Controllers\BLfournisseurController::class, 'index'])->name('bl-fournisseurs.index');
    Route::post('bl-fournisseurs', [App\Http\Controllers\BLfournisseurController::class, 'store'])->name('bl-fournisseurs.store');
    Route::put('bl-fournisseurs/{blFournisseur}', [App\Http\Controllers\BLfournisseurController::class, 'update'])->name('bl-fournisseurs.update');
    Route::delete('bl-fournisseurs/{blFournisseur}', [App\Http\Controllers\BLfournisseurController::class, 'destroy'])->name('bl-fournisseurs.destroy');

    // BL Clients
    Route::get('bl-clients', [App\Http\Controllers\BonLivraisonController::class, 'index'])->name('bl-clients.index');
    Route::post('bl-clients', [App\Http\Controllers\BonLivraisonController::class, 'store'])->name('bl-clients.store');
    Route::put('bl-clients/{bonLivraison}', [App\Http\Controllers\BonLivraisonController::class, 'update'])->name('bl-clients.update');
    Route::delete('bl-clients/{bonLivraison}', [App\Http\Controllers\BonLivraisonController::class, 'destroy'])->name('bl-clients.destroy');

    // Poubelle (Trash)
    Route::get('trash', function () {
        return Inertia::render('trash/index');
    })->name('trash.index');
});

require __DIR__.'/settings.php';

// Temporary API endpoints for NotificationCenter (prevent 404s)
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('notifications', function () {
        return response()->json([
            'data' => [],
        ]);
    });

    Route::get('notifications/unread-count', function () {
        return response()->json([
            'count' => 0,
        ]);
    });

    Route::post('notifications/check-due-dates', function () {
        return response()->json(['success' => true]);
    });

    Route::post('notifications/{notification}/read', function () {
        return response()->json(['success' => true]);
    });

    Route::post('notifications/read-all', function () {
        return response()->json(['success' => true]);
    });

    Route::delete('notifications/{notification}', function () {
        return response()->json(['success' => true]);
    });
});
