<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BLfournisseur extends Model
{
    protected $fillable = [
        'numero_bl',
        'date_bl_fournisseur',
        'fournisseur_id',
        'employee_id',
    ];

    /**
     * Generate the next BL number in format BL00001
     */
    public static function generateNextNumero(): string
    {
        // Get the last BL number
        $lastBL = self::orderBy('id', 'desc')->first();
        
        if (!$lastBL || !$lastBL->numero_bl) {
            // If no BL exists, start with BL00001
            return 'BL00001';
        }
        
        // Extract the number part from the last BL number (e.g., "BL00001" -> 1)
        $lastNumero = $lastBL->numero_bl;
        if (preg_match('/BL(\d+)/', $lastNumero, $matches)) {
            $lastNumber = (int) $matches[1];
            $nextNumber = $lastNumber + 1;
        } else {
            // If format is unexpected, start from 1
            $nextNumber = 1;
        }
        
        // Format as BL00001, BL00002, etc. (5 digits)
        return 'BL' . str_pad($nextNumber, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get the fournisseur that owns the BL fournisseur.
     */
    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class);
    }

    /**
     * Get the employee that owns the BL fournisseur.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Get the detail BL fournisseurs for the BL fournisseur.
     */
    public function detailBLFournisseurs(): HasMany
    {
        return $this->hasMany(DetailBLfournisseur::class, 'bl_fournisseur_id');
    }
}
