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
        Schema::create('detail_b_lfournisseurs', function (Blueprint $table) {
            $table->id();
            $table->float('qte');
            $table->float('prix');
            $table->string('discription');
            $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
            $table->foreignId('bl_fournisseur_id')->constrained('b_lfournisseurs')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('detail_b_lfournisseurs');
    }
};
