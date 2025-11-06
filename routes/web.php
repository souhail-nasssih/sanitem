<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

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

    // Default dashboard (for backward compatibility)
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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
