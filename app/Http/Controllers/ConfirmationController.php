<?php

namespace App\Http\Controllers;

use App\Events\VendeurEmployeeConfirmationApproved;
use App\Events\VendeurEmployeeConfirmationRejected;
use App\Events\VendeurEmployeeConfirmationRequested;
use App\Models\VendeurEmployeeConfirmation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConfirmationController extends Controller
{
    /**
     * Get pending confirmations for Responsable
     */
    public function index(Request $request)
    {
        // Ensure user is Responsable
        if (!$request->user()->hasRole('Responsable')) {
            return redirect()->route('dashboard');
        }

        $confirmations = VendeurEmployeeConfirmation::where('status', 'pending')
            ->with(['vendeur.user', 'employee'])
            ->latest()
            ->get();

        return Inertia::render('responsable/confirmations', [
            'confirmations' => $confirmations,
        ]);
    }

    /**
     * Approve a confirmation request
     */
    public function approve(Request $request, VendeurEmployeeConfirmation $confirmation)
    {
        // Ensure user is Responsable
        if (!$request->user()->hasRole('Responsable')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if already processed
        if ($confirmation->status !== 'pending') {
            return response()->json(['error' => 'Confirmation already processed'], 400);
        }

        $confirmation->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Broadcast approval event
        event(new VendeurEmployeeConfirmationApproved($confirmation));

        return response()->json([
            'success' => true,
            'message' => 'Confirmation approuvée avec succès',
        ]);
    }

    /**
     * Reject a confirmation request
     */
    public function reject(Request $request, VendeurEmployeeConfirmation $confirmation)
    {
        // Ensure user is Responsable
        if (!$request->user()->hasRole('Responsable')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if already processed
        if ($confirmation->status !== 'pending') {
            return response()->json(['error' => 'Confirmation already processed'], 400);
        }

        $confirmation->update([
            'status' => 'rejected',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        // Broadcast rejection event
        event(new VendeurEmployeeConfirmationRejected($confirmation));

        return response()->json([
            'success' => true,
            'message' => 'Confirmation rejetée',
        ]);
    }
}
