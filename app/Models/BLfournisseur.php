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
