<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view dashboard',
            'manage users',
            'manage roles',
            'manage permissions',
            'view settings',
            'manage settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission, 'guard_name' => 'web']
            );
        }

        // Create roles and assign permissions
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web']
        );
        $adminRole->givePermissionTo(Permission::all());

        $userRole = Role::firstOrCreate(
            ['name' => 'user', 'guard_name' => 'web']
        );
        $userRole->givePermissionTo(['view dashboard', 'view settings']);

        // Optional: Create additional roles
        $moderatorRole = Role::firstOrCreate(
            ['name' => 'moderator', 'guard_name' => 'web']
        );
        $moderatorRole->givePermissionTo([
            'view dashboard',
            'manage users',
            'view settings',
        ]);
    }
}

