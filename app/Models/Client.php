<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = [
        'nom_complet',
        'numero_tel',
        'adresse',
    ];

    /**
     * Get the bon livraisons for the client.
     */
    public function bonLivraisons(): HasMany
    {
        return $this->hasMany(BonLivraison::class);
    }
}
