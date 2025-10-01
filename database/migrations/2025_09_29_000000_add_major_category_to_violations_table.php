<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddMajorCategoryToViolationsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('violations', function (Blueprint $table) {
            $table->string('major_category')->nullable()->after('severity')->comment('Major category of the violation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('violations', function (Blueprint $table) {
            $table->dropColumn('major_category');
        });
    }
}
