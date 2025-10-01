<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\EnrollmentController;
// use Illuminate\Support\Facades\Mail;
// use App\Mail\StudentWelcomeMail;
// use App\Models\Student;
use App\Models\User;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\GuidanceDisciplineController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EnrolleeController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\AdminEnrollmentController;
// use Spatie\Permission\Middlewares\RoleMiddleware;
// use Spatie\Permission\Middlewares\PermissionMiddleware;
// use App\Http\Controllers\AdminGeneratorController;



Route::get('/', function () {
    return view('welcome');
});

// Enrollment side
Route::get('/enroll', function () {
    return view('enroll');
});


// Enrollment Create & Store
Route::get('/enroll', [EnrollmentController::class, 'create'])
     ->name('enroll.create');
Route::post('/enroll', [EnrollmentController::class, 'store'])
     ->name('enroll.store');

// API route for fee calculation
Route::get('/api/fees/calculate/{gradeLevel}', [EnrollmentController::class, 'calculateFees'])
     ->name('api.fees.calculate');

// Contact form routes
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');



// Admin Generator (accessible without login for initial setup)
Route::get('/generate-admin', [AdminController::class, 'showGeneratorForm'])->name('show.admin.generator');
Route::post('/generate-admin', [AdminController::class, 'generateAdmin'])->name('generate.admin');

// Admin routes
Route::prefix('admin')->group(function () {
    // Admin login routes (public)
    Route::get('/login', [AdminController::class, 'showLoginForm'])->name('admin.login');
    Route::post('/login', [AdminController::class, 'login'])->name('admin.login.submit');
    
    // Protected admin routes - use auth middleware
    Route::middleware(['auth'])->group(function () {
        // Dashboard
        
        Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
            Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
            Route::get('/dashboard/stats', [AdminController::class, 'getStats'])->name('dashboard.stats');
        });
        Route::get('/', [AdminController::class, 'index'])->name('admin.dashboard');
        Route::post('/logout', [AdminController::class, 'logout'])->name('admin.logout');
        
       
     
        
        // User Management - Use your custom permission middleware
        Route::middleware(['can:Manage Roles'])->group(function () {
            Route::get('/manage-users', [UserManagementController::class, 'index'])->name('admin.manage.users');
            Route::post('/assign-role', [AdminController::class, 'assignRole'])->name('admin.assign.role');
            Route::post('/remove-role', [AdminController::class, 'removeRole'])->name('admin.remove.role');
            Route::post('/create-role', [AdminController::class, 'createRole'])->name('admin.create.role');
            Route::put('/roles/{id}', [AdminController::class, 'updateRole'])->name('admin.update.role');
            Route::delete('/roles/{id}', [AdminController::class, 'deleteRole'])->name('admin.delete.role');
            Route::post('/create-permission', [AdminController::class, 'createPermission'])->name('admin.create.permission');
            Route::put('/permissions/{id}', [AdminController::class, 'updatePermission'])->name('admin.update.permission');
            Route::delete('/permissions/{id}', [AdminController::class, 'deletePermission'])->name('admin.delete.permission');
            Route::get('/users/{user}/roles', [AdminController::class, 'getUserRoles'])->name('admin.user.roles');
            
            // User Management
            Route::get('/user-management', [UserManagementController::class, 'index'])->name('admin.user.management');
            
            // User CRUD operations
            Route::get('/users/{id}', [UserManagementController::class, 'show'])->name('admin.users.show');
            Route::put('/users/{id}', [UserManagementController::class, 'update'])->name('admin.users.update');
            Route::delete('/users/{id}', [UserManagementController::class, 'destroy'])->name('admin.users.destroy');
            Route::post('/users/admin', [UserManagementController::class, 'storeAdmin'])->name('admin.users.store.admin');
            Route::post('/users/teacher', [UserManagementController::class, 'storeTeacher'])->name('admin.users.store.teacher');
            Route::post('/users/guidance', [UserManagementController::class, 'storeGuidance'])->name('admin.users.store.guidance');
            Route::post('/users/discipline', [UserManagementController::class, 'storeDiscipline'])->name('admin.users.store.discipline');
            Route::post('/users/guidance-counselor', [UserManagementController::class, 'createGuidanceCounselor'])->name('admin.users.store.guidance_counselor');
            Route::post('/users/discipline-head', [UserManagementController::class, 'createDisciplineHead'])->name('admin.users.store.discipline_head');
            Route::post('/users/discipline-officer', [UserManagementController::class, 'createDisciplineOfficer'])->name('admin.users.store.discipline_officer');
            Route::post('/users/cashier', [UserManagementController::class, 'createCashier'])->name('admin.users.store.cashier');
            Route::post('/users/faculty-head', [UserManagementController::class, 'createFacultyHead'])->name('admin.users.store.faculty_head');
            Route::get('/users/stats', [UserManagementController::class, 'getStats'])->name('admin.users.stats');
            
            // Enrollments management 
            Route::get('/enrollments', [AdminEnrollmentController::class, 'index'])->name('admin.enrollments');
            
            // Enrollment API routes
            Route::prefix('enrollments')->name('admin.enrollments.')->group(function () {
                Route::get('/applications', [AdminEnrollmentController::class, 'getApplications'])->name('applications');
                Route::get('/applications/{id}', [AdminEnrollmentController::class, 'getApplication'])->name('application');
                Route::post('/applications/{id}/status', [AdminEnrollmentController::class, 'updateApplicationStatus'])->name('application.status');
                
                // Application actions
                Route::post('/applications/{id}/approve', [AdminEnrollmentController::class, 'approveApplication'])->name('application.approve');
                Route::post('/applications/{id}/decline', [AdminEnrollmentController::class, 'declineApplication'])->name('application.decline');
                Route::delete('/applications/{id}', [AdminEnrollmentController::class, 'deleteApplication'])->name('application.delete');
                
                // Bulk actions
                Route::post('/applications/bulk-approve', [AdminEnrollmentController::class, 'bulkApprove'])->name('applications.bulk-approve');
                Route::post('/applications/bulk-decline', [AdminEnrollmentController::class, 'bulkDecline'])->name('applications.bulk-decline');
                Route::post('/applications/bulk-delete', [AdminEnrollmentController::class, 'bulkDelete'])->name('applications.bulk-delete');
                
                Route::get('/documents', [AdminEnrollmentController::class, 'getDocuments'])->name('documents');
                Route::get('/applications/{applicationId}/documents', [AdminEnrollmentController::class, 'getApplicationDocuments'])->name('application.documents');
                Route::get('/documents/{enrolleeId}/{documentIndex}', [AdminEnrollmentController::class, 'getDocument'])->name('document');
                Route::get('/documents/{enrolleeId}/{documentIndex}/view', [AdminEnrollmentController::class, 'viewDocument'])->name('document.view');
                Route::get('/documents/{enrolleeId}/{documentIndex}/download', [AdminEnrollmentController::class, 'downloadDocument'])->name('document.download');
                Route::post('/documents/{enrolleeId}/{documentIndex}/status', [AdminEnrollmentController::class, 'updateDocumentStatus'])->name('document.status');
                
                Route::get('/appointments', [AdminEnrollmentController::class, 'getAppointments'])->name('appointments');
                Route::post('/applications/{applicationId}/appointment', [AdminEnrollmentController::class, 'updateAppointment'])->name('application.appointment');
        
                Route::get('/notices', [AdminEnrollmentController::class, 'getNotices'])->name('notices');
                Route::post('/notices', [AdminEnrollmentController::class, 'createNotice'])->name('notices.create');
                Route::post('/notices/bulk', [AdminEnrollmentController::class, 'sendBulkNotices'])->name('notices.bulk');
                Route::delete('/notices/{noticeId}', [AdminEnrollmentController::class, 'deleteNotice'])->name('notices.delete');
                
                Route::get('/export', [AdminEnrollmentController::class, 'export'])->name('export');
            });
            
            // Contact Messages Management
            Route::get('/contact-messages', [ContactController::class, 'adminIndex'])->name('admin.contact.messages');
            Route::get('/contact-messages/{message}', [ContactController::class, 'show'])->name('admin.contact.show');
            Route::post('/contact-messages/{message}/status', [ContactController::class, 'updateStatus'])->name('admin.contact.status');
            Route::delete('/contact-messages/{message}', [ContactController::class, 'destroy'])->name('admin.contact.destroy');
            Route::post('/contact-messages/bulk-action', [ContactController::class, 'bulkAction'])->name('admin.contact.bulk');
        });
    });
});

   


// First version of routes, keep it here and do not delete. Route::put('/enrollments/{id}', [AdminController::class, 'updateEnrollment'])->name('enrollments.update');


// Inside the auth middleware group
Route::middleware(['auth'])->group(function () {
    // Dashboard - accessible to all authenticated users
    Route::get('/admin', [AdminController::class, 'index'])->name('admin.dashboard');
    Route::post('/logout', [AdminController::class, 'logout'])->name('admin.logout');
    
    // User management - requires 'Manage users' permission
    Route::middleware(['permissions:Manage users'])->group(function () {
      
        // Other user routes...
    });
    
    // Role management - requires 'Roles & Access' permission
    Route::middleware(['permissions:Roles & Access'])->group(function () {
     
        // Other role routes...
    });
});

// Test route to check authentication, roles, and permissions (Spatie)
// Route::get('/test', function () {
//     if (Auth::check()) {
//         $user = Auth::user();
//         $roles = $user->getRoleNames()->toArray();
//         $permissions = $user->getAllPermissions()->pluck('name')->toArray();
        
//         return 'Logged in as: ' . $user->name . 
//                ' (Roles: ' . implode(', ', $roles) . ')' .
//                ' (Permissions: ' . implode(', ', $permissions) . ')';
//     } else {
//         return 'Not logged in';
//     }
// })->name('test');


// Public Teacher Account Generator (no authentication required)
Route::get('/teacher-generator', [TeacherController::class, 'showGeneratorForm'])
    ->name('teacher.generator');

Route::post('/teacher-generator', [TeacherController::class, 'generateTeacher'])
    ->name('generate.teacher');

// Teacher Authentication Routes
Route::get('/teacher/login', [TeacherController::class, 'showLoginForm'])
    ->name('teacher.login');

Route::post('/teacher/login', [TeacherController::class, 'login'])
    ->name('teacher.login.submit');

Route::post('/teacher/logout', [TeacherController::class, 'logout'])
    ->name('teacher.logout');

// Teacher Dashboard Route (protected)
Route::get('/teacher', [TeacherController::class, 'index'])
    ->name('teacher.dashboard')
    ->middleware(['auth', 'role:teacher']);

// Public Guidance Account Generator (no authentication required)
Route::get('/guidance-generator', [GuidanceDisciplineController::class, 'showPublicGenerator'])
    ->name('guidance.generator');

Route::post('/guidance-generator', [GuidanceDisciplineController::class, 'createPublicAccount'])
    ->name('guidance.generator.submit');
    
// Guidance & Discipline Routes
Route::prefix('guidance')->name('guidance.')->group(function () {
    
    // Authentication Routes
    Route::get('/login', [GuidanceDisciplineController::class, 'showLogin'])
        ->name('login');
    
    Route::post('/login', [GuidanceDisciplineController::class, 'login'])
        ->name('login.submit');
    
    Route::post('/logout', [GuidanceDisciplineController::class, 'logout'])
        ->name('logout');
    
    // Protected Routes (require authentication and guidance staff role)
    Route::middleware(['auth'])->group(function () {
        
        // Dashboard
        Route::get('/', [GuidanceDisciplineController::class, 'dashboard'])
            ->name('dashboard');
        
        // Account Management Routes
        Route::get('/create-account', [GuidanceDisciplineController::class, 'showCreateAccount'])
            ->name('create-account');
        
        Route::post('/create-account', [GuidanceDisciplineController::class, 'createAccount'])
            ->name('create-account.submit');
        
        // Student Management Routes
        Route::prefix('students')->name('students.')->group(function () {
            Route::get('/', [GuidanceDisciplineController::class, 'studentsIndex'])
                ->name('index');

            Route::get('/search', [GuidanceDisciplineController::class, 'searchStudents'])
                ->name('search');

            Route::get('/{student}', [GuidanceDisciplineController::class, 'showStudent'])
                ->name('show');

            Route::get('/{student}/info', [GuidanceDisciplineController::class, 'getStudentInfo'])
                ->name('info');
        });
        
        // Violations Management Routes
        Route::prefix('violations')->name('violations.')->group(function () {
            Route::get('/', [GuidanceDisciplineController::class, 'violationsIndex'])
                ->name('index');
            
            Route::post('/', [GuidanceDisciplineController::class, 'storeViolation'])
                ->name('store');
            
            Route::get('/{violation}', [GuidanceDisciplineController::class, 'showViolation'])
                ->name('show');
            
            Route::get('/{violation}/edit', [GuidanceDisciplineController::class, 'editViolation'])
                ->name('edit');
            
            Route::put('/{violation}', [GuidanceDisciplineController::class, 'updateViolation'])
                ->name('update');
            
            Route::delete('/{violation}', [GuidanceDisciplineController::class, 'destroyViolation'])
                ->name('destroy');
        });
        
        // Counseling Records Routes (to be implemented)
        Route::prefix('counseling')->name('counseling.')->group(function () {
            Route::get('/', function () {
                return view('guidancediscipline.counseling.index');
            })->name('index');
            
            Route::get('/create', function () {
                return view('guidancediscipline.counseling.create');
            })->name('create');
            
            Route::post('/', function () {
                // Store counseling record logic
            })->name('store');
            
            Route::get('/{record}/edit', function () {
                return view('guidancediscipline.counseling.edit');
            })->name('edit');
        });
        
        // Facial Recognition Routes (to be implemented)
        Route::prefix('facial-recognition')->name('facial-recognition.')->group(function () {
            Route::get('/', function () {
                return view('guidancediscipline.facial-recognition.index');
            })->name('index');
            
            Route::post('/enroll', function () {
                // Enroll face logic
            })->name('enroll');
            
            Route::post('/recognize', function () {
                // Face recognition logic
            })->name('recognize');
        });
        
        // Disciplinary Actions Routes (to be implemented)
        Route::prefix('disciplinary-actions')->name('disciplinary-actions.')->group(function () {
            Route::get('/', function () {
                return view('guidancediscipline.disciplinary-actions.index');
            })->name('index');
            
            Route::get('/create', function () {
                return view('guidancediscipline.disciplinary-actions.create');
            })->name('create');
            
            Route::post('/', function () {
                // Store disciplinary action logic
            })->name('store');
        });
        
        // Analytics & Reports Routes (to be implemented)
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', function () {
                return view('guidancediscipline.reports.index');
            })->name('index');
            
            Route::get('/violations', function () {
                return view('guidancediscipline.reports.violations');
            })->name('violations');
            
            Route::get('/counseling', function () {
                return view('guidancediscipline.reports.counseling');
            })->name('counseling');
        });
        
        // Settings Routes (to be implemented)
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', function () {
                return view('guidancediscipline.settings.index');
            })->name('index');
            
            Route::get('/profile', function () {
                return view('guidancediscipline.settings.profile');
            })->name('profile');
            
            Route::put('/profile', function () {
                // Update profile logic
            })->name('profile.update');
        });
    });
});


// First version of routes, keep it here and do not delete.
// Route::get('/teacher', [TeacherController::class, 'index']);
// Route::get('/admin', [adminController::class, 'adminindex']);
// Route::get('/admin/login', [adminController::class, 'adminlogin']);


// Route::get('/guidance', [GuidanceDisciplineController::class, 'index']);
// Route::get('/guidance/login', [GuidanceDisciplineController::class, 'loginform']);

// Student routes
Route::get('/student', [StudentController::class, 'index']);
Route::prefix('student')->name('student.')->group(function () {
    // Student login routes (public)
    Route::get('/login', [StudentController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [StudentController::class, 'login'])->name('login.submit');
    
    // Protected student routes
    Route::middleware(['auth:student'])->group(function () {
        Route::get('/student', [StudentController::class, 'index'])->name('dashboard');
        Route::get('/violations', [StudentController::class, 'violations'])->name('violations');
        Route::post('/logout', [StudentController::class, 'logout'])->name('logout');
    });
});

// Enrollee routes
Route::prefix('enrollee')->name('enrollee.')->group(function () {
    // Enrollee login routes (public)
    Route::get('/login', [EnrolleeController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [EnrolleeController::class, 'login'])->name('login.submit');
    
    // Protected enrollee routes
    Route::middleware(['auth:enrollee'])->group(function () {
        // Dashboard
        Route::get('/', [EnrolleeController::class, 'index'])->name('dashboard');
        
        // Application management
        Route::get('/application', [EnrolleeController::class, 'application'])->name('application');
        
        // Document management
        Route::get('/documents', [EnrolleeController::class, 'documents'])->name('documents');
        Route::post('/documents/upload', [EnrolleeController::class, 'uploadDocument'])->name('documents.upload');
        Route::delete('/documents/delete', [EnrolleeController::class, 'deleteDocument'])->name('documents.delete');
        Route::get('/documents/view/{index}', [EnrolleeController::class, 'viewDocument'])->name('documents.view');
        Route::get('/documents/download/{index}', [EnrolleeController::class, 'downloadDocument'])->name('documents.download');
        
        // Payment management
        Route::get('/payment', [EnrolleeController::class, 'payment'])->name('payment');
        Route::post('/payment/process', [EnrolleeController::class, 'processPayment'])->name('payment.process');
        
        // Schedule management
        Route::get('/schedule', [EnrolleeController::class, 'schedule'])->name('schedule');
        Route::put('/schedule', [EnrolleeController::class, 'updateSchedule'])->name('schedule.update');
        
        // Appointment management
        Route::post('/appointment/request', [EnrolleeController::class, 'requestAppointment'])->name('appointment.request');
        
        // Notices management
        Route::get('/notices', [EnrolleeController::class, 'notices'])->name('notices');
        Route::get('/notices/{id}', [EnrolleeController::class, 'getNotice'])->name('notices.get');
        Route::post('/notices/{id}/mark-read', [EnrolleeController::class, 'markNoticeAsRead'])->name('notices.mark-read');
        Route::post('/notices/mark-all-read', [EnrolleeController::class, 'markAllNoticesAsRead'])->name('notices.mark-all-read');
        
        // Profile management (redirects to application page since they're merged)
        Route::get('/profile', function() {
            return redirect()->route('enrollee.application');
        })->name('profile');
        Route::put('/profile', [EnrolleeController::class, 'updateProfile'])->name('profile.update');
        
        // Password management
        Route::put('/password/update', [EnrolleeController::class, 'updatePassword'])->name('password.update');
        
        // Pre-registration
        Route::post('/pre-register', [EnrolleeController::class, 'preRegister'])->name('pre-register');
        
        // Logout
        Route::post('/logout', [EnrolleeController::class, 'logout'])->name('logout');
    });
});

