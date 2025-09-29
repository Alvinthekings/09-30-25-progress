<x-guidance-layout>

  @vite(['resources/js/app.js', 'resources/css/guidance_student-violations.css', 'resources/js/guidance_student-violations.js'])


      <!-- MAIN CONTENT -->
      <main class="col-12 col-md-10 px-4 py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="section-title mb-0">Violations Management</h1>
          <div class="d-flex align-items-center gap-3">
            <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#recordViolationModal">
              <i class="ri-add-line me-2"></i>Report New Violation
            </button>
            <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#facialRecognitionModal">
              <i class="ri-camera-line me-2"></i>Face Scanner
            </button>
            <div class="text-muted">
              <i class="ri-calendar-line me-1"></i>{{ now()->format('F j, Y') }}
            </div>
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

        <!-- STATISTICS CARDS -->
        <div class="row g-3 mb-4">
          <div class="col-6 col-lg-3">
            <div class="card card-summary stats-card h-100" style="background-color: #ffc107;">
              <div class="card-body text-center">
                <i class="ri-time-line display-6 mb-2"></i>
                <div>Pending</div>
                <h3>{{ $stats['pending'] ?? 0 }}</h3>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card card-summary stats-card h-100" style="background-color: #17a2b8;">
              <div class="card-body text-center">
                <i class="ri-search-line display-6 mb-2"></i>
                <div>Investigating</div>
                <h3>{{ $stats['investigating'] ?? 0 }}</h3>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card card-summary stats-card h-100" style="background-color: #28a745;">
              <div class="card-body text-center">
                <i class="ri-check-line display-6 mb-2"></i>
                <div>Resolved</div>
                <h3>{{ $stats['resolved'] ?? 0 }}</h3>
              </div>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card card-summary stats-card h-100" style="background-color: #dc3545;">
              <div class="card-body text-center">
                <i class="ri-error-warning-line display-6 mb-2"></i>
                <div>Severe Cases</div>
                <h3>{{ $stats['severe'] ?? 0 }}</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- SEARCH AND FILTER SECTION -->
        <div class="search-filter-section">
          <div class="row align-items-end">
            <div class="col-md-3">
              <label for="searchInput" class="form-label fw-bold">Search Violations</label>
              <div class="input-group">
                <span class="input-group-text"><i class="ri-search-line"></i></span>
                <input type="text" class="form-control" id="searchInput" placeholder="Search violations...">
              </div>
            </div>
            <div class="col-md-2">
              <label for="statusFilter" class="form-label fw-bold">Status</label>
              <select class="form-select" id="statusFilter">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="severityFilter" class="form-label fw-bold">Severity</label>
              <select class="form-select" id="severityFilter">
                <option value="">All Severities</option>
                <option value="minor">Minor Offense</option>
                <option value="major">Major Offense</option>
              </select>
            </div>
            <div class="col-md-2">
              <label for="typeFilter" class="form-label fw-bold">Type</label>
              <select class="form-select" id="typeFilter">
                <option value="">All Types</option>
                <option value="uniform">Uniform</option>
                <option value="technology">Technology</option>
                <option value="appearance">Appearance</option>
                <option value="behavior">Behavior</option>
                <option value="academic">Academic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="col-md-3">
              <label for="dateFilter" class="form-label fw-bold">Date Filter</label>
              <input type="date" class="form-control" id="dateFilter" title="Filter by date">
            </div>
          </div>
        </div>

        <!-- VIOLATIONS TABLE -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Violations List</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-hover align-middle" id="violationsTable">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Student</th>
                    <th>Violation</th>
                    <th>Type</th>
                    <th>Severity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @forelse($violations as $violation)
                  <tr>
                    <td>#{{ $violation->id }}</td>
                    <td>
                      <div>
                        <strong>{{ $violation->student->first_name }} {{ $violation->student->last_name }}</strong>
                        <br><small class="text-muted">{{ $violation->student->student_id }}</small>
                      </div>
                    </td>
                    <td>
                      <strong>{{ $violation->title }}</strong>
                      <br><small class="text-muted">{{ Str::limit($violation->description, 50) }}</small>
                    </td>
                    <td>
                      <span class="badge bg-secondary">{{ ucfirst($violation->violation_type) }}</span>
                    </td>
                    <td>
                      <span class="badge bg-{{ $violation->severity === 'minor' ? 'success' : 'warning' }}">
                        {{ $violation->severity === 'minor' ? 'Minor Offense' : 'Major Offense' }}
                      </span>
                    </td>
                    <td>
                      {{ $violation->violation_date->format('M d, Y') }}
                      @if($violation->violation_time)
                        <br><small class="text-muted">{{ date('h:i A', strtotime($violation->violation_time)) }}</small>
                      @endif
                    </td>
                    <td>
                      <span class="badge bg-{{ $violation->status === 'pending' ? 'warning' : ($violation->status === 'resolved' ? 'success' : 'info') }}">
                        {{ ucfirst($violation->status) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-primary"
                                onclick="viewViolation({{ $violation->id }})"
                                title="View Details">
                          <i class="ri-eye-line"></i>
                        </button>
                        @if($violation->status !== 'resolved')
                        <button type="button" class="btn btn-sm btn-outline-warning"
                                onclick="editViolation({{ $violation->id }})"
                                title="Edit">
                          <i class="ri-edit-line"></i>
                        </button>
                        @endif
                        <button type="button" class="btn btn-sm btn-outline-danger"
                                onclick="deleteViolation({{ $violation->id }})"
                                title="Delete">
                          <i class="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  @empty
                  <tr>
                    <td colspan="8" class="text-center py-5">
                      <i class="ri-alert-line display-4 text-muted"></i>
                      <p class="text-muted mt-2">No violations found</p>
                    </td>
                  </tr>
                  @endforelse
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            @if($violations->hasPages())
            <div class="d-flex justify-content-between align-items-center mt-4">
              <div>
                <small class="text-muted">
                  Showing {{ $violations->firstItem() ?: 0 }} to {{ $violations->lastItem() ?: 0 }}
                  of {{ $violations->total() }} violations
                </small>
              </div>
              {{ $violations->links() }}
            </div>
            @endif
          </div>
        </div>

      </main>
    </div>
  </div>



  <!-- View Violation Modal -->
  <div class="modal fade" id="viewViolationModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="ri-eye-line me-2"></i>Violation Details
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="viewViolationModalBody">
          <!-- Violation details will be loaded here -->
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="hideModal('viewViolationModal')">Close</button>
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
        <input type="hidden" name="reported_by" value="{{ auth()->id() }}">

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label class="form-label fw-bold">Student</label>
                <select class="form-select" id="violationStudentSelect" name="student_id" required>
                  <option value="">Select Student</option>
                  @foreach($students as $student)
                    <option value="{{ $student->id }}">
                      {{ $student->first_name }} {{ $student->last_name }}
                      ({{ $student->student_id ?: 'No ID' }})
                    </option>
                  @endforeach
                </select>
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

  <!-- Edit Violation Modal -->
<div class="modal fade" id="editViolationModal" tabindex="-1" aria-labelledby="editViolationModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="editViolationModalLabel">Edit Violation</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="editViolationForm" method="POST">
                <div class="modal-body">
                    <div id="editViolationModalBody">
                        <!-- Content will be loaded here dynamically -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Violation</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const severitySelect = document.getElementById('violationSeverity');
  const majorCategoryWrapper = document.getElementById('majorCategoryWrapper');

  severitySelect.addEventListener('change', () => {
    majorCategoryWrapper.classList.toggle('d-none', severitySelect.value !== 'major');
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
