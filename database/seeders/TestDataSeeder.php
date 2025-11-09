<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Produit;
use App\Models\Fournisseur;
use App\Models\Employee;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed Clients
        $clients = [
            [
                'nom_complet' => 'Ahmed Benali',
                'numero_tel' => '0612345678',
                'adresse' => '123 Rue Mohammed V, Casablanca',
            ],
            [
                'nom_complet' => 'Fatima Alami',
                'numero_tel' => '0623456789',
                'adresse' => '456 Avenue Hassan II, Rabat',
            ],
            [
                'nom_complet' => 'Mohamed Tazi',
                'numero_tel' => '0634567890',
                'adresse' => '789 Boulevard Zerktouni, Casablanca',
            ],
            [
                'nom_complet' => 'Aicha Bensaid',
                'numero_tel' => '0645678901',
                'adresse' => '321 Rue Allal Ben Abdellah, Fes',
            ],
            [
                'nom_complet' => 'Hassan Idrissi',
                'numero_tel' => '0656789012',
                'adresse' => '654 Avenue Mohammed VI, Marrakech',
            ],
        ];

        foreach ($clients as $client) {
            Client::firstOrCreate(
                ['numero_tel' => $client['numero_tel']],
                $client
            );
        }

        // Seed Products
        $produits = [
            [
                'reférence' => 'PROD001',
                'discription' => 'Produit Électronique Premium',
                'unite' => 'Unité',
                'qte_stock' => 150.00,
                'prix_achat' => 500.00,
                'prix_vente' => 750.00,
            ],
            [
                'reférence' => 'PROD002',
                'discription' => 'Matériel Informatique Standard',
                'unite' => 'Unité',
                'qte_stock' => 200.00,
                'prix_achat' => 300.00,
                'prix_vente' => 450.00,
            ],
            [
                'reférence' => 'PROD003',
                'discription' => 'Accessoires Téléphonie',
                'unite' => 'Unité',
                'qte_stock' => 500.00,
                'prix_achat' => 50.00,
                'prix_vente' => 80.00,
            ],
            [
                'reférence' => 'PROD004',
                'discription' => 'Composants Électroniques',
                'unite' => 'Kg',
                'qte_stock' => 75.50,
                'prix_achat' => 200.00,
                'prix_vente' => 320.00,
            ],
            [
                'reférence' => 'PROD005',
                'discription' => 'Câbles et Connectiques',
                'unite' => 'Mètre',
                'qte_stock' => 1000.00,
                'prix_achat' => 15.00,
                'prix_vente' => 25.00,
            ],
            [
                'reférence' => 'PROD006',
                'discription' => 'Équipement Réseau',
                'unite' => 'Unité',
                'qte_stock' => 30.00,
                'prix_achat' => 800.00,
                'prix_vente' => 1200.00,
            ],
            [
                'reférence' => 'PROD007',
                'discription' => 'Batteries et Chargeurs',
                'unite' => 'Unité',
                'qte_stock' => 250.00,
                'prix_achat' => 100.00,
                'prix_vente' => 150.00,
            ],
            [
                'reférence' => 'PROD008',
                'discription' => 'Écrans et Moniteurs',
                'unite' => 'Unité',
                'qte_stock' => 45.00,
                'prix_achat' => 1200.00,
                'prix_vente' => 1800.00,
            ],
        ];

        foreach ($produits as $produit) {
            Produit::firstOrCreate(
                ['reférence' => $produit['reférence']],
                $produit
            );
        }

        // Seed Fournisseurs
        $fournisseurs = [
            [
                'nom_complet' => 'TechSupply Maroc',
                'numero_tel' => '0522123456',
                'adresse' => '100 Avenue Mohammed V, Casablanca',
            ],
            [
                'nom_complet' => 'ElectroDistrib',
                'numero_tel' => '0537123456',
                'adresse' => '200 Boulevard Zerktouni, Casablanca',
            ],
            [
                'nom_complet' => 'Global Electronics',
                'numero_tel' => '0537123457',
                'adresse' => '300 Rue Allal Ben Abdellah, Rabat',
            ],
            [
                'nom_complet' => 'Digital Solutions',
                'numero_tel' => '0524123456',
                'adresse' => '400 Avenue Hassan II, Fes',
            ],
            [
                'nom_complet' => 'IT Equipment Co',
                'numero_tel' => '0524123457',
                'adresse' => '500 Boulevard Mohammed VI, Marrakech',
            ],
        ];

        foreach ($fournisseurs as $fournisseur) {
            Fournisseur::firstOrCreate(
                ['numero_tel' => $fournisseur['numero_tel']],
                $fournisseur
            );
        }

        // Seed Employees
        $employees = [
            [
                'nom_complet' => 'Youssef Amrani',
                'cin' => 'b1',
                'adresse' => '10 Rue Ibn Battuta, Casablanca',
            ],
            [
                'nom_complet' => 'Sanae El Fassi',
                'cin' => 'b2',
                'adresse' => '20 Avenue Al Massira, Rabat',
            ],
            [
                'nom_complet' => 'Karim Benslimane',
                'cin' => 'b3',
                'adresse' => '30 Boulevard Zerktouni, Casablanca',
            ],
            [
                'nom_complet' => 'Nadia Cherkaoui',
                'cin' => 'b4',
                'adresse' => '40 Rue Mohammed V, Fes',
            ],
            [
                'nom_complet' => 'Omar Alaoui',
                'cin' => 'b5',
                'adresse' => '50 Avenue Hassan II, Marrakech',
            ],
        ];

        foreach ($employees as $employee) {
            Employee::firstOrCreate(
                ['cin' => $employee['cin']],
                $employee
            );
        }
    }
}
