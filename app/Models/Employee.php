<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends Model
{
    protected $fillable = [
        'nom_complet',
        'cin',
        'adresse',
    ];

    /**
     * Get the BL fournisseurs for the employee.
     */
    public function blFournisseurs(): HasMany
    {
        return $this->hasMany(BLfournisseur::class);
    }

    /**
     * Get the bon livraisons (BL clients) for the employee.
     */
    public function bonLivraisons(): HasMany
    {
        return $this->hasMany(BonLivraison::class);
    }
}
