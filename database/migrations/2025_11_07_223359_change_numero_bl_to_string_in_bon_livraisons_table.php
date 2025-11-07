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
        Schema::table('bon_livraisons', function (Blueprint $table) {
            $table->string('numero_bl')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bon_livraisons', function (Blueprint $table) {
            $table->integer('numero_bl')->change();
        });
    }
};
