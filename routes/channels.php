<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('responsable.confirmations', function ($user) {
    return $user->hasRole('Responsable');
});

Broadcast::channel('vendeur.{vendeurId}', function ($user, $vendeurId) {
    $vendeur = $user->vendeur;
    return $vendeur && $vendeur->id == $vendeurId;
});
