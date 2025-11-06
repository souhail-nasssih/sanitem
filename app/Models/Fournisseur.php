<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    protected $fillable = [
        'nom_complet',
        'numero_tel',
        'adresse',
    ];

    /**
     * Get the BL fournisseurs for the fournisseur.
     */
    public function blFournisseurs(): HasMany
    {
        return $this->hasMany(BLfournisseur::class);
    }
}
