<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vendeur extends Model
{
    protected $fillable = [
        'numero_post',
        'user_id',
    ];

    /**
     * Get the user that owns the vendeur.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the bon livraisons for the vendeur.
     */
    public function bonLivraisons(): HasMany
    {
        return $this->hasMany(BonLivraison::class);
    }
}
