<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveViolationTypeFromViolationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('violations', function (Blueprint $table) {
            $table->dropColumn('violation_type');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('violations', function (Blueprint $table) {
            $table->string('violation_type')->index()->comment('e.g., late, uniform, misconduct, academic');
        });
    }
}
