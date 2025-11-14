<?php

namespace App\Events;

use App\Models\VendeurEmployeeConfirmation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VendeurEmployeeConfirmationRejected implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $confirmation;

    /**
     * Create a new event instance.
     */
    public function __construct(VendeurEmployeeConfirmation $confirmation)
    {
        $this->confirmation = $confirmation->load(['vendeur.user', 'employee', 'approver']);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('vendeur.' . $this->confirmation->vendeur_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'confirmation.rejected';
    }
}
