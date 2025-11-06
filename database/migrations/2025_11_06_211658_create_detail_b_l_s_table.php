<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('detail_b_l_s', function (Blueprint $table) {
            $table->id();
            $table->float('qte');
            $table->float('prix');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->foreignId('bon_livraison_id')->constrained('bon_livraisons')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_b_l_s');
    }
};
