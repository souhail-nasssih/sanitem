<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Produit extends Model
{
    protected $fillable = [
        'reférence',
        'discription',
        'unite',
        'qte_stock',
        'prix_vente',
        'prix_achat',
    ];

    /**
     * Get the detail BLs for the produit.
     */
    public function detailBLs(): HasMany
    {
        return $this->hasMany(DetailBL::class);
    }

    /**
     * Get the detail BL fournisseurs for the produit.
     */
    public function detailBLFournisseurs(): HasMany
    {
        return $this->hasMany(DetailBLfournisseur::class);
    }
}
