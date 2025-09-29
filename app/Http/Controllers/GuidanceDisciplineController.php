<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\GuidanceDiscipline;
use App\Models\User;
use App\Models\Student;
use App\Models\Violation;
use Illuminate\Support\Facades\Storage;

class GuidanceDisciplineController extends Controller
{
    public function __construct()
    {
        // Role and permission management is handled by RolePermissionSeeder
        // No need to create roles/permissions here
    }

    // PUBLIC METHODS (No authentication required)

    // REMOVED: showPublicGenerator() method
    // This functionality has been moved to UserManagementController
    // The guidancediscipline-generator.blade.php view is no longer needed as guidance/discipline
    // account creation is now handled through the centralized user management system

    // REMOVED: createPublicAccount() method
    // This functionality has been moved to UserManagementController with specialized methods:
    // - createGuidanceCounselor()
    // - createDisciplineOfficer() 
    // - createDisciplineHead()
    // The guidancediscipline-generator.blade.php view is no longer needed as account creation
    // is now handled through the centralized user management system with proper role-based modals

    // PROTECTED METHODS (Authentication required)

    // Show login form
    public function showLogin()
    {
        return view('guidancediscipline.login');
    }

    // Handle login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $credentials = $request->only('email', 'password');
        
        // Check if user exists and has guidance/discipline role
        $user = User::where('email', $credentials['email'])
                   ->first();
        
        if ($user && Hash::check($credentials['password'], $user->password)) {
            // Check if user has appropriate role
            if ($user->isGuidanceStaff()) {
                Auth::login($user);
                $user->updateLastLogin(); // Update last login timestamp
                session(['guidance_user' => true]); // Mark as guidance user
                return redirect()->route('guidance.dashboard');
            } else {
                return back()->withErrors(['email' => 'You do not have permission to access this system.']);
            }
        }

        return back()->withErrors(['email' => 'Invalid credentials or account is inactive.']);
    }

    // Show dashboard
    public function dashboard()
    {
        // Check if user is authenticated and is guidance staff
        if (!Auth::check() || !session('guidance_user') || !Auth::user()->isGuidanceStaff()) {
            return redirect()->route('guidance.login')->withErrors(['error' => 'Please login to access the dashboard.']);
        }

        // Get statistics
        $totalStudents = Student::count();
        $facesRegistered = 0; // Will be implemented when face_encoding column is added
        
        // Get violations this month using violation_date
        $violationsThisMonth = Violation::whereMonth('violation_date', now()->month)
            ->whereYear('violation_date', now()->year)
            ->count();
            
        // Additional violation statistics
        $totalViolations = Violation::count();
        $pendingViolations = Violation::where('status', 'pending')->count();
        $violationsToday = Violation::whereDate('violation_date', now()->toDateString())->count();
        $majorViolations = Violation::where('severity', 'major')->count();
        
        $stats = [
            'total_students' => $totalStudents,
            'faces_registered' => $facesRegistered,
            'violations_this_month' => $violationsThisMonth,
            'total_violations' => $totalViolations,
            'pending_violations' => $pendingViolations,
            'violations_today' => $violationsToday,
            'major_violations' => $majorViolations,
        ];

        return view('guidancediscipline.index', compact('stats'));
    }

    // Logout
    public function logout()
    {
        session()->forget('guidance_user');
        Auth::logout();
        return redirect()->route('guidance.login');
    }

    // Show account creation form (protected)
    public function showCreateAccount()
    {
        // Check if user is authenticated and has permission
        if (!Auth::check() || !session('guidance_user') || !Auth::user()->can('create_guidance_accounts')) {
            return redirect()->route('guidance.login')->withErrors(['error' => 'Unauthorized access.']);
        }

        return view('guidancediscipline.create-account');
    }

    // Handle account creation (protected)
    public function createAccount(Request $request)
    {
        // Check if user is authenticated and has permission
        if (!Auth::check() || !session('guidance_user') || !Auth::user()->can('create_guidance_accounts')) {
            return redirect()->route('guidance.login')->withErrors(['error' => 'Unauthorized access.']);
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|in:guidance_counselor,discipline_officer,security_guard',
            'employee_id' => 'required|string|unique:users,employee_id',
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'position' => 'nullable|string|max:255',
            'hire_date' => 'nullable|date|before_or_equal:today',
            'qualifications' => 'nullable|string|max:1000',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'emergency_contact_relationship' => 'nullable|in:spouse,parent,sibling,child,friend,other',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Determine department based on role
        $department = in_array($request->role, ['discipline_officer', 'discipline_head']) ? 'discipline' : 'guidance';

        // Create user
        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'employee_id' => $request->employee_id,
            'user_type' => 'staff',
            'department' => $department,
            'phone_number' => $request->phone_number,
            'address' => $request->address,
            'position' => $request->position,
            'hire_date' => $request->hire_date,
            'qualifications' => $request->qualifications,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'emergency_contact_relationship' => $request->emergency_contact_relationship,
            'notes' => $request->notes,
            'is_active' => true,
        ]);

        // Assign role (permissions are handled by RolePermissionSeeder)
        $user->assignRole($request->role);

        return redirect()->route('guidance.dashboard')
            ->with('success', 'Account created successfully for ' . $user->first_name . ' ' . $user->last_name . ' (' . ucwords(str_replace('_', ' ', $request->role)) . ')');
    }

    // All role and permission management is now handled by RolePermissionSeeder
    // This keeps the controller focused on its core guidance/discipline functionality

    // STUDENT MANAGEMENT METHODS

    /**
     * Display students index page
     */
    public function studentsIndex()
    {
        // Check permission
        // if (!auth()->user()->can('view_students')) {
        //     abort(403, 'Unauthorized access');
        // }

        $students = Student::with('activeFaceRegistration')
            ->orderBy('last_name', 'asc')
            ->paginate(20);

        return view('guidancediscipline.student-profile', compact('students'));
    }

    /**
     * Show student profile
     */
    public function showStudent(Student $student)
    {
        // Check permission
        // if (!auth()->user()->can('view_students')) {
        //     abort(403, 'Unauthorized access');
        // }

        $student->load(['violations']);
        return response()->json($student);
    }

    /**
     * Get student info for AJAX requests
     */
    public function getStudentInfo(Student $student)
    {
        return response()->json($student);
    }

    // VIOLATIONS MANAGEMENT METHODS

    /**
     * Display violations index page
     */
    public function violationsIndex()
    {
        // Check permission
        // if (!auth()->user()->can('view_violations')) {
        //     abort(403, 'Unauthorized access');
        // }

        $violations = Violation::with(['student', 'reportedBy', 'resolvedBy'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $students = Student::select('id', 'first_name', 'last_name', 'student_id')
            ->orderBy('last_name', 'asc')
            ->get();

        $stats = [
            'pending' => Violation::where('status', 'pending')->count(),
            'investigating' => Violation::where('status', 'investigating')->count(),
            'resolved' => Violation::where('status', 'resolved')->count(),
            'severe' => Violation::where('severity', 'severe')->count(),
        ];

        return view('guidancediscipline.student-violations', compact('violations', 'students', 'stats'));
    } 
    /**
 * Store a new violation
 */
public function storeViolation(Request $request)
{
    \Log::info('=== VIOLATION SUBMISSION STARTED ===');
    \Log::info('Request method:', ['method' => $request->method()]);
    \Log::info('Request headers:', $request->headers->all());
    \Log::info('Request data:', $request->all());
    \Log::info('Files:', $request->file() ? array_keys($request->file()) : ['no files']);

    // Check authentication explicitly to return JSON instead of HTML redirect
    if (!Auth::check()) {
        \Log::warning('Unauthenticated violation submission attempt');
        return response()->json([
            'success' => false,
            'message' => 'Unauthenticated. Please log in.'
        ], 401);
    }

    try {
        // Check if we're receiving JSON data from the form
        if ($request->has('violation_data')) {
            \Log::info('Found violation_data in request');
            $violationData = json_decode($request->violation_data, true);
            $request->merge($violationData);
            \Log::info('Merged violation_data:', $violationData);
        }

        // Get current user and check permissions
        $user = Auth::user();
        \Log::info('Current user:', [
            'user_id' => $user->id,
            'user_name' => $user->first_name . ' ' . $user->last_name,
            'user_type' => $user->user_type,
            'department' => $user->department
        ]);

        // Check if user has guidance discipline record
        $guidanceRecord = $user->guidanceDiscipline;
        \Log::info('Guidance discipline record:', $guidanceRecord ? ['id' => $guidanceRecord->id] : ['not_found']);

        if (!$guidanceRecord) {
            \Log::warning('User does not have guidance discipline record');
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to report violations. No guidance discipline record found.'
            ], 403);
        }

        \Log::info('Starting validation...');

        // Define validation rules
        $validationRules = [
            'student_id' => 'required|exists:students,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:minor,major,severe',
            'major_category' => 'nullable|string|max:255',
            'violation_date' => 'required|date',
            'violation_time' => 'nullable|date_format:H:i',
            'location' => 'nullable|string|max:255',
            'witnesses' => 'nullable|array',
            'witnesses.*' => 'nullable|string|max:255',
            'evidence' => 'nullable|string',
            'student_statement' => 'nullable|string',
            'status' => 'required|in:pending,investigating,resolved,dismissed',
            'parent_notified' => 'nullable|boolean',
            'parent_notification_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'attachments' => 'required|array|min:1',
            'attachments.*' => 'file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120', // 5MB max
        ];

        \Log::info('Validation rules:', $validationRules);

        $validatedData = $request->validate($validationRules);
        \Log::info('Validation passed:', $validatedData);

        // Add fields that are not from the form
        $validatedData['reported_by'] = $guidanceRecord->id;
        $validatedData['violation_type'] = 'behavioral'; // Default type
        
        \Log::info('Added system fields:', [
            'reported_by' => $validatedData['reported_by'],
            'violation_type' => $validatedData['violation_type']
        ]);

        // Process violation time to ensure proper format
        if (isset($validatedData['violation_time']) && $validatedData['violation_time']) {
            $time = $validatedData['violation_time'];
            \Log::info('Processing violation time:', ['original_time' => $time]);
            
            // Handle various time formats and convert to H:i:s
            if (preg_match('/^(\d{1,2}):(\d{2})$/', $time)) {
                // Already in H:i format, add seconds
                $validatedData['violation_time'] = $time . ':00';
                \Log::info('Time formatted to H:i:s:', ['formatted_time' => $validatedData['violation_time']]);
            } elseif (preg_match('/^(\d{1,2}):(\d{2}):(\d{2})$/', $time)) {
                // Already in H:i:s format - keep as is
                \Log::info('Time already in H:i:s format');
            } else {
                \Log::warning('Unexpected time format:', ['time' => $time]);
            }
        }

        // Process witnesses array - filter out empty values
        if (isset($validatedData['witnesses'])) {
            \Log::info('Processing witnesses:', ['original_witnesses' => $validatedData['witnesses']]);
            
            $validatedData['witnesses'] = array_filter($validatedData['witnesses'], function($witness) {
                return !empty(trim($witness));
            });
            
            // If empty after filtering, set to null
            if (empty($validatedData['witnesses'])) {
                $validatedData['witnesses'] = null;
                \Log::info('Witnesses filtered to null');
            } else {
                \Log::info('Witnesses after filtering:', $validatedData['witnesses']);
            }
        }

        // Handle file uploads
        if ($request->hasFile('attachments')) {
            \Log::info('Processing file attachments');
            $attachments = [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('violations', 'public');
                $attachments[] = $path;
                \Log::info('File stored:', ['path' => $path, 'original_name' => $file->getClientOriginalName()]);
            }
            $validatedData['attachments'] = $attachments;
        } else {
            \Log::info('No file attachments found');
        }

        // Set default status if not provided
        if (!isset($validatedData['status'])) {
            $validatedData['status'] = 'pending';
            \Log::info('Set default status:', ['status' => $validatedData['status']]);
        }

        \Log::info('Final data before creating violation:', $validatedData);

        // Create the violation
        $violation = Violation::create($validatedData);
        \Log::info('Violation created successfully:', ['violation_id' => $violation->id]);

        // Load relationships for response
        $violation->load(['student', 'reportedBy']);

        \Log::info('=== VIOLATION SUBMISSION COMPLETED SUCCESSFULLY ===');

        // Handle AJAX requests
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Violation recorded successfully.',
                'violation' => $violation
            ]);
        }

        return redirect()->route('guidance.violations.index')
            ->with('success', 'Violation reported successfully.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        \Log::error('VALIDATION FAILED:', ['errors' => $e->errors(), 'request_data' => $request->all()]);
        
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed. Please check the form fields.',
                'errors' => $e->errors()
            ], 422);
        }
        
        return back()->withErrors($e->errors())->withInput();

    } catch (\Illuminate\Database\QueryException $e) {
        \Log::error('DATABASE ERROR:', [
            'message' => $e->getMessage(),
            'sql' => $e->getSql(),
            'bindings' => $e->getBindings(),
            'request_data' => $request->all()
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'Database error occurred while saving the violation.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }

        return back()->withErrors(['error' => 'Database error occurred.'])->withInput();

    } catch (\Exception $e) {
        \Log::error('GENERAL ERROR:', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->all()
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred: ' . ($e->getMessage() ?: 'Unknown error'),
                'error' => config('app.debug') ? [
                    'message' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : 'Internal server error'
            ], 500);
        }

        return back()->withErrors(['error' => 'An unexpected error occurred.'])->withInput();
    }
}
    /**
     * Show violation details
     */
    public function showViolation(Violation $violation)
    {
        $violation->load(['student', 'reportedBy', 'resolvedBy']);
        return response()->json($violation->load(['student', 'reportedBy', 'resolvedBy']));
    }

    /**
     * Show edit violation form
     */
    public function editViolation(Violation $violation)
    {
        $students = Student::select('id', 'first_name', 'last_name', 'student_id')
            ->orderBy('last_name', 'asc')
            ->get();

        return response()->json([
            'violation' => $violation->load(['student', 'reportedBy', 'resolvedBy']),
            'students' => $students
        ]);
    }

    /**
     * Update violation
     */
    public function updateViolation(Request $request, Violation $violation)
    {
        try {
            $validatedData = $request->validate([
                'student_id' => 'required|exists:students,id',
                'violation_type' => 'required|string|in:academic,behavioral,attendance,disciplinary,other',
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'severity' => 'required|in:minor,major,severe',
                'major_category' => 'nullable|string|max:255',
                'violation_date' => 'required|date',
                'violation_time' => 'nullable|date_format:H:i',
                'location' => 'nullable|string|max:255',
                'witnesses' => 'nullable|array',
                'witnesses.*' => 'nullable|string|max:255',
                'evidence' => 'nullable|string',
                'student_statement' => 'nullable|string',
                'status' => 'required|in:pending,investigating,resolved,dismissed',
                'resolution' => 'nullable|string',
                'disciplinary_action' => 'nullable|string',
                'parent_notified' => 'nullable|boolean',
                'parent_notification_date' => 'nullable|date',
                'notes' => 'nullable|string',
                'attachments.*' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:5120',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors' => $e->errors()
                ], 422);
            }
            throw $e;
        }
        
        // Process violation time to ensure proper format
        if (isset($validatedData['violation_time']) && $validatedData['violation_time']) {
            $time = $validatedData['violation_time'];
            // Handle various time formats and convert to H:i:s
            if (preg_match('/^(\d{1,2}):(\d{2})$/', $time)) {
                // Already in H:i format, add seconds
                $validatedData['violation_time'] = $time . ':00';
            } elseif (preg_match('/^(\d{1,2}):(\d{2}):(\d{2})$/', $time)) {
                // Already in H:i:s format - keep as is
                $validatedData['violation_time'] = $time;
            }
        }

        // Process witnesses array - filter out empty values
        if (isset($validatedData['witnesses'])) {
            $validatedData['witnesses'] = array_filter($validatedData['witnesses'], function($witness) {
                return !empty(trim($witness));
            });
            
            // If empty after filtering, set to null
            if (empty($validatedData['witnesses'])) {
                $validatedData['witnesses'] = null;
            }
        }

        // Handle file uploads
        if ($request->hasFile('attachments')) {
            $attachments = $violation->attachments ?: [];
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('violations', 'public');
                $attachments[] = $path;
            }
            $validatedData['attachments'] = $attachments;
        }

        // If status is being changed to resolved, set resolved_by and resolved_at
        if ($validatedData['status'] === 'resolved' && $violation->status !== 'resolved') {
            $user = Auth::user();
            if ($user) {
                // Try to get guidance discipline record
                $guidanceRecord = $user->guidanceDiscipline ?? null;
                if ($guidanceRecord) {
                    $validatedData['resolved_by'] = $guidanceRecord->id;
                } else {
                    // Fallback: use user ID if no guidance record
                    $validatedData['resolved_by'] = $user->id;
                }
                $validatedData['resolved_at'] = now();
            }
        }

        // If parent notification is being set and date is not provided, set it to current date
        if (isset($validatedData['parent_notified']) && $validatedData['parent_notified'] && !isset($validatedData['parent_notification_date'])) {
            $validatedData['parent_notification_date'] = now()->toDateString();
        }

        $violation->update($validatedData);

        // Handle AJAX requests
        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Violation updated successfully.',
                'violation' => $violation->load(['student', 'reportedBy', 'resolvedBy'])
            ]);
        }

        return redirect()->route('guidance.violations.index')
            ->with('success', 'Violation updated successfully.');
    }

    /**
     * Delete violation
     */
    public function destroyViolation(Request $request, Violation $violation)
    {
        try {
            // Delete associated files
            if ($violation->attachments) {
                foreach ($violation->attachments as $attachment) {
                    Storage::disk('public')->delete($attachment);
                }
            }

            $violationId = $violation->id;
            $violation->delete();

            // Handle AJAX requests
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Violation deleted successfully.',
                    'violation_id' => $violationId
                ]);
            }

            return redirect()->route('guidance.violations.index')
                ->with('success', 'Violation deleted successfully.');
        } catch (\Exception $e) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to delete violation.'
                ], 500);
            }
            
            return redirect()->route('guidance.violations.index')
                ->with('error', 'Failed to delete violation.');
        }
    }
}