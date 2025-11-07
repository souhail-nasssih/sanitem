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
