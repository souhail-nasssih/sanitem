<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailBL extends Model
{
    protected $fillable = [
        'qte',
        'prix',
        'produit_id',
        'bon_livraison_id',
    ];

    /**
     * Get the produit that owns the detail BL.
     */
    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Get the bon livraison that owns the detail BL.
     */
    public function bonLivraison(): BelongsTo
    {
        return $this->belongsTo(BonLivraison::class, 'bon_livraison_id');
    }
}
