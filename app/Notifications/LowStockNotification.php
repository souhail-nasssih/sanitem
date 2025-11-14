<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\Produit;

class LowStockNotification extends Notification
{
    use Queueable;

    protected $produit;
    protected $threshold;

    /**
     * Create a new notification instance.
     */
    public function __construct(Produit $produit, $threshold = 10)
    {
        $this->produit = $produit;
        $this->threshold = $threshold;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $isOutOfStock = $this->produit->qte_stock <= 0;
        $type = $isOutOfStock ? 'out_of_stock' : 'low_stock';
        
        $unite = $this->produit->unite ?? 'unités';
        
        return [
            'type' => $type,
            'title' => $isOutOfStock 
                ? 'Stock épuisé' 
                : 'Stock faible',
            'message' => $isOutOfStock
                ? "Le produit {$this->produit->reférence} ({$this->produit->discription}) est en rupture de stock."
                : "Le produit {$this->produit->reférence} ({$this->produit->discription}) a un stock faible ({$this->produit->qte_stock} {$unite}).",
            'produit_id' => $this->produit->id,
            'produit_reference' => $this->produit->reférence,
            'produit_description' => $this->produit->discription,
            'stock_actuel' => $this->produit->qte_stock,
            'unite' => $unite,
            'threshold' => $this->threshold,
            'action_url' => '/produits',
        ];
    }
}
