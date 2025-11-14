<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LoginRequestNotification extends Notification
{
    use Queueable;

    protected $vendeurEmployeeConfirmation;
    protected $requesterType; // 'vendeur' or 'employee'
    protected $requesterName;

    /**
     * Create a new notification instance.
     */
    public function __construct($vendeurEmployeeConfirmation, $requesterType = 'vendeur', $requesterName = null)
    {
        $this->vendeurEmployeeConfirmation = $vendeurEmployeeConfirmation;
        $this->requesterType = $requesterType;
        $this->requesterName = $requesterName;
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
        $vendeur = $this->vendeurEmployeeConfirmation->vendeur;
        $employee = $this->vendeurEmployeeConfirmation->employee;
        
        $requesterName = $this->requesterName ?? ($this->requesterType === 'vendeur' 
            ? ($vendeur->user->name ?? 'Vendeur') 
            : ($employee->nom_complet ?? 'Employee'));

        return [
            'type' => 'login_request',
            'title' => 'Demande de connexion',
            'message' => $this->requesterType === 'vendeur' 
                ? "Le vendeur {$requesterName} demande l'autorisation de se connecter avec l'employé {$employee->nom_complet}."
                : "L'employé {$requesterName} demande l'autorisation de se connecter.",
            'confirmation_id' => $this->vendeurEmployeeConfirmation->id,
            'vendeur_id' => $vendeur->id,
            'employee_id' => $employee->id,
            'vendeur_name' => $vendeur->user->name ?? 'Vendeur',
            'employee_name' => $employee->nom_complet,
            'action_url' => '/responsable/confirmations',
        ];
    }
}
