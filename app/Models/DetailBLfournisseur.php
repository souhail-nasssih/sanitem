<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetailBLfournisseur extends Model
{
    protected $fillable = [
        'qte',
        'prix',
        'discription',
        'produit_id',
        'bl_fournisseur_id',
    ];

    /**
     * Get the produit that owns the detail BL fournisseur.
     */
    public function produit(): BelongsTo
    {
        return $this->belongsTo(Produit::class);
    }

    /**
     * Get the BL fournisseur that owns the detail BL fournisseur.
     */
    public function blFournisseur(): BelongsTo
    {
        return $this->belongsTo(BLfournisseur::class, 'bl_fournisseur_id');
    }
}
