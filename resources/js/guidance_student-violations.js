// Global functions for CRUD operations (must be in global scope)
console.log('Defining global functions...');

// Global debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.editViolation = function(violationId) {
    console.log('🚀 editViolation called with id:', violationId);

    // Show loading state immediately
    const modalBody = document.getElementById('editViolationModalBody');
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading violation data for ID: ${violationId}...</p>
            </div>
        `;
    }

    // Show modal immediately
    try {
        window.ModalManager.show('editViolationModal');
        console.log('✅ Modal shown successfully');
    } catch (modalError) {
        console.error('❌ Modal error:', modalError);
    }

    // Fetch violation data for editing
    console.log('📡 Making API call to:', `/guidance/violations/${violationId}/edit`);
    
    fetch(`/guidance/violations/${violationId}/edit`)
        .then(response => {
            console.log('📡 Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                url: response.url
            });

            if (!response.ok) {
                // Handle HTTP errors (404, 500, etc.)
                if (response.status === 404) {
                    throw new Error(`Violation not found (404). Check if the ID ${violationId} exists.`);
                } else if (response.status === 500) {
                    throw new Error('Server error (500). Please check the server logs.');
                } else {
                    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
                }
            }
            
            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
            
            return response.json();
        })
        .then(data => {
            console.log('✅ Data received:', data);
            
            if (!data) {
                throw new Error('No data received from server');
            }
            
            if (!data.violation) {
                throw new Error('No violation data in response');
            }

            const violation = data.violation;
            const students = data.students || [];

            console.log('📝 Violation data:', violation);
            console.log('👥 Students data:', students);

            // Update form action
            const form = document.getElementById('editViolationForm');
            if (!form) {
                throw new Error('Edit form not found');
            }
            form.action = `/guidance/violations/${violationId}`;

            // Use the same structure as viewViolation but with editable inputs
            const canChangeStudent = data.can_change_student !== false;
            const studentSelectDisabled = canChangeStudent ? '' : 'disabled';
            const studentSelectHelp = canChangeStudent ? '' : '<small class="text-muted">Student cannot be changed as they have existing violation records.</small>';

            // Populate modal body
            modalBody.innerHTML = `
                <div class="alert alert-success alert-dismissible fade show">
                    <strong>Success!</strong> Loaded violation data for editing.
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <div class="row">
                    <!-- Left Column: Student Info & Basic Violation Details -->
                    <div class="col-lg-6">
                        <h6 class="mb-3">Student Information</h6>
                        <div class="row g-2">
                            <div class="col-12">
                                <label class="form-label fw-bold small">Student Name</label>
                                <select class="form-select form-select-sm" id="edit_student_id" name="student_id" required ${studentSelectDisabled}>
                                    ${students.length > 0 ? students.map(student => `
                                        <option value="${student.id}" ${student.id == (violation.student ? violation.student.id : violation.student_id) ? 'selected' : ''}>
                                            ${student.first_name} ${student.last_name} (${student.student_id || 'No ID'})
                                        </option>
                                    `).join('') : '<option value="">No students available</option>'}
                                </select>
                                ${studentSelectHelp}
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-bold small">Student ID</label>
                                <input type="text" class="form-control form-control-sm" value="${violation.student_id || 'N/A'}" readonly>
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small">Grade</label>
                                <input type="text" class="form-control form-control-sm" value="${violation.grade_level || 'N/A'}" readonly>
                            </div>
                            <div class="col-3">
                                <label class="form-label fw-bold small">Section</label>
                                <input type="text" class="form-control form-control-sm" value="${violation.section || 'N/A'}" readonly>
                            </div>
                        </div>

                        <h6 class="mt-3 mb-3">Violation Details</h6>
                        <div class="mb-2">
                            <label class="form-label fw-bold small">Title</label>
                            <input type="text" class="form-control form-control-sm" id="edit_title" name="title" value="${violation.title || ''}" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-bold small">Description</label>
                            <textarea class="form-control form-control-sm" id="edit_description" name="description" rows="2" required>${violation.description || ''}</textarea>
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label fw-bold small">Severity</label>
                                <select class="form-select form-select-sm" id="edit_severity" name="severity" required>
                                    <option value="minor" ${violation.severity === 'minor' ? 'selected' : ''}>Minor</option>
                                    <option value="major" ${violation.severity === 'major' ? 'selected' : ''}>Major</option>
                                </select>
                            </div>
                            <div class="col-6" id="edit_major_category_wrapper" style="display: ${violation.severity === 'major' ? 'block' : 'none'};">
                                <label class="form-label fw-bold small">Major Category</label>
                                <select class="form-select form-select-sm" id="edit_major_category" name="major_category">
                                    <option value="">-- Select Category --</option>
                                    <option value="Category 1" ${violation.major_category === 'Category 1' ? 'selected' : ''}>Category 1</option>
                                    <option value="Category 2" ${violation.major_category === 'Category 2' ? 'selected' : ''}>Category 2</option>
                                    <option value="Category 3" ${violation.major_category === 'Category 3' ? 'selected' : ''}>Category 3</option>
                                </select>
                            </div>
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label fw-bold small">Status</label>
                                <select class="form-select form-select-sm" id="edit_status" name="status" required>
                                    <option value="pending" ${violation.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="investigating" ${violation.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                                    <option value="resolved" ${violation.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                    <option value="dismissed" ${violation.status === 'dismissed' ? 'selected' : ''}>Dismissed</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-bold small">Location</label>
                                <input type="text" class="form-control form-control-sm" id="edit_location" name="location" value="${violation.location || ''}">
                            </div>
                        </div>
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label fw-bold small">Date</label>
                                <input type="date" class="form-control form-control-sm" id="edit_violation_date" name="violation_date" value="${violation.violation_date ? (violation.violation_date.includes('T') ? violation.violation_date.split('T')[0] : violation.violation_date) : ''}" required>
                            </div>
                            <div class="col-6">
                                <label class="form-label fw-bold small">Time</label>
                                <input type="time" class="form-control form-control-sm" id="edit_violation_time" name="violation_time" value="${violation.violation_time ? (violation.violation_time.length > 5 ? violation.violation_time.substring(0, 5) : violation.violation_time) : ''}">
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Investigation & Resolution Details -->
                    <div class="col-lg-6">
                        <h6 class="mb-3">Investigation Details</h6>
                        <div class="mb-2">
                            <label class="form-label fw-bold small">Witnesses</label>
                            <div id="edit_witnesses_container">
                                ${(violation.witnesses && Array.isArray(violation.witnesses) && violation.witnesses.length > 0) ? violation.witnesses.map(witness => `
                                    <div class="input-group input-group-sm mb-1">
                                        <input type="text" class="form-control" name="witnesses[]" value="${witness}" placeholder="Witness name">
                                        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeWitnessField(this)">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </div>
                                `).join('') : `
                                    <div class="input-group input-group-sm mb-1">
                                        <input type="text" class="form-control" name="witnesses[]" placeholder="Witness name">
                                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="addWitnessField()">
                                            <i class="ri-add-line"></i>
                                        </button>
                                    </div>
                                `}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold small">Student Statement</label>
                            <textarea class="form-control form-control-sm" id="edit_student_statement" name="student_statement" rows="3">${violation.student_statement || ''}</textarea>
                        </div>

                        <h6 class="mt-3 mb-3">Resolution Details</h6>
                        <div class="mb-2" id="edit_resolution_wrapper" style="display: ${(violation.status === 'resolved' || violation.status === 'dismissed') ? 'block' : 'none'};">
                            <label class="form-label fw-bold small">Resolution</label>
                            <textarea class="form-control form-control-sm" id="edit_resolution" name="resolution" rows="2">${violation.resolution || ''}</textarea>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-bold small">Disciplinary Action</label>
                            <textarea class="form-control form-control-sm" id="edit_disciplinary_action" name="disciplinary_action" rows="2">${violation.disciplinary_action || ''}</textarea>
                        </div>
                        <div class="mb-2">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="edit_parent_notified" name="parent_notified" value="1" ${violation.parent_notified ? 'checked' : ''}>
                                <label class="form-check-label fw-bold small" for="edit_parent_notified">
                                    Parent/Guardian Notified
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold small">Additional Notes</label>
                            <textarea class="form-control form-control-sm" id="edit_notes" name="notes" rows="3">${violation.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
            `;

            console.log('✅ Modal populated successfully');

            // Add event listeners for dynamic form behavior
            const editSeveritySelect = document.getElementById('edit_severity');
            const editMajorCategoryWrapper = document.getElementById('edit_major_category_wrapper');
            const editStatusSelect = document.getElementById('edit_status');
            const editResolutionWrapper = document.getElementById('edit_resolution_wrapper');

            if (editSeveritySelect) {
                editSeveritySelect.addEventListener('change', function() {
                    if (editMajorCategoryWrapper) {
                        editMajorCategoryWrapper.style.display = this.value === 'major' ? 'block' : 'none';
                    }
                });
            }

            if (editStatusSelect) {
                editStatusSelect.addEventListener('change', function() {
                    if (editResolutionWrapper) {
                        editResolutionWrapper.style.display = (this.value === 'resolved' || this.value === 'dismissed') ? 'block' : 'none';
                    }
                });
            }

            // Add witness field management functions
            window.addWitnessField = function() {
                const container = document.getElementById('edit_witnesses_container');
                const newInput = document.createElement('div');
                newInput.className = 'input-group mb-2';
                newInput.innerHTML = `
                    <input type="text" class="form-control" name="witnesses[]" placeholder="Witness name">
                    <button type="button" class="btn btn-outline-danger" onclick="removeWitnessField(this)">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                `;
                container.appendChild(newInput);
            };

            window.removeWitnessField = function(button) {
                button.closest('.input-group').remove();
            };

            // Add form submission handler
            const currentViolationId = violationId;
            form.onsubmit = async function(e) {
                e.preventDefault();
                console.log('📤 Form submission started');

                // Validate required fields
                const descriptionValue = form.description.value.trim();
                if (!descriptionValue) {
                    alert('Description is required.');
                    return;
                }

                // Collect and filter witnesses (remove empty ones)
                const witnessInputs = form.querySelectorAll('input[name="witnesses[]"]');
                const witnesses = Array.from(witnessInputs).map(input => input.value.trim()).filter(value => value.length > 0);

                const formData = new FormData(form);
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

                // Set trimmed description
                formData.set('description', descriptionValue);

                // Remove existing witnesses and add filtered ones
                formData.delete('witnesses[]');
                witnesses.forEach(witness => formData.append('witnesses[]', witness));

                // Add CSRF token and method spoofing
                formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));
                formData.append('_method', 'PUT');

                // Handle checkbox explicitly
                const parentNotifiedCheckbox = form.querySelector('#edit_parent_notified');
                if (parentNotifiedCheckbox) {
                    formData.set('parent_notified', parentNotifiedCheckbox.checked ? '1' : '0');
                }

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="ri-loader-line me-2 spinner-border spinner-border-sm"></i>Updating...';

                try {
                    const response = await fetch(form.action, {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Accept': 'application/json'
                        }
                    });

                    console.log('📡 Update response status:', response.status);

                    if (!response.ok) {
                        const errorData = await response.json();
                        let errorMsg = 'Update failed with status: ' + response.status;
                        if (errorData.errors) {
                            errorMsg += '\n\nValidation errors:';
                            Object.keys(errorData.errors).forEach(field => {
                                errorMsg += '\n- ' + field + ': ' + errorData.errors[field].join(', ');
                            });
                        }
                        if (errorData.message) {
                            errorMsg += '\n\nMessage: ' + errorData.message;
                        }
                        throw new Error(errorMsg);
                    }

                    const data = await response.json();
                    if (data.success) {
                        console.log('✅ Update successful:', data);
                        window.ModalManager.hide('editViolationModal');

                        // Show success message
                        const alertDiv = document.createElement('div');
                        alertDiv.className = 'alert alert-success alert-dismissible fade show';
                        alertDiv.innerHTML = `
                            <strong>Success!</strong> ${data.message}
                            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                        `;

                        const mainContent = document.querySelector('main');
                        mainContent.insertBefore(alertDiv, mainContent.firstChild);

                        // Auto-dismiss after 3 seconds
                        setTimeout(() => {
                            if (alertDiv.parentNode) {
                                alertDiv.remove();
                            }
                        }, 3000);

                        // Update the row in the table instead of full reload
                        if (typeof updateViolationRow === 'function') {
                            updateViolationRow(currentViolationId, data.violation);
                        } else {
                            console.warn('updateViolationRow function not found, reloading page');
                            window.location.reload();
                        }
                    } else {
                        throw new Error(data.message || 'Update failed');
                    }
                } catch (error) {
                    console.error('❌ Form submission error:', error);

                    // Show error message
                    const alertDiv = document.createElement('div');
                    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
                    alertDiv.innerHTML = `
                        <strong>Error!</strong> ${error.message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    `;

                    modalBody.insertBefore(alertDiv, modalBody.firstChild);

                    // Auto-dismiss after 5 seconds
                    setTimeout(() => {
                        if (alertDiv.parentNode) {
                            alertDiv.remove();
                        }
                    }, 5000);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
            };
        })
        .catch(error => {
            console.error('❌ Fetch error:', error);
            
            // Show detailed error in modal
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="alert alert-danger">
                        <h6>Error Loading Violation</h6>
                        <p><strong>${error.message}</strong></p>
                        <p>URL: <code>/guidance/violations/${violationId}/edit</code></p>
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-secondary" onclick="window.ModalManager.hide('editViolationModal')">
                                Close
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="window.editViolation(${violationId})">
                                Retry
                            </button>
                        </div>
                    </div>
                `;
            }
            
            alert('Failed to load violation: ' + error.message);
        });
};
console.log('editViolation function defined on window:', typeof window.editViolation);

// Helper function to get violation title
function getViolationTitle() {
    const violationTitleSelect = document.getElementById('violationTitle');
    const customInput = document.getElementById('customOffenseText');

    if (!violationTitleSelect) {
        throw new Error('Violation title element is missing.');
    }

    if (violationTitleSelect.value === 'custom' && customInput && customInput.value.trim()) {
        return customInput.value.trim();
    }
    return violationTitleSelect.value;
}

document.addEventListener('DOMContentLoaded', function() {
    // Offense library
    const offenseOptions = {
        minor: [
            "Not wearing of prescribed uniform and Improper wearing of school ID",
            "Unauthorized use of cellphones and other electronic gadgets inside the classroom",
            "Wearing earrings (for male students) and multiple earrings (for female students)",
            "Not sporting the prescribed haircut",
            "Unauthorized use of electronic gadgets inside the classroom",
            "Loitering inside the school"
        ],
        major: {
            "Category 1": [
                "Borrowing, lending, and tampering of school ID",
                "Disrespect to school logo",
                "Unauthorized use of school forms",
                "Loitering inside the campus",
                "Littering inside the campus",
                "Eating outside the classroom during class hours",
                "Non-observance of Clean As You Go policy",
                "Using profane and indecent language",
                "Bringing pornographic materials and browsing pornographic sites",
                "Smoking, e-cigarettes and similar acts",
                "Participating in any form of gambling",
                "Threatening fellow students",
                "Leaving the school without a valid gate pass",
                "Making an alarming fake bomb or fire threat or joke",
                "Any offense analogous to the above"
            ],
            "Category 2": [
                "Disrespecting the Philippine flag and other national / institutional symbols",
                "Vandalism inside the campus",
                "Engaging in immodest act such as public display of affection",
                "Bringing intoxicating drinks or alcoholic beverages",
                "Cheating during examination / acting as accomplice",
                "Tampering with test scores",
                "Cutting classes",
                "Gross scandalous behavior inside/outside the campus",
                "Act that malign the good name and reputation of the school",
                "Withholding information during formal investigation",
                "Habitual disregard to school policies",
                "Any offense analogous to the above"
            ],
            "Category 3": [
                "Bullying including physical, emotional and cyberbullying",
                "Forging the signature of parents/guardian in school documents",
                "Forging the signature of teachers or persons in authority",
                "Assaulting or showing disrespect to teachers or persons in authority",
                "Disrespectful or abusive behavior towards any faculty member",
                "Possession, pushing, use of dangerous drugs, deadly weapons or explosives",
                "Recruiting or engaging in pseudo fraternities / gangs",
                "Engaging in fight and assaulting fellow students",
                "Hazing, extortion and engaging in pre-marital sex",
                "Deception of school authorities",
                "Stealing school or others' personal property",
                "Any offense analogous to the above"
            ]
        }
    };

    // Create reverse mapping: title -> {severity, category}
    const titleToSeverityMap = {};
    offenseOptions.minor.forEach(title => {
        titleToSeverityMap[title] = { severity: 'minor', category: null };
    });
    Object.keys(offenseOptions.major).forEach(category => {
        offenseOptions.major[category].forEach(title => {
            titleToSeverityMap[title] = { severity: 'major', category: category };
        });
    });

    // Show/hide major category based on severity
    const severitySelect = document.getElementById('violationSeverity');
    const majorCategoryWrapper = document.getElementById('majorCategoryWrapper');
    const majorCategorySelect = document.getElementById('majorCategory');
    const violationTitleSelect = document.getElementById('violationTitle');

    // Function to update offense dropdown based on selection
    function updateOffenseDropdown() {
        const severity = severitySelect.value;
        const majorCategory = majorCategorySelect.value;

        // If no severity selected, show all offenses
        if (!severity) {
            populateAllOffenses();
            return;
        }

        // Clear current options
        violationTitleSelect.innerHTML = '<option value="">-- Select Offense --</option>';

        if (severity === 'minor') {
            // Populate with minor offenses
            offenseOptions.minor.forEach(offense => {
                const option = document.createElement('option');
                option.value = offense;
                option.textContent = offense;
                violationTitleSelect.appendChild(option);
            });
        } else if (severity === 'major' && majorCategory) {
            // Populate with major offenses from selected category
            if (offenseOptions.major[majorCategory]) {
                offenseOptions.major[majorCategory].forEach(offense => {
                    const option = document.createElement('option');
                    option.value = offense;
                    option.textContent = offense;
                    violationTitleSelect.appendChild(option);
                });
            }
        }

        // Show custom input if no offenses are available or user wants to add custom
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '-- Custom Offense --';
        violationTitleSelect.appendChild(customOption);
    }

    // Event listeners for dropdown changes
    if (severitySelect) {
        severitySelect.addEventListener('change', function() {
            if (this.value === 'major') {
                majorCategoryWrapper.classList.remove('d-none');
                // Reset and update offenses when switching to major
                majorCategorySelect.value = '';
                updateOffenseDropdown();
            } else {
                majorCategoryWrapper.classList.add('d-none');
                updateOffenseDropdown();
            }
        });
    }

    if (majorCategorySelect) {
        majorCategorySelect.addEventListener('change', function() {
            updateOffenseDropdown();
        });
    }

    // Handle title selection and custom offense input
    if (violationTitleSelect) {
        violationTitleSelect.addEventListener('change', function() {
            const selectedTitle = this.value;

            // Automatically determine severity and category if title is predefined
            if (selectedTitle && selectedTitle !== 'custom' && titleToSeverityMap[selectedTitle]) {
                const mapping = titleToSeverityMap[selectedTitle];
                severitySelect.value = mapping.severity;

                if (mapping.severity === 'major') {
                    majorCategoryWrapper.classList.remove('d-none');
                    majorCategorySelect.value = mapping.category;

                    // For major violations, disable student search and show incident form
                    const studentSearchInput = document.getElementById('violationStudentSearch');
                    if (studentSearchInput) {
                        studentSearchInput.disabled = true;
                        studentSearchInput.placeholder = "Student name disabled for major violations";
                    }

                    // Hide the record violation modal and show incident form
                    window.ModalManager.hide('recordViolationModal');
                    showIncidentForm();
                } else {
                    majorCategoryWrapper.classList.add('d-none');
                    majorCategorySelect.value = '';

                    // Re-enable student search for minor violations
                    const studentSearchInput = document.getElementById('violationStudentSearch');
                    if (studentSearchInput) {
                        studentSearchInput.disabled = false;
                        studentSearchInput.placeholder = "Type student name or ID...";
                    }
                }

                // Re-select the current title
                this.value = selectedTitle;
            }

            // Handle custom offense input
            const existingCustomInput = document.querySelector('#customOffenseInput');
            if (selectedTitle === 'custom') {
                if (!existingCustomInput) {
                    // Create custom input field
                    const inputGroup = document.createElement('div');
                    inputGroup.className = 'input-group mt-2';
                    inputGroup.id = 'customOffenseInput';
                    inputGroup.innerHTML = `
                        <input type="text" class="form-control" id="customOffenseText" placeholder="Enter custom offense...">
                        <button type="button" class="btn btn-outline-secondary" onclick="useCustomOffense()">Use</button>
                    `;
                    violationTitleSelect.parentNode.appendChild(inputGroup);
                }
            } else if (existingCustomInput) {
                existingCustomInput.remove();
            }
        });
    }

    // Function to populate all offenses into the title dropdown
    function populateAllOffenses() {
        if (!violationTitleSelect) return;

        // Clear current options
        violationTitleSelect.innerHTML = '<option value="">-- Select Offense --</option>';

        // Add minor offenses
        offenseOptions.minor.forEach(offense => {
            const option = document.createElement('option');
            option.value = offense;
            option.textContent = offense;
            violationTitleSelect.appendChild(option);
        });

        // Add major offenses from all categories
        Object.keys(offenseOptions.major).forEach(category => {
            offenseOptions.major[category].forEach(offense => {
                const option = document.createElement('option');
                option.value = offense;
                option.textContent = offense;
                violationTitleSelect.appendChild(option);
            });
        });

        // Add custom option
        const customOption = document.createElement('option');
        customOption.value = 'custom';
        customOption.textContent = '-- Custom Offense --';
        violationTitleSelect.appendChild(customOption);
    }

    // Set student info when modal is shown
    const violationModal = document.getElementById('recordViolationModal');
    if (violationModal) {
        violationModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const studentId = button ? button.getAttribute('data-student-id') : null;

            // Reset student search fields
            const studentSearchInput = document.getElementById('violationStudentSearch');
            const studentIdInput = document.getElementById('violationStudentId');
            const studentSuggestions = document.getElementById('studentSuggestions');

            if (studentSearchInput) studentSearchInput.value = '';
            if (studentIdInput) studentIdInput.value = '';
            if (studentSuggestions) studentSuggestions.style.display = 'none';

            // Reset form
            if (severitySelect) severitySelect.value = '';
            if (majorCategoryWrapper) majorCategoryWrapper.classList.add('d-none');
            if (majorCategorySelect) majorCategorySelect.value = '';

            // Populate all offenses in the title dropdown
            populateAllOffenses();

            // Remove custom input if exists
            const customInput = document.getElementById('customOffenseInput');
            if (customInput) customInput.remove();
        });
    }

    // Form submission handler
    const violationForm = document.getElementById('recordViolationForm');
    if (violationForm) {
        violationForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            // Show loading state
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;

            try {
                // Check if required elements exist
                const violationForm = document.getElementById('recordViolationForm');
                const studentIdEl = document.getElementById('violationStudentId');
                const severityEl = document.getElementById('violationSeverity');
                const descriptionEl = document.getElementById('violationDescription');
                const dateEl = document.getElementById('violationDate');
                const locationEl = document.getElementById('violationLocation');
                const csrfTokenEl = document.querySelector('meta[name="csrf-token"]');

                if (!violationForm || !studentIdEl || !severityEl || !descriptionEl || !dateEl || !locationEl || !csrfTokenEl) {
                    throw new Error('Form elements are missing. Please refresh the page and try again.');
                }

                // Add CSRF token to form if not present
                if (!violationForm.querySelector('input[name="_token"]')) {
                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = '_token';
                    tokenInput.value = csrfTokenEl.getAttribute('content');
                    violationForm.appendChild(tokenInput);
                }

                // Ensure title is set for custom offenses
                getViolationTitle(); // This will set the select value if custom

                // Get form data including files and all form fields
                const formData = new FormData(violationForm);
                formData.append('status', 'pending');

                console.log('Submitting violation data:', {
                    student_id: formData.get('student_id'),
                    title: formData.get('title'),
                    severity: formData.get('severity'),
                    description: formData.get('description')
                });

                const response = await fetch('/guidance/violations', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfTokenEl.getAttribute('content'),
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorData = await response.json();
                    let errorMsg = 'Submission failed with status: ' + response.status;
                    if (errorData.errors) {
                        errorMsg += '\n\nValidation errors:';
                        Object.keys(errorData.errors).forEach(field => {
                            errorMsg += '\n- ' + field + ': ' + errorData.errors[field].join(', ');
                        });
                    }
                    if (errorData.message) {
                        errorMsg += '\n\nMessage: ' + errorData.message;
                    }
                    throw new Error(errorMsg);
                }

                const data = await response.json();
                if (data.success) {
                    alert('Violation recorded successfully!');
                    // Close modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('recordViolationModal'));
                    modal.hide();
                    // Refresh the page to show new violation
                    window.location.reload();
                } else {
                    throw new Error(data.message || `Server error: ${response.status}`);
                }

            } catch (err) {
                console.error('Violation submission error:', err);
                alert('Error submitting violation: ' + err.message);
            } finally {
                // Restore button state
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Initialize modal event listeners
    setTimeout(function() {
      initializeModalEventListeners();
    }, 100);

    function initializeModalEventListeners() {
      // Add close button functionality to all modals
      document.querySelectorAll('.modal').forEach(modal => {
        if (modal) {
          const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
          closeButtons.forEach(button => {
            if (button) {
              button.addEventListener('click', function() {
                hideModal(modal.id);
              });
            }
          });

          // Close on backdrop click
          modal.addEventListener('click', function(e) {
            if (e.target === modal) {
              hideModal(modal.id);
            }
          });
        }
      });

      // Global ESC key listener
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          window.ModalManager.hideAll();
        }
      });
    }
    // Search and filter functionality
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');
    const typeFilter = document.getElementById('typeFilter');
    const dateFilter = document.getElementById('dateFilter');

    function filterTable() {
      const searchTerm = searchInput.value.toLowerCase();
      const statusValue = statusFilter.value;
      const severityValue = severityFilter.value;
      const typeValue = typeFilter.value;
      const dateValue = dateFilter.value;
      const rows = document.querySelectorAll('#violationsTable tbody tr');

      rows.forEach(row => {
        if (row.cells.length < 8) return; // Skip empty rows

        const student = row.cells[1].textContent.toLowerCase();
        const violation = row.cells[2].textContent.toLowerCase();
        const type = row.cells[3].textContent.toLowerCase();
        const severity = row.cells[4].textContent.toLowerCase();
        const date = row.cells[5].textContent.trim();
        const status = row.cells[6].textContent.toLowerCase();

        const matchesSearch = student.includes(searchTerm) || violation.includes(searchTerm);
        const matchesStatus = !statusValue || status.includes(statusValue);
        const matchesSeverity = !severityValue || severity.includes(severityValue);
        const matchesType = !typeValue || type.includes(typeValue);

        // Date filtering: convert filter date to same format as table (M d, Y)
        let matchesDate = true;
        if (dateValue) {
          const filterDate = new Date(dateValue);
          const formattedFilterDate = filterDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }); // Keep comma to match "Jan 15, 2024"
          matchesDate = date.includes(formattedFilterDate);
        }

        row.style.display = matchesSearch && matchesStatus && matchesSeverity && matchesType && matchesDate ? '' : 'none';
      });
    }

    [searchInput, statusFilter, severityFilter, typeFilter, dateFilter].forEach(element => {
      if (element) {
        element.addEventListener('input', filterTable);
        element.addEventListener('change', filterTable);
      }
    });

    // Student search functionality for violation modal
    const studentSearchInput = document.getElementById('violationStudentSearch');
    const studentIdInput = document.getElementById('violationStudentId');
    const studentSuggestions = document.getElementById('studentSuggestions');

    let searchTimeout;
    let currentFocus = -1;


    function searchStudents(query) {
      if (query.length < 2) {
        studentSuggestions.style.display = 'none';
        return;
      }

      fetch(`/guidance/students/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(students => {
          displaySuggestions(students);
        })
        .catch(error => {
          console.error('Error searching students:', error);
          studentSuggestions.style.display = 'none';
        });
    }

    function displaySuggestions(students) {
      if (students.length === 0) {
        studentSuggestions.style.display = 'none';
        return;
      }

      const suggestionsHtml = students.map(student => `
        <div class="suggestion-item" data-student-id="${student.id}" data-student-name="${student.first_name} ${student.last_name} (${student.student_id || 'No ID'})">
          <div class="suggestion-name">${student.first_name} ${student.last_name}</div>
          <div class="suggestion-details">ID: ${student.student_id || 'No ID'} | Grade: ${student.grade_level || 'N/A'} | Section: ${student.section || 'N/A'}</div>
        </div>
      `).join('');

      studentSuggestions.innerHTML = suggestionsHtml;
      studentSuggestions.style.display = 'block';
      currentFocus = -1;
    }

    function selectStudent(studentId, studentName) {
      studentSearchInput.value = studentName;
      studentIdInput.value = studentId;
      studentSuggestions.style.display = 'none';
      currentFocus = -1;
    }

    const debouncedSearch = debounce(searchStudents, 300);

    if (studentSearchInput) {
      studentSearchInput.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        debouncedSearch(query);
      });

      studentSearchInput.addEventListener('keydown', function(e) {
        const items = studentSuggestions.querySelectorAll('.suggestion-item');

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          currentFocus = currentFocus < items.length - 1 ? currentFocus + 1 : 0;
          updateFocus(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          currentFocus = currentFocus > 0 ? currentFocus - 1 : items.length - 1;
          updateFocus(items);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (currentFocus >= 0 && items[currentFocus]) {
            const item = items[currentFocus];
            const studentId = item.getAttribute('data-student-id');
            const studentName = item.getAttribute('data-student-name');
            selectStudent(studentId, studentName);
          }
        } else if (e.key === 'Escape') {
          studentSuggestions.style.display = 'none';
          currentFocus = -1;
        }
      });

      // Click outside to close suggestions
      document.addEventListener('click', function(e) {
        if (!studentSearchInput.contains(e.target) && !studentSuggestions.contains(e.target)) {
          studentSuggestions.style.display = 'none';
          currentFocus = -1;
        }
      });
    }

    if (studentSuggestions) {
      studentSuggestions.addEventListener('click', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
          const studentId = item.getAttribute('data-student-id');
          const studentName = item.getAttribute('data-student-name');
          selectStudent(studentId, studentName);
        }
      });
    }

    function updateFocus(items) {
      // Remove previous focus
      items.forEach(item => item.classList.remove('active'));

      // Add focus to current item
      if (items[currentFocus]) {
        items[currentFocus].classList.add('active');
        items[currentFocus].scrollIntoView({ block: 'nearest' });
      }
    }
  });

// Global functions for CRUD operations (must be in global scope)
window.viewViolation = function(violationId) {
    // Fetch violation data from server
    fetch(`/guidance/violations/${violationId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('viewViolationModalBody').innerHTML = `
          <div class="row">
            <div class="col-md-6">
              <h6>Student Information</h6>
              <table class="table table-sm">
                <tbody>
                  <tr><td><strong>Name:</strong></td><td>${data.student.first_name} ${data.student.last_name}</td></tr>
                  <tr><td><strong>Student ID:</strong></td><td>${data.student.student_id || 'N/A'}</td></tr>
                  <tr><td><strong>Grade Level:</strong></td><td>${data.student.grade_level || 'N/A'}</td></tr>
                  <tr><td><strong>Section:</strong></td><td>${data.student.section || 'N/A'}</td></tr>
                </tbody>
              </table>
              
              <h6 class="mt-3">Violation Details</h6>
              <table class="table table-sm">
                <tbody>
                  <tr><td><strong>Type:</strong></td><td>
                    <span class="badge bg-secondary">${data.violation_type ? data.violation_type.charAt(0).toUpperCase() + data.violation_type.slice(1) : 'N/A'}</span>
                  </td></tr>
                  <tr><td><strong>Severity:</strong></td><td>
                    <span class="badge bg-${data.severity === 'minor' ? 'success' : 'warning'}">
                      ${data.severity === 'minor' ? 'Minor Offense' : (data.severity === 'major' ? 'Major Offense' : 'N/A')}
                    </span>
                  </td></tr>
                  <tr><td><strong>Status:</strong></td><td>
                    <span class="badge bg-${data.status === 'pending' ? 'warning' : (data.status === 'resolved' ? 'success' : 'info')}">
                      ${data.status ? data.status.charAt(0).toUpperCase() + data.status.slice(1) : 'N/A'}
                    </span>
                  </td></tr>
                  <tr><td><strong>Date:</strong></td><td>${new Date(data.violation_date).toLocaleDateString()}</td></tr>
                  <tr><td><strong>Time:</strong></td><td>${data.violation_time ? (data.violation_time.length > 5 ? data.violation_time.substring(0, 5) : data.violation_time) : 'N/A'}</td></tr>
                  <tr><td><strong>Location:</strong></td><td>${data.location || 'N/A'}</td></tr>
                </tbody>
              </table>
            </div>
            <div class="col-md-6">
              <h6>Violation Information</h6>
              <div class="mb-3">
                <label class="form-label fw-bold">Title:</label>
                <p>${data.title}</p>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold">Description:</label>
                <p>${data.description}</p>
              </div>
              
              ${data.witnesses && data.witnesses.length > 0 ? `
                <div class="mb-3">
                  <label class="form-label fw-bold">Witnesses:</label>
                  <ul class="list-unstyled">
                    ${data.witnesses.map(witness => `<li>• ${witness}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              
              
              ${data.resolution ? `
                <div class="mb-3">
                  <label class="form-label fw-bold">Resolution:</label>
                  <p>${data.resolution}</p>
                </div>
              ` : ''}
              
              ${data.disciplinary_action ? `
                <div class="mb-3">
                  <label class="form-label fw-bold">Disciplinary Action:</label>
                  <p>${data.disciplinary_action}</p>
                </div>
              ` : ''}
              
              ${data.notes ? `
                <div class="mb-3">
                  <label class="form-label fw-bold">Notes:</label>
                  <p>${data.notes}</p>
                </div>
              ` : ''}
              
              <div class="mb-3">
                <label class="form-label fw-bold">Reported By:</label>
                <p>${data.reported_by ? (data.reported_by.first_name + ' ' + data.reported_by.last_name) : 'N/A'}</p>
              </div>
              
              <div class="mb-3">
                <label class="form-label fw-bold">Reported On:</label>
                <p>${new Date(data.created_at).toLocaleDateString()} at ${new Date(data.created_at).toLocaleTimeString()}</p>
              </div>
              
              ${data.resolved_by ? `
                <div class="mb-3">
                  <label class="form-label fw-bold">Resolved By:</label>
                  <p>${data.resolved_by.first_name} ${data.resolved_by.last_name}</p>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-bold">Resolved On:</label>
                  <p>${new Date(data.resolved_at).toLocaleDateString()} at ${new Date(data.resolved_at).toLocaleTimeString()}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        showModal('viewViolationModal');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error loading violation details');
      });
  }



window.deleteViolation = function(violationId) {
    if (confirm('Are you sure you want to delete this violation? This action cannot be undone.')) {
      // Show loading state
      const button = event.target.closest('button');
      const originalHTML = button.innerHTML;
      button.innerHTML = '<i class="ri-loader-line spinner-border spinner-border-sm"></i>';
      button.disabled = true;
      
      // Use AJAX for better UX
      fetch(`/guidance/violations/${violationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({
          '_method': 'DELETE',
          '_token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        })
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Delete failed with status: ' + response.status);
        }
      })
      .then(data => {
        if (data.success) {
          // Remove the row from table
          const rows = document.querySelectorAll('#violationsTable tbody tr');
          rows.forEach(row => {
            const idCell = row.cells[0];
            if (idCell && idCell.textContent.includes('#' + violationId)) {
              row.remove();
            }
          });
          
          // Show success message
          const alertDiv = document.createElement('div');
          alertDiv.className = 'alert alert-success alert-dismissible fade show';
          alertDiv.innerHTML = `
            <strong>Success!</strong> ${data.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
          `;
          
          const mainContent = document.querySelector('main');
          mainContent.insertBefore(alertDiv, mainContent.firstChild);
          
          // Auto-dismiss after 3 seconds
          setTimeout(() => {
            if (alertDiv.parentNode) {
              alertDiv.remove();
            }
          }, 3000);
        } else {
          throw new Error(data.message || 'Delete failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        
        // Restore button state
        button.innerHTML = originalHTML;
        button.disabled = false;
        
        // Show error message
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
          <strong>Error!</strong> Failed to delete violation: ${error.message}
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const mainContent = document.querySelector('main');
        mainContent.insertBefore(alertDiv, mainContent.firstChild);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
          if (alertDiv.parentNode) {
            alertDiv.remove();
          }
        }, 5000);
      });
    }
  }

// Helper function to update violation row in table
window.updateViolationRow = function(violationId, violation) {
    const rows = document.querySelectorAll('#violationsTable tbody tr');
    rows.forEach(row => {
      const idCell = row.cells[0];
      if (idCell && idCell.textContent.includes('#' + violationId)) {
        // Update severity
        const severityCell = row.cells[4];
        const severityClass = violation.severity === 'minor' ? 'success' : 'warning';
        severityCell.innerHTML = `<span class="badge bg-${severityClass}">${violation.severity === 'minor' ? 'Minor Offense' : 'Major Offense'}</span>`;
        
        // Update status
        const statusCell = row.cells[6];
        const statusClass = violation.status === 'pending' ? 'warning' : 
                           (violation.status === 'resolved' ? 'success' : 'info');
        statusCell.innerHTML = `<span class="badge bg-${statusClass}">${violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}</span>`;
        
        // Update violation info if title changed
        const violationCell = row.cells[0];
        const titleElement = violationCell.querySelector('strong');
        if (titleElement) {
          titleElement.textContent = violation.title;
        }

        // Update student name if changed
        const studentCell = row.cells[1];
        if (studentCell && violation.student) {
          studentCell.innerHTML = `
            <div>
              <strong>${violation.student.first_name} ${violation.student.last_name}</strong>
              <br><small class="text-muted">${violation.student.student_id || 'No ID'}</small>
            </div>
          `;
        }
        
        // Add visual feedback
        row.style.backgroundColor = '#d4edda';
        setTimeout(() => {
          row.style.backgroundColor = '';
        }, 2000);
      }
    });
  }

  // Comprehensive modal management system
  window.ModalManager = {
    activeModals: new Set(),
    
    show: function(modalId) {
      try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
          console.error('Modal not found:', modalId);
          return false;
        }

        // Try Bootstrap first
        if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
          const modal = new window.bootstrap.Modal(modalElement, {
            backdrop: true,
            keyboard: true,
            focus: true
          });
          modal.show();
          this.activeModals.add(modalId);
          
          // Add event listeners for proper cleanup
          modalElement.addEventListener('hidden.bs.modal', () => {
            this.activeModals.delete(modalId);
          }, { once: true });
          
          return true;
        }
        
        // Fallback implementation
        return this.showFallback(modalId);
        
      } catch (error) {
        console.error('Error showing modal:', error);
        return this.showFallback(modalId);
      }
    },
    
    hide: function(modalId) {
      try {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return false;

        // Try Bootstrap first
        if (typeof window.bootstrap !== 'undefined') {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
            return true;
          }
        }
        
        // Fallback implementation
        return this.hideFallback(modalId);
        
      } catch (error) {
        console.error('Error hiding modal:', error);
        return this.hideFallback(modalId);
      }
    },
    
    showFallback: function(modalId) {
      const modalElement = document.getElementById(modalId);
      const backdrop = this.createBackdrop(modalId);
      
      modalElement.style.display = 'block';
      modalElement.classList.add('show');
      modalElement.setAttribute('aria-hidden', 'false');
      modalElement.setAttribute('aria-modal', 'true');
      modalElement.setAttribute('role', 'dialog');
      
      document.body.classList.add('modal-open');
      document.body.appendChild(backdrop);
      
      this.activeModals.add(modalId);
      this.addFallbackEventListeners(modalId);
      
      return true;
    },
    
    hideFallback: function(modalId) {
      const modalElement = document.getElementById(modalId);
      const backdrop = document.getElementById(modalId + '-backdrop');
      
      modalElement.style.display = 'none';
      modalElement.classList.remove('show');
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');
      
      if (backdrop) backdrop.remove();
      
      if (this.activeModals.size <= 1) {
        document.body.classList.remove('modal-open');
      }
      
      this.activeModals.delete(modalId);
      return true;
    },
    
    createBackdrop: function(modalId) {
      // Remove existing backdrop
      const existingBackdrop = document.getElementById(modalId + '-backdrop');
      if (existingBackdrop) existingBackdrop.remove();
      
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade show';
      backdrop.id = modalId + '-backdrop';
      backdrop.style.zIndex = '1040';
      
      // Click to close
      backdrop.addEventListener('click', () => this.hide(modalId));
      
      return backdrop;
    },
    
    addFallbackEventListeners: function(modalId) {
      const modalElement = document.getElementById(modalId);
      
      // ESC key to close
      const escHandler = (e) => {
        if (e.key === 'Escape' && this.activeModals.has(modalId)) {
          this.hide(modalId);
          document.removeEventListener('keydown', escHandler);
        }
      };
      document.addEventListener('keydown', escHandler);
      
      // Close buttons
      const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
      closeButtons.forEach(button => {
        button.addEventListener('click', () => this.hide(modalId));
      });
      
      // Click outside to close
      modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) {
          this.hide(modalId);
        }
      });
    },
    
    hideAll: function() {
      this.activeModals.forEach(modalId => this.hide(modalId));
    }
  };

// Convenient wrapper functions
window.showModal = function(modalId) {
  return window.ModalManager.show(modalId);
}

window.hideModal = function(modalId) {
  return window.ModalManager.hide(modalId);
}

  // (Functions moved to global scope above)

  // Functions are now in global scope above

// Comprehensive modal management system
window.ModalManager = {
    activeModals: new Set(),

    show: function(modalId) {
        try {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                console.error('Modal not found:', modalId);
                return false;
            }

            // Try Bootstrap first
            if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
                const modal = new window.bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                modal.show();
                this.activeModals.add(modalId);

                // Add event listeners for proper cleanup
                modalElement.addEventListener('hidden.bs.modal', () => {
                    this.activeModals.delete(modalId);
                }, { once: true });

                return true;
            }

            // Fallback implementation
            return this.showFallback(modalId);

        } catch (error) {
            console.error('Error showing modal:', error);
            return this.showFallback(modalId);
        }
    },

    hide: function(modalId) {
        try {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) return false;

            // Try Bootstrap first
            if (typeof window.bootstrap !== 'undefined') {
                const modal = window.bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                    return true;
                }
            }

            // Fallback implementation
            return this.hideFallback(modalId);

        } catch (error) {
            console.error('Error hiding modal:', error);
            return this.hideFallback(modalId);
        }
    },

    showFallback: function(modalId) {
        const modalElement = document.getElementById(modalId);
        const backdrop = this.createBackdrop(modalId);

        modalElement.style.display = 'block';
        modalElement.classList.add('show');
        modalElement.setAttribute('aria-hidden', 'false');
        modalElement.setAttribute('aria-modal', 'true');
        modalElement.setAttribute('role', 'dialog');

        document.body.classList.add('modal-open');
        document.body.appendChild(backdrop);

        this.activeModals.add(modalId);
        this.addFallbackEventListeners(modalId);

        return true;
    },

    hideFallback: function(modalId) {
        const modalElement = document.getElementById(modalId);
        const backdrop = document.getElementById(modalId + '-backdrop');

        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        modalElement.removeAttribute('role');

        if (backdrop) backdrop.remove();

        if (this.activeModals.size <= 1) {
            document.body.classList.remove('modal-open');
        }

        this.activeModals.delete(modalId);
        return true;
    },

    createBackdrop: function(modalId) {
        // Remove existing backdrop
        const existingBackdrop = document.getElementById(modalId + '-backdrop');
        if (existingBackdrop) existingBackdrop.remove();

        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.id = modalId + '-backdrop';
        backdrop.style.zIndex = '1040';

        // Click to close
        backdrop.addEventListener('click', () => this.hide(modalId));

        return backdrop;
    },

    addFallbackEventListeners: function(modalId) {
        const modalElement = document.getElementById(modalId);

        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape' && this.activeModals.has(modalId)) {
                this.hide(modalId);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Close buttons
        const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => this.hide(modalId));
        });

        // Click outside to close
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                this.hide(modalId);
            }
        });
    },

    hideAll: function() {
        this.activeModals.forEach(modalId => this.hide(modalId));
    }
};

// Function to use custom offense
window.useCustomOffense = function() {
    const customInput = document.getElementById('customOffenseText');
    const violationTitleSelect = document.getElementById('violationTitle');

    if (customInput && customInput.value.trim()) {
        // Create a temporary option with the custom value
        violationTitleSelect.innerHTML = `<option value="${customInput.value.trim()}" selected>${customInput.value.trim()}</option>`;

        // Remove the custom input field
        customInput.closest('.input-group').remove();
    }
}

// Function to add more witness fields
window.addWitnessField = function() {
    const container = document.getElementById('witnessesContainer');
    const newInput = document.createElement('div');
    newInput.className = 'input-group mb-2';
    newInput.innerHTML = `
        <input type="text" class="form-control" name="witnesses[]" placeholder="Witness name">
        <button type="button" class="btn btn-outline-danger" onclick="removeWitnessField(this)">
            <i class="ri-delete-bin-line"></i>
        </button>
    `;
    container.appendChild(newInput);
}

// Function to remove witness field
window.removeWitnessField = function(button) {
    button.closest('.input-group').remove();
}

window.openViolationModal = function(student) {
    document.getElementById('violationStudentId').value = student.id;

    // Reset form
    document.getElementById('violationSeverity').value = '';
    document.getElementById('majorCategoryWrapper').classList.add('d-none');
    document.getElementById('majorCategory').value = '';
    document.getElementById('violationTitle').innerHTML = '<option value="">-- Select Offense --</option>';

    const customInput = document.getElementById('customOffenseInput');
    if (customInput) customInput.remove();

    // Show modal
    const modalEl = document.getElementById('recordViolationModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// Function to show incident form for major offenses
function showIncidentForm() {
    // Get violation data
    const reportedStudent = document.getElementById('violationStudentSearch').value || '';

    const violationTitle = getViolationTitle();
    const violationDescription = document.getElementById('violationDescription').value;

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'incidentFormModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Incident Form</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="incidentForm">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Reported Students</label>
                            <div class="position-relative">
                              <input type="text" class="form-control" id="incidentStudentSearch" placeholder="Type student name or ID..." autocomplete="off">
                              <div id="incidentStudentSuggestions" class="suggestions-list" style="display: none;">
                                <!-- Suggestions will be populated here -->
                              </div>
                            </div>
                            <div id="selectedStudentsContainer" class="mt-2">
                              <!-- Selected students will be added here -->
                            </div>
                            <small class="text-muted">Add multiple students involved in the incident</small>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-bold">Reporter</label>
                            <input type="text" class="form-control" id="incidentReporter" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Date</label>
                                <input type="date" class="form-control" id="incidentDate" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Time</label>
                                <input type="time" class="form-control" id="incidentTime" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Details</label>
                            <textarea class="form-control" id="incidentDetails" rows="4" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold">Violation</label>
                            <textarea class="form-control" id="incidentViolation" rows="2" readonly>${violationTitle}: ${violationDescription}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-info" onclick="generateIncidentForm()">Generate Incident Form</button>
                    <button type="submit" form="incidentForm" class="btn btn-primary">Submit Incident</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Add submit handler
    const incidentForm = document.getElementById('incidentForm');
    incidentForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (window.incidentSelectedStudents.length === 0) {
            alert('Please select at least one student for the incident.');
            return;
        }

        // Collect incident data
        const reporter = document.getElementById('incidentReporter').value;
        const date = document.getElementById('incidentDate').value;
        const time = document.getElementById('incidentTime').value;
        const details = document.getElementById('incidentDetails').value;

        const submitBtn = incidentForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Submit violation for each selected student
            const results = [];
            for (const student of window.incidentSelectedStudents) {
                const violationForm = document.getElementById('recordViolationForm');
                const formData = new FormData();

                // Manually append all required fields from the form
                formData.append('student_id', student.id);
                formData.append('title', getViolationTitle());
                formData.append('description', details.trim());
                formData.append('severity', document.getElementById('violationSeverity').value);
                formData.append('major_category', document.getElementById('majorCategory').value);
                formData.append('violation_date', date);
                formData.append('violation_time', time);
                formData.append('status', 'pending');
                formData.append('incident_reporter', reporter);
                formData.append('incident_date', date);
                formData.append('incident_time', time);

                // Append other fields if needed (location, notes, etc.)
                const location = document.getElementById('violationLocation').value;
                if (location) formData.append('location', location);


                // Add CSRF
                const csrfTokenEl = document.querySelector('meta[name="csrf-token"]');
                if (!violationForm.querySelector('input[name="_token"]')) {
                    const tokenInput = document.createElement('input');
                    tokenInput.type = 'hidden';
                    tokenInput.name = '_token';
                    tokenInput.value = csrfTokenEl.getAttribute('content');
                    violationForm.appendChild(tokenInput);
                }

                // Ensure title is set
                getViolationTitle();

                const response = await fetch('/guidance/violations', {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfTokenEl.getAttribute('content'),
                        'Accept': 'application/json'
                    },
                    body: formData
                });

                if (!response.ok) {
                    const responseText = await response.text();
                    if (responseText.startsWith('<')) {
                        throw new Error('Authentication required. Please log in again.');
                    } else {
                        throw new Error(`Server error: ${response.status}. ${responseText.substring(0, 200)}`);
                    }
                }

                const responseText = await response.text();
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    throw new Error(`Server returned invalid JSON. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
                }

                if (!data.success) {
                    throw new Error(data.message || `Server error: ${response.status}`);
                }

                results.push(data);
            }

            alert(`Incident recorded successfully for ${selectedStudents.length} student(s)!`);
            // Close modals
            window.ModalManager.hide('incidentFormModal');
            const modal = bootstrap.Modal.getInstance(document.getElementById('recordViolationModal'));
            if (modal) modal.hide();
            // Refresh
            window.location.reload();

        } catch (err) {
            console.error('Incident submission error:', err);
            alert('Error submitting incident: ' + err.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Add student search functionality for incident form
    const incidentStudentSearch = document.getElementById('incidentStudentSearch');
    const incidentStudentSuggestions = document.getElementById('incidentStudentSuggestions');
    const selectedStudentsContainer = document.getElementById('selectedStudentsContainer');

    let incidentSearchTimeout;
    let incidentCurrentFocus = -1;
    window.incidentSelectedStudents = [];

    function incidentSearchStudents(query) {
      if (query.length < 2) {
        incidentStudentSuggestions.style.display = 'none';
        return;
      }

      fetch(`/guidance/students/search?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(students => {
          incidentDisplaySuggestions(students);
        })
        .catch(error => {
          console.error('Error searching students:', error);
          incidentStudentSuggestions.style.display = 'none';
        });
    }

    function incidentDisplaySuggestions(students) {
      if (students.length === 0) {
        incidentStudentSuggestions.style.display = 'none';
        return;
      }

      const suggestionsHtml = students.map(student => `
        <div class="suggestion-item" data-student-id="${student.id}" data-student-name="${student.first_name} ${student.last_name} (${student.student_id || 'No ID'})">
          <div class="suggestion-name">${student.first_name} ${student.last_name}</div>
          <div class="suggestion-details">ID: ${student.student_id || 'No ID'} | Grade: ${student.grade_level || 'N/A'} | Section: ${student.section || 'N/A'}</div>
        </div>
      `).join('');

      incidentStudentSuggestions.innerHTML = suggestionsHtml;
      incidentStudentSuggestions.style.display = 'block';
      incidentCurrentFocus = -1;
    }

    function incidentSelectStudent(studentId, studentName) {
      if (!window.incidentSelectedStudents.some(s => s.id === studentId)) {
        window.incidentSelectedStudents.push({ id: studentId, name: studentName });
        updateSelectedStudentsDisplay();
      }
      incidentStudentSearch.value = '';
      incidentStudentSuggestions.style.display = 'none';
      incidentCurrentFocus = -1;
    }

    function updateSelectedStudentsDisplay() {
      selectedStudentsContainer.innerHTML = window.incidentSelectedStudents.map(student => `
        <div class="badge bg-primary me-2 mb-2 d-inline-flex align-items-center">
          ${student.name}
          <button type="button" class="btn-close btn-close-white ms-2" onclick="removeSelectedStudent(${student.id})" style="font-size: 0.6em;"></button>
        </div>
      `).join('');
    }

    window.removeSelectedStudent = function(studentId) {
      const index = window.incidentSelectedStudents.findIndex(s => s.id === studentId);
      if (index > -1) {
        window.incidentSelectedStudents.splice(index, 1);
        updateSelectedStudentsDisplay();
      }
    };

    const incidentDebouncedSearch = debounce(incidentSearchStudents, 300);

    if (incidentStudentSearch) {
      incidentStudentSearch.addEventListener('input', function(e) {
        const query = e.target.value.trim();
        incidentDebouncedSearch(query);
      });

      incidentStudentSearch.addEventListener('keydown', function(e) {
        const items = incidentStudentSuggestions.querySelectorAll('.suggestion-item');

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          incidentCurrentFocus = incidentCurrentFocus < items.length - 1 ? incidentCurrentFocus + 1 : 0;
          incidentUpdateFocus(items);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          incidentCurrentFocus = incidentCurrentFocus > 0 ? incidentCurrentFocus - 1 : items.length - 1;
          incidentUpdateFocus(items);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (incidentCurrentFocus >= 0 && items[incidentCurrentFocus]) {
            const item = items[incidentCurrentFocus];
            const studentId = item.getAttribute('data-student-id');
            const studentName = item.getAttribute('data-student-name');
            incidentSelectStudent(studentId, studentName);
          }
        } else if (e.key === 'Escape') {
          incidentStudentSuggestions.style.display = 'none';
          incidentCurrentFocus = -1;
        }
      });

      // Click outside to close suggestions
      document.addEventListener('click', function(e) {
        if (!incidentStudentSearch.contains(e.target) && !incidentStudentSuggestions.contains(e.target)) {
          incidentStudentSuggestions.style.display = 'none';
          incidentCurrentFocus = -1;
        }
      });
    }

    if (incidentStudentSuggestions) {
      incidentStudentSuggestions.addEventListener('click', function(e) {
        const item = e.target.closest('.suggestion-item');
        if (item) {
          const studentId = item.getAttribute('data-student-id');
          const studentName = item.getAttribute('data-student-name');
          incidentSelectStudent(studentId, studentName);
        }
      });
    }

    function incidentUpdateFocus(items) {
      // Remove previous focus
      items.forEach(item => item.classList.remove('active'));

      // Add focus to current item
      if (items[incidentCurrentFocus]) {
        items[incidentCurrentFocus].classList.add('active');
        items[incidentCurrentFocus].scrollIntoView({ block: 'nearest' });
      }
    }

    // Show modal
    window.ModalManager.show('incidentFormModal');
}

// Convenient wrapper functions
window.showModal = function(modalId) {
    return window.ModalManager.show(modalId);
}

window.hideModal = function(modalId) {
    return window.ModalManager.hide(modalId);
}

// Function to generate printable incident form
window.generateIncidentForm = function() {
    // Get form data
    const reporter = document.getElementById('incidentReporter').value;
    const date = document.getElementById('incidentDate').value;
    const time = document.getElementById('incidentTime').value;
    const details = document.getElementById('incidentDetails').value;
    const violation = document.getElementById('incidentViolation').value;

    // Get selected students
    const selectedStudentsText = Array.from(document.querySelectorAll('#selectedStudentsContainer .badge'))
        .map(badge => badge.textContent.trim())
        .join(', ');

    // Validate required fields
    if (!reporter || !date || !time || !details || window.incidentSelectedStudents.length === 0) {
        alert('Please fill in all required fields before generating the incident form.');
        return;
    }

    // Create printable HTML
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Incident Report Form</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .school-name {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .form-title {
                    font-size: 18px;
                    font-weight: bold;
                }
                .section {
                    margin-bottom: 20px;
                }
                .section-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 8px;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 3px;
                }
                .field {
                    margin-bottom: 10px;
                }
                .field-label {
                    font-weight: bold;
                    display: inline-block;
                    min-width: 120px;
                }
                .field-value {
                    display: inline-block;
                }
                .signature-section {
                    margin-top: 40px;
                    border-top: 1px solid #000;
                    padding-top: 20px;
                }
                .signature-line {
                    display: inline-block;
                    width: 200px;
                    border-bottom: 1px solid #000;
                    margin-right: 20px;
                    margin-bottom: 20px;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="school-name">[School Name]</div>
                <div class="form-title">INCIDENT REPORT FORM</div>
            </div>

            <div class="section">
                <div class="section-title">INCIDENT INFORMATION</div>
                <div class="field">
                    <span class="field-label">Date of Incident:</span>
                    <span class="field-value">${new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="field">
                    <span class="field-label">Time of Incident:</span>
                    <span class="field-value">${time}</span>
                </div>
                <div class="field">
                    <span class="field-label">Reported By:</span>
                    <span class="field-value">${reporter}</span>
                </div>
                <div class="field">
                    <span class="field-label">Students Involved:</span>
                    <span class="field-value">${selectedStudentsText}</span>
                </div>
            </div>

            <div class="section">
                <div class="section-title">INCIDENT DETAILS</div>
                <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; min-height: 100px;">
                    ${details.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div class="section">
                <div class="section-title">VIOLATION INFORMATION</div>
                <div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
                    ${violation.replace(/\n/g, '<br>')}
                </div>
            </div>

            <div class="signature-section">
                <div style="margin-bottom: 20px;">
                    <strong>Prepared by:</strong>
                </div>
                <div class="signature-line"></div>
                <div style="display: inline-block; font-size: 12px; color: #666;">
                    Signature over Printed Name
                </div>

                <div style="margin-top: 20px; margin-bottom: 20px;">
                    <strong>Reviewed by:</strong>
                </div>
                <div class="signature-line"></div>
                <div style="display: inline-block; font-size: 12px; color: #666;">
                    Guidance Counselor/Discipline Officer
                </div>

                <div style="margin-top: 20px; margin-bottom: 20px;">
                    <strong>Approved by:</strong>
                </div>
                <div class="signature-line"></div>
                <div style="display: inline-block; font-size: 12px; color: #666;">
                    Principal/Discipline Head
                </div>
            </div>

            <div style="margin-top: 40px; font-size: 12px; color: #666; text-align: center;">
                Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
        // Optionally close the print window after printing
        // printWindow.close();
    };
}

