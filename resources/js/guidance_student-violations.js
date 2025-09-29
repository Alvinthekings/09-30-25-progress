// Global functions for CRUD operations (must be in global scope)
console.log('Defining global functions...');

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
                    <div class="col-md-6">
                        <h6>Student Information</h6>
                        <table class="table table-sm">
                            <tbody>
                                <tr><td><strong>Name:</strong></td><td>
                                    <select class="form-select form-select-sm" id="edit_student_id" name="student_id" required ${studentSelectDisabled}>
                                        ${students.length > 0 ? students.map(student => `
                                            <option value="${student.id}" ${student.id == (violation.student ? violation.student.id : violation.student_id) ? 'selected' : ''}>
                                                ${student.first_name} ${student.last_name} (${student.student_id || 'No ID'})
                                            </option>
                                        `).join('') : '<option value="">No students available</option>'}
                                    </select>
                                    ${studentSelectHelp}
                                </td></tr>
                                <tr><td><strong>Student ID:</strong></td><td>${violation.student_id || 'N/A'}</td></tr>
                                <tr><td><strong>Grade Level:</strong></td><td>${violation.grade_level || 'N/A'}</td></tr>
                                <tr><td><strong>Section:</strong></td><td>${violation.section || 'N/A'}</td></tr>
                            </tbody>
                        </table>

                        <h6 class="mt-3">Violation Details</h6>
                        <table class="table table-sm">
                            <tbody>
                                <tr><td><strong>Title:</strong></td><td>
                                    <input type="text" class="form-control form-control-sm" id="edit_title" name="title" value="${violation.title || ''}" required>
                                </td></tr>
                                <tr><td><strong>Description:</strong></td><td>
                                    <textarea class="form-control form-control-sm" id="edit_description" name="description" rows="3" required>${violation.description || ''}</textarea>
                                </td></tr>
                                <tr><td><strong>Type:</strong></td><td>
                                    <select class="form-select form-select-sm" id="edit_violation_type" name="violation_type" required>
                                        <option value="uniform" ${violation.violation_type === 'uniform' ? 'selected' : ''}>Uniform</option>
                                        <option value="technology" ${violation.violation_type === 'technology' ? 'selected' : ''}>Technology</option>
                                        <option value="appearance" ${violation.violation_type === 'appearance' ? 'selected' : ''}>Appearance</option>
                                        <option value="behavior" ${violation.violation_type === 'behavior' ? 'selected' : ''}>Behavior</option>
                                        <option value="academic" ${violation.violation_type === 'academic' ? 'selected' : ''}>Academic</option>
                                        <option value="other" ${violation.violation_type === 'other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </td></tr>
                                <tr><td><strong>Severity:</strong></td><td>
                                    <select class="form-select form-select-sm" id="edit_severity" name="severity" required>
                                        <option value="minor" ${violation.severity === 'minor' ? 'selected' : ''}>Minor Offense</option>
                                        <option value="major" ${violation.severity === 'major' ? 'selected' : ''}>Major Offense</option>
                                    </select>
                                </td></tr>
                                <tr><td><strong>Status:</strong></td><td>
                                    <select class="form-select form-select-sm" id="edit_status" name="status" required>
                                        <option value="pending" ${violation.status === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="investigating" ${violation.status === 'investigating' ? 'selected' : ''}>Investigating</option>
                                        <option value="resolved" ${violation.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                        <option value="dismissed" ${violation.status === 'dismissed' ? 'selected' : ''}>Dismissed</option>
                                    </select>
                                </td></tr>
                                <tr><td><strong>Date:</strong></td><td>
                                    <input type="date" class="form-control form-control-sm" id="edit_violation_date" name="violation_date" value="${violation.violation_date ? (violation.violation_date.includes('T') ? violation.violation_date.split('T')[0] : violation.violation_date) : ''}" required>
                                </td></tr>
                                <tr><td><strong>Time:</strong></td><td>
                                    <input type="time" class="form-control form-control-sm" id="edit_violation_time" name="violation_time" value="${violation.violation_time ? (violation.violation_time.length > 5 ? violation.violation_time.substring(0, 5) : violation.violation_time) : ''}">
                                </td></tr>
                                <tr><td><strong>Location:</strong></td><td>
                                    <input type="text" class="form-control form-control-sm" id="edit_location" name="location" value="${violation.location || ''}">
                                </td></tr>
                            </tbody>
                        </table>

                        <h6 class="mt-3">Investigation Details</h6>
                        <table class="table table-sm">
                            <tbody>
                                <tr><td><strong>Witnesses:</strong></td><td>
                                    <textarea class="form-control form-control-sm" id="edit_witnesses" name="witnesses" rows="2">${violation.witnesses ? (Array.isArray(violation.witnesses) ? violation.witnesses.join('\n') : violation.witnesses) : ''}</textarea>
                                </td></tr>
                                <tr><td><strong>Student Statement:</strong></td><td>
                                    <textarea class="form-control form-control-sm" id="edit_student_statement" name="student_statement" rows="2">${violation.student_statement || ''}</textarea>
                                </td></tr>
                            </tbody>
                        </table>

                        <h6 class="mt-3">Resolution Details</h6>
                        <table class="table table-sm">
                            <tbody>
                                <tr><td><strong>Resolution:</strong></td><td>
                                    <textarea class="form-control form-control-sm" id="edit_resolution" name="resolution" rows="2">${violation.resolution || ''}</textarea>
                                </td></tr>
                                <tr><td><strong>Disciplinary Action:</strong></td><td>
                                    <textarea class="form-control form-control-sm" id="edit_disciplinary_action" name="disciplinary_action" rows="2">${violation.disciplinary_action || ''}</textarea>
                                </td></tr>
                                <tr><td><strong>Parent/Guardian Notified:</strong></td><td>
                                    <input class="form-check-input" type="checkbox" id="edit_parent_notified" name="parent_notified" value="1" ${violation.parent_notified ? 'checked' : ''}>
                                </td></tr>
                                <tr><td><strong>Additional Notes:</strong></td><td>
                                    <textarea class="form-control form-control-sm" id="edit_notes" name="notes" rows="2">${violation.notes || ''}</textarea>
                                </td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

            console.log('✅ Modal populated successfully');

            // Add form submission handler
            const currentViolationId = violationId;
            form.onsubmit = async function(e) {
                e.preventDefault();
                console.log('📤 Form submission started');

                const formData = new FormData(form);
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;

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

    // Show/hide major category based on severity
    const severitySelect = document.getElementById('violationSeverity');
    const majorCategoryWrapper = document.getElementById('majorCategoryWrapper');
    const majorCategorySelect = document.getElementById('majorCategory');
    const violationTitleSelect = document.getElementById('violationTitle');

    // Function to update offense dropdown based on selection
    function updateOffenseDropdown() {
        const severity = severitySelect.value;
        const majorCategory = majorCategorySelect.value;

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

    // Handle custom offense input
    if (violationTitleSelect) {
        violationTitleSelect.addEventListener('change', function() {
            const existingCustomInput = document.querySelector('#customOffenseInput');
            if (this.value === 'custom') {
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

    // Set student info when modal is shown
    const violationModal = document.getElementById('recordViolationModal');
    if (violationModal) {
        violationModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const studentId = button ? button.getAttribute('data-student-id') : null;

            if (studentId) {
                document.getElementById('violationStudentSelect').value = studentId;
            } else {
                document.getElementById('violationStudentSelect').value = '';
            }

            // Reset form
            if (severitySelect) severitySelect.value = '';
            if (majorCategoryWrapper) majorCategoryWrapper.classList.add('d-none');
            if (majorCategorySelect) majorCategorySelect.value = '';
            if (violationTitleSelect) violationTitleSelect.innerHTML = '<option value="">-- Select Offense --</option>';

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
                    const responseText = await response.text();
                    console.log('Raw response:', responseText);
                    if (responseText.startsWith('<')) {
                        throw new Error('Authentication required. Please log in again.');
                    } else {
                        throw new Error(`Server error: ${response.status}. ${responseText.substring(0, 200)}`);
                    }
                }

                const responseText = await response.text();
                console.log('Raw response:', responseText);

                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    throw new Error(`Server returned invalid JSON. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
                }

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

    // Cleanup function for camera streams
    let stream = null;
    let registrationStream = null;

    function cleanupCameraStreams() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (registrationStream) {
            registrationStream.getTracks().forEach(track => track.stop());
            registrationStream = null;
        }
    }

    // Cleanup when page is unloaded
    window.addEventListener('beforeunload', cleanupCameraStreams);

    // Camera functionality
    const video = document.getElementById('video');
    const cameraPlaceholder = document.getElementById('cameraPlaceholder');
    const startCameraBtn = document.getElementById('startCamera');
    const captureBtn = document.getElementById('capturePhoto');
    const stopCameraBtn = document.getElementById('stopCamera');

    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', async function() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    }
                });
                video.srcObject = stream;
                video.style.display = 'block';
                cameraPlaceholder.style.display = 'none';
                startCameraBtn.style.display = 'none';
                captureBtn.style.display = 'inline-block';
                stopCameraBtn.style.display = 'inline-block';

                // Clear previous results
                document.getElementById('recognitionResult').style.display = 'none';
                document.getElementById('resultContent').innerHTML = '';
            } catch (err) {
                alert('Error accessing camera: ' + err.message);
            }
        });
    }

    if (stopCameraBtn) {
        stopCameraBtn.addEventListener('click', function() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;
                video.style.display = 'none';
                cameraPlaceholder.style.display = 'block';
                startCameraBtn.style.display = 'inline-block';
                captureBtn.style.display = 'none';
                stopCameraBtn.style.display = 'none';
            }
        });
    }

    if (captureBtn) {
        captureBtn.addEventListener('click', async function () {
            const resultBox = document.getElementById('recognitionResult');
            const resultContent = document.getElementById('resultContent');
            resultBox.style.display = 'block';
            resultContent.innerHTML = '<div class="alert alert-info">Processing facial recognition...</div>';

            try {
                // 1️⃣ Capture current frame as base64 JPEG
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                // 2️⃣ Send to Flask encoder
                const encodeResp = await fetch('http://10.157.42.46:5000/encode-face', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: dataUrl })
                });

                if (!encodeResp.ok) throw new Error('Flask encode failed');
                const encodeData = await encodeResp.json();
                if (encodeData.error) throw new Error(encodeData.error);

                // 3️⃣ Call Laravel /recognize-face
                const laravelResp = await fetch('/guidance/recognize-face', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({
                        face_encoding: encodeData.encoding,
                        threshold: 0.35
                    })
                });

                const raw = await laravelResp.text();
                let result;
                try {
                    result = JSON.parse(raw);
                } catch {
                    throw new Error(`Invalid JSON from server:\n${raw.slice(0,200)}…`);
                }

                // 4️⃣ Display result and open violation modal if recognized
                if (result.success && result.recognized) {
                    const s = result.student;
                    resultContent.innerHTML = `
                        <div class="alert alert-success">
                        ✅ Recognized: <strong>${s.first_name} ${s.last_name}</strong><br>
                        Confidence: ${(result.confidence * 100).toFixed(1)}%
                        </div>
                        <div class="text-center mt-3">
                        <button class="btn btn-primary" onclick="openViolationModal(${JSON.stringify(s).replace(/"/g, '"')})">
                            Record Violation
                        </button>
                        </div>`;

                    // Auto-open violation modal after 2 seconds
                    setTimeout(() => {
                        openViolationModal(s);
                    }, 2000);

                } else {
                    resultContent.innerHTML = `
                        <div class="alert alert-warning">
                        No matching face found.
                        </div>
                        <div class="text-center mt-3">
                        <button class="btn btn-secondary" onclick="hideModal('facialRecognitionModal')">
                            Close
                        </button>
                        </div>`;
                }
            } catch (err) {
                console.error(err);
                resultContent.innerHTML = `
                    <div class="alert alert-danger">
                    Recognition error: ${err.message}
                    </div>
                    <div class="text-center mt-3">
                    <button class="btn btn-secondary" onclick="hideModal('facialRecognitionModal')">
                        Close
                    </button>
                    </div>`;
            }
        });
    }

    // Modal cleanup
    const facialRecognitionModal = document.getElementById('facialRecognitionModal');
    if (facialRecognitionModal) {
        facialRecognitionModal.addEventListener('hidden.bs.modal', function() {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;
                video.style.display = 'none';
                cameraPlaceholder.style.display = 'block';
                startCameraBtn.style.display = 'inline-block';
                captureBtn.style.display = 'none';
                stopCameraBtn.style.display = 'none';
            }
            // Clear results when modal closes
            document.getElementById('recognitionResult').style.display = 'none';
            document.getElementById('resultContent').innerHTML = '';
        });
    }

    // Initialize modal event listeners
    setTimeout(function() {
      initializeModalEventListeners();
    }, 100);

    function initializeModalEventListeners() {
      // Add close button functionality to all modals
      document.querySelectorAll('.modal').forEach(modal => {
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
        closeButtons.forEach(button => {
          button.addEventListener('click', function() {
            hideModal(modal.id);
          });
        });
        
        // Close on backdrop click
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            hideModal(modal.id);
          }
        });
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
      element.addEventListener('input', filterTable);
      element.addEventListener('change', filterTable);
    });
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
        const violationCell = row.cells[2];
        const titleElement = violationCell.querySelector('strong');
        if (titleElement) {
          titleElement.textContent = violation.title;
        }

        // Update student name if changed
        const studentCell = row.cells[1];
        if (studentCell && violation.student) {
          studentCell.innerHTML = `
            <div class="d-flex align-items-center">
              <div class="avatar avatar-sm me-2">
                <div class="avatar-initial bg-label-primary rounded">
                  <i class="ri-user-line ri-22px"></i>
                </div>
              </div>
              <div class="d-flex flex-column">
                <span class="fw-medium">${violation.student.first_name} ${violation.student.last_name}</span>
                <small class="text-muted">${violation.student.student_id || 'No ID'}</small>
              </div>
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
    document.getElementById('violationStudentSelect').value = student.id;

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

// Convenient wrapper functions
window.showModal = function(modalId) {
    return window.ModalManager.show(modalId);
}

window.hideModal = function(modalId) {
    return window.ModalManager.hide(modalId);
}
