<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Vendeur;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
            'role' => ['required', 'string', Rule::in(['Responsable', 'Employee', 'Vendeur'])],
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        // Assign the selected role to the user
        $user->assignRole($input['role']);

        // If role is Vendeur, create a vendeur record
        if ($input['role'] === 'Vendeur') {
            // Save the user's name in numero_post
            Vendeur::create([
                'numero_post' => $input['name'],
                'user_id' => $user->id,
            ]);
        }

        return $user;
    }
}
