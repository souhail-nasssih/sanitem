<?php

use Illuminate\Support\Facades\Broadcast;
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

// Broadcasting authentication route
Route::middleware(['auth'])->post('/broadcasting/auth', function () {
    return Broadcast::auth(request());
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Responsable dashboard
    Route::middleware(['role:Responsable'])->group(function () {
        Route::get('responsable/dashboard', [App\Http\Controllers\ResponsableController::class, 'dashboard'])->name('responsable.dashboard');
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
    Route::get('dashboard', function (\Illuminate\Http\Request $request) {
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
    Route::get('employees/{employee}', [App\Http\Controllers\EmployeeController::class, 'show'])->name('employees.show');
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
    Route::get('bl-fournisseurs/{blFournisseur}', [App\Http\Controllers\BLfournisseurController::class, 'show'])->name('bl-fournisseurs.show');
    Route::get('bl-fournisseurs/{blFournisseur}/download', [App\Http\Controllers\BLfournisseurController::class, 'downloadPdf'])->name('bl-fournisseurs.download');
    Route::post('bl-fournisseurs', [App\Http\Controllers\BLfournisseurController::class, 'store'])->name('bl-fournisseurs.store');
    Route::put('bl-fournisseurs/{blFournisseur}', [App\Http\Controllers\BLfournisseurController::class, 'update'])->name('bl-fournisseurs.update');
    Route::delete('bl-fournisseurs/{blFournisseur}', [App\Http\Controllers\BLfournisseurController::class, 'destroy'])->name('bl-fournisseurs.destroy');

    // BL Clients
    Route::get('bl-clients', [App\Http\Controllers\BonLivraisonController::class, 'index'])->name('bl-clients.index');
    Route::get('bl-clients/{bonLivraison}', [App\Http\Controllers\BonLivraisonController::class, 'show'])->name('bl-clients.show');
    Route::get('bl-clients/{bonLivraison}/download', [App\Http\Controllers\BonLivraisonController::class, 'downloadPdf'])->name('bl-clients.download');
    Route::post('bl-clients', [App\Http\Controllers\BonLivraisonController::class, 'store'])->name('bl-clients.store');
    Route::put('bl-clients/{bonLivraison}', [App\Http\Controllers\BonLivraisonController::class, 'update'])->name('bl-clients.update');
    Route::delete('bl-clients/{bonLivraison}', [App\Http\Controllers\BonLivraisonController::class, 'destroy'])->name('bl-clients.destroy');

    // Poubelle (Trash)
    Route::get('trash', function () {
        return Inertia::render('trash/index');
    })->name('trash.index');
});

require __DIR__.'/settings.php';

// Notification API endpoints
Route::middleware(['auth', 'verified'])->prefix('api')->group(function () {
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('notifications/check-due-dates', [App\Http\Controllers\NotificationController::class, 'checkDueDates']);
    Route::post('notifications/{notification}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{notification}', [App\Http\Controllers\NotificationController::class, 'destroy']);
});
