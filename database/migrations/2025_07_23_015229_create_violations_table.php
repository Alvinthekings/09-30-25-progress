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
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('reported_by')->constrained('guidance_discipline')->onDelete('cascade');
            $table->string('violation_type'); // e.g., 'uniform', 'behavior', 'academic', 'technology', 'appearance'
            $table->string('title');
            $table->text('description');
            $table->enum('severity', ['minor', 'major'])->default('minor'); // Removed 'severe'
            $table->string('major_category')->nullable(); // For major offenses: 'Category 1', 'Category 2', 'Category 3'
            
            $table->date('violation_date');
            $table->time('violation_time')->nullable();
            $table->string('location')->nullable();
            $table->json('witnesses')->nullable(); // Array of witness names
            // $table->text('evidence')->nullable(); // Description of evidence
            $table->json('attachments')->nullable(); // File paths for photos/documents
            $table->enum('status', ['pending', 'investigating', 'resolved', 'dismissed'])->default('pending');
            $table->text('resolution')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('guidance_discipline')->onDelete('set null');
            $table->date('resolved_at')->nullable();
            $table->text('student_statement')->nullable();
            $table->text('disciplinary_action')->nullable();
            $table->boolean('parent_notified')->default(false);
            $table->date('parent_notification_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['student_id', 'violation_date']);
            $table->index(['status', 'severity']);
            $table->index('violation_type');
            $table->index('major_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('violations');
    }
};