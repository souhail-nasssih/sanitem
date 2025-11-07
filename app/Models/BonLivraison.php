<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BonLivraison extends Model
{
    protected $fillable = [
        'numero_bl',
        'date_bl',
        'client_id',
        'vendeur_id',
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
     * Get the client that owns the bon livraison.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Get the vendeur that owns the bon livraison.
     */
    public function vendeur(): BelongsTo
    {
        return $this->belongsTo(Vendeur::class);
    }

    /**
     * Get the detail BLs for the bon livraison.
     */
    public function detailBLs(): HasMany
    {
        return $this->hasMany(DetailBL::class, 'bon_livraison_id');
    }
}
