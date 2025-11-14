<?php

namespace App\Observers;

use App\Events\NotificationCreated;
use App\Models\Produit;
use App\Models\User;
use App\Notifications\LowStockNotification;
use Illuminate\Support\Facades\DB;

class ProduitObserver
{
    protected $lowStockThreshold = 10;

    /**
     * Handle the Produit "created" event.
     */
    public function created(Produit $produit): void
    {
        $this->checkStockLevel($produit);
    }

    /**
     * Handle the Produit "updated" event.
     */
    public function updated(Produit $produit): void
    {
        // Only check if qte_stock was changed
        if ($produit->wasChanged('qte_stock')) {
            $this->checkStockLevel($produit);
        }
    }

    /**
     * Check stock level and send notifications if needed.
     */
    protected function checkStockLevel(Produit $produit): void
    {
        // Only send notification if stock is low (<= threshold)
        if ($produit->qte_stock <= $this->lowStockThreshold) {
            // Check if we already sent a notification for this product recently
            // to avoid spam. We'll check for unread notifications in the last hour.
            $recentNotification = DB::table('notifications')
                ->where('type', 'App\Notifications\LowStockNotification')
                ->where('read_at', null)
                ->where('created_at', '>=', now()->subHour())
                ->whereJsonContains('data->produit_id', $produit->id)
                ->exists();

            // Only send if no recent notification exists
            if (!$recentNotification) {
                // Send notification to all Responsables
                $responsables = User::role('Responsable')->get();
                foreach ($responsables as $responsable) {
                    $responsable->notify(new LowStockNotification($produit, $this->lowStockThreshold));
                    // Get the database notification that was just created
                    $dbNotification = $responsable->notifications()->latest()->first();
                    if ($dbNotification) {
                        event(new NotificationCreated($dbNotification, $responsable->id));
                    }
                }
            }
        }
    }
}
