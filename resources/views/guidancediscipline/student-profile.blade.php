<x-guidance-layout>
  @vite(['resources/js/app.js', 'resources/js/guidance_student-profile.js'])
  @vite(['resources/css/guidance_student-profile.css'])

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
        {{-- COMMENTED OUT FOR FUTURE USE: Status Filter
        <div class="col-md-2">
          <label for="statusFilter" class="form-label fw-bold">Status</label>
          <select class="form-select" id="statusFilter">
            <option value="">All Statuses</option>
            <option value="enrolled">Enrolled</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
        --}}
        <div class="col-md-2">
          <label for="faceFilter" class="form-label fw-bold">Face Registration</label>
          <select class="form-select" id="faceFilter">
            <option value="">All</option>
            <option value="registered">Registered</option>
            <option value="not_registered">Not Registered</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label fw-bold">Actions</label>
          <button type="button" class="btn btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#facialRecognitionModal">
            <i class="ri-camera-line me-2"></i>Face Scanner
          </button>
        </div>
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
                {{-- <th>Grade & Section</th> --}}
                {{-- <th>Status</th> --}}
                <th>Face Registration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @forelse($students as $student)
              <tr>
                <td>
                  @if($student->id_photo_data_url)
                  <img src="{{ $student->id_photo_data_url }}" 
                         alt="Student Photo" 
                         class="rounded-circle" 
                         width="50" height="50">
                  @else
                    <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" 
                         style="width: 50px; height: 50px;">
                      <i class="ri-user-line text-white"></i>
                    </div>
                  @endif
                </td>
                <td>
                  <div>
                    <strong>{{ $student->first_name }} {{ $student->last_name }}</strong>
                    <br><small class="text-muted">ID: {{ $student->student_id ?: ($student->lrn ? 'LRN: '.$student->lrn : 'No ID') }}</small>
                    @if($student->lrn && $student->student_id)
                      <br><small class="text-muted">LRN: {{ $student->lrn }}</small>
                    @endif
                  </div>
                </td>
                <td>
                  <span class="fw-bold">{{ $student->grade_level }}</span>
                  @if($student->section)
                    {{-- <br><small class="text-muted">Section: {{ $student->section }}</small> --}}
                  @else
                    {{-- <br><small class="text-muted">No section assigned</small> --}}
                  @endif
                </td>
                {{-- COMMENTED OUT FOR FUTURE USE: Status Column
                <td>
                  <span class="badge bg-{{ $student->enrollment_status === 'enrolled' ? 'success' : ($student->enrollment_status === 'pending' ? 'warning' : 'info') }}">
                    {{ ucfirst($student->enrollment_status) }}
                  </span>
                </td>
                --}}
                <td data-face-status="{{ $student->face_registration_status ?? 'not_registered' }}">
                  @if($student->face_registration_status === 'registered')
                    <span class="badge bg-success">
                      <i class="ri-check-line me-1"></i>Registered
                    </span>
                  @else
                    <span class="badge bg-warning">
                      <i class="ri-close-line me-1"></i>Not Registered
                    </span>
                  @endif
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button type="button" class="btn btn-sm btn-outline-primary" 
                            onclick="viewStudent({{ $student->id }})"
                            title="View Profile">
                      <i class="ri-eye-line"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-success" 
                            onclick="registerFace({{ $student->id }})"
                            title="Register Face">
                      <i class="ri-camera-line"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-warning" 
                            data-bs-toggle="modal" data-bs-target="#recordViolationModal"
                            data-student-id="{{ $student->id }}"
                            data-student-name="{{ $student->first_name }} {{ $student->last_name }}"
                            title="Record Violation">
                      <i class="ri-alert-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
              @empty
              <tr>
                <td colspan="5" class="text-center py-5">
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
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Facial Recognition Scanner Modal -->
  <div class="modal fade" id="facialRecognitionModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ri-camera-line me-2"></i>Facial Recognition Scanner
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-8">
              <div class="text-center">
                <video id="video" width="100%" height="300" autoplay style="display: none;"></video>
                <div id="cameraPlaceholder" class="border rounded p-5 text-center" style="height: 300px; background: #f8f9fa;">
                  <i class="ri-camera-line display-1 text-muted"></i>
                  <p class="text-muted">Click "Start Camera" to begin facial recognition</p>
                </div>
                <canvas id="canvas" style="display: none;"></canvas>
              </div>
              <div class="text-center mt-3">
                <button type="button" class="btn btn-primary" id="startCamera">
                  <i class="ri-camera-line me-2"></i>Start Camera
                </button>
                <button type="button" class="btn btn-success" id="capturePhoto" style="display: none;">
                  <i class="ri-camera-3-line me-2"></i>Capture Photo
                </button>
                <button type="button" class="btn btn-danger" id="stopCamera" style="display: none;">
                  <i class="ri-stop-line me-2"></i>Stop Camera
                </button>
              </div>
            </div>
            <div class="col-md-4">
              <h6>Instructions:</h6>
              <ul class="list-unstyled">
                <li><i class="ri-check-line text-success me-2"></i>Look directly at the camera</li>
                <li><i class="ri-check-line text-success me-2"></i>Ensure good lighting</li>
                <li><i class="ri-check-line text-success me-2"></i>Remove glasses if possible</li>
                <li><i class="ri-check-line text-success me-2"></i>Keep face within frame</li>
              </ul>
              
              <div id="recognitionResult" style="display: none;">
                <h6>Recognition Result:</h6>
                <div id="resultContent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Face Registration Modal -->
  <div class="modal fade" id="faceRegistrationModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ri-user-add-line me-2"></i>Register Student Face
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-md-6">
              <h6>Student Information:</h6>
              <div id="studentInfoForRegistration"></div>
            </div>
            <div class="col-md-6">
              <h6>Face Registration:</h6>
              <div class="text-center">
                <video id="registrationVideo" width="100%" height="200" autoplay style="display: none;"></video>
                <div id="registrationPlaceholder" class="border rounded p-3 text-center" style="height: 200px; background: #f8f9fa;">
                  <i class="ri-camera-line display-4 text-muted"></i>
                  <p class="text-muted">Camera for registration</p>
                </div>
                <canvas id="registrationCanvas" style="display: none;"></canvas>
              </div>
              <div class="text-center mt-3">
                <button type="button" class="btn btn-primary" id="startRegistrationCamera">
                  <i class="ri-camera-line me-2"></i>Start Camera
                </button>
                <button type="button" class="btn btn-success" id="captureRegistrationPhoto" style="display: none;">
                  <i class="ri-camera-3-line me-2"></i>Capture & Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


<!-- Record Violation Modal -->
<div class="modal fade" id="recordViolationModal" tabindex="-1">
  <div class="modal-dialog modal-lg">
    <form id="recordViolationForm" class="modal-content" enctype="multipart/form-data">
      @csrf
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="ri-alert-line me-2"></i>Record Violation
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>

      <div class="modal-body">
        <!-- Hidden Fields -->
        <input type="hidden" name="student_id" id="violationStudentId">
        <input type="hidden" name="reported_by" value="{{ auth()->id() }}">

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Student</label>
              <p id="violationStudentName" class="mb-0 text-muted">Select a student first</p>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Violation Type</label>
              <select class="form-select" name="violation_type" required>
                <option value="">-- Select Type --</option>
                <option value="uniform">Uniform</option>
                <option value="technology">Technology</option>
                <option value="appearance">Appearance</option>
                <option value="behavior">Behavior</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Severity</label>
              <select class="form-select" name="severity" id="violationSeverity" required>
                <option value="">-- Select Severity --</option>
                <option value="minor">Minor Offense</option>
                <option value="major">Major Offense</option>
              </select>
            </div>

            <div class="mb-3 d-none" id="majorCategoryWrapper">
              <label class="form-label fw-bold">Major Category</label>
              <select class="form-select" name="major_category" id="majorCategory">
                <option value="">-- Select Category --</option>
                <option value="Category 1">Category 1</option>
                <option value="Category 2">Category 2</option>
                <option value="Category 3">Category 3</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Title/Offense</label>
              <select class="form-select" name="title" id="violationTitle" required>
                <option value="">-- Select Offense --</option>
              </select>
              <small class="text-muted">Select severity and category first to see available offenses</small>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label fw-bold">Violation Date</label>
              <input type="date" class="form-control" name="violation_date" id="violationDate" value="{{ now()->toDateString() }}" required>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Violation Time</label>
              <input type="time" class="form-control" name="violation_time" value="{{ now()->format('H:i') }}">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Location</label>
              <input type="text" class="form-control" name="location" id="violationLocation" placeholder="e.g., Classroom, Cafeteria, Playground">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Witnesses</label>
              <div id="witnessesContainer">
                <div class="input-group mb-2">
                  <input type="text" class="form-control" name="witnesses[]" placeholder="Witness name">
                  <button type="button" class="btn btn-outline-secondary" onclick="addWitnessField()">
                    <i class="ri-add-line"></i>
                  </button>
                </div>
              </div>
              <small class="text-muted">Add multiple witnesses if needed</small>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <div class="mb-3">
              <label class="form-label fw-bold">Description / Details</label>
              <textarea class="form-control" name="description" id="violationDescription" rows="3" placeholder="Provide detailed description of the violation..." required></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Attachments</label>
              <input type="file" class="form-control" name="attachments[]" multiple accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" required>
              <small class="text-muted">You must select at least one file (images, PDFs, documents)</small>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary">Submit Violation</button>
      </div>
    </form>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const severitySelect = document.getElementById('violationSeverity');
  const majorCategoryWrapper = document.getElementById('majorCategoryWrapper');

  severitySelect.addEventListener('change', () => {
    majorCategoryWrapper.classList.toggle('d-none', severitySelect.value !== 'major');
  });

  const violationModal = document.getElementById('recordViolationModal');
  violationModal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget;
    if (!button) return; // safeguard

    document.getElementById('violationStudentId').value = button.dataset.studentId;
    document.getElementById('violationStudentName').textContent = button.dataset.studentName;
  });
});

function addWitnessField() {
  const container = document.getElementById('witnessesContainer');
  const div = document.createElement('div');
  div.className = 'input-group mb-2';
  div.innerHTML = `
    <input type="text" class="form-control" name="witnesses[]" placeholder="Witness name">
    <button type="button" class="btn btn-outline-danger" onclick="removeWitnessField(this)">
      <i class="ri-delete-bin-line"></i>
    </button>
  `;
  container.appendChild(div);
}

function removeWitnessField(button) {
  button.closest('.input-group').remove();
}
</script>


</x-guidance-layout>