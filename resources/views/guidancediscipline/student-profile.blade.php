<x-guidance-layout>
    @vite(['resources/js/app.js'])
    @vite(['resources/css/guidance_student-profile.css'])
    @vite(['resources/js/guidance_student-profile.js'])

    <!-- MAIN CONTENT -->
    <main class="col-12 col-md-10 px-4 py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1 class="section-title mb-0">Student Profiles</h1>
            <div class="text-muted">
                <i class="ri-calendar-line me-1"></i>{{ now()->format('F j, Y') }}
            </div>
        </div>

        @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        @endif

        @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            {{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
        @endif

        <!-- SEARCH AND FILTER SECTION -->
        <div class="search-filter-section">
            <div class="row align-items-end">
                <div class="col-md-4">
                    <label for="searchInput" class="form-label fw-bold">Search Students</label>
                    <div class="input-group">
                        <span class="input-group-text"><i class="ri-search-line"></i></span>
                        <input type="text" class="form-control" id="searchInput" placeholder="Search by name, student ID, or LRN...">
                    </div>
                </div>
                <div class="col-md-2">
                    <label for="gradeFilter" class="form-label fw-bold">Grade Level</label>
                    <select class="form-select" id="gradeFilter">
                        <option value="">All Grades</option>
                        <option value="Grade 7">Grade 7</option>
                        <option value="Grade 8">Grade 8</option>
                        <option value="Grade 9">Grade 9</option>
                        <option value="Grade 10">Grade 10</option>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                    </select>
                </div>
                {{-- Removed Face Filter Column --}}
            </div>
        </div>

        <!-- STUDENTS TABLE -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">Students List</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle" id="studentsTable">
                        <thead>
                            <tr>
                                <th>Photo</th>
                                <th>Student Info</th>
                                <th>Grade</th>
                                {{-- Removed Face Registration Column --}}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($students as $student)
                            <tr>
                                <td>
                                    @if($student->hasIdPhoto())
                                    <img src="{{ $student->id_photo_data_url }}" alt="Student Photo" class="rounded-circle" width="50" height="50">
                                    @else
                                    <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="ri-user-line text-white"></i>
                                    </div>
                                    @endif
                                </td>
                                <td>
                                    <div>
                                        <strong>{{ $student->first_name }} {{ $student->last_name }}</strong>
                                        <br><small class="text-muted">ID: {{ $student->student_id ?: ($student->lrn ? 'LRN: '.$student->lrn : 'No ID') }}</small>
                                        @if($student->lrn)
                                        <br><small class="text-muted">LRN: {{ $student->lrn }}</small>
                                        @endif
                                    </div>
                                </td>
                                <td>
                                    <span class="fw-bold">{{ $student->grade_level }}</span>
                                </td>
                                {{-- Removed Face Registration Status Cell --}}
                                <td>
                                    <div class="btn-group" role="group">
                                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="viewStudent({{ $student->id }})" title="View Profile">
                                            <i class="ri-eye-line"></i>
                                        </button>
                                        {{-- Removed Register Face Button --}}
                                        <button type="button" class="btn btn-sm btn-outline-warning" onclick="viewViolations({{ $student->id }})" title="View Violations">
                                            <i class="ri-alert-line"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center py-5"> <!-- Updated colspan -->
                                    <i class="ri-user-line display-4 text-muted"></i>
                                    <p class="text-muted mt-2">No students found</p>
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                @if($students->hasPages())
                <div class="d-flex justify-content-between align-items-center mt-4">
                    <div>
                        <small class="text-muted">
                            Showing {{ $students->firstItem() ?: 0 }} to {{ $students->lastItem() ?: 0 }}
                            of {{ $students->total() }} students
                        </small>
                    </div>
                    {{ $students->links() }}
                </div>
                @endif
            </div>
        </div>
    </main>

    <!-- Student Profile Modal -->
    <div class="modal fade" id="studentModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Student Profile</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body" id="studentModalBody">
                    <!-- Student details will be loaded here -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="hideModal('studentModal')">Close</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Removed Facial Recognition Scanner Modal --}}
    {{-- Removed Face Registration Modal --}}
</x-guidance-layout>