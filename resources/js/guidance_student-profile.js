// Wait for both DOM and Bootstrap to be ready
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
            const studentId = button.getAttribute('data-student-id');
            const studentName = button.getAttribute('data-student-name');
            
            document.getElementById('violationStudentId').value = studentId;
            document.getElementById('violationStudentName').textContent = studentName;
            
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
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const gradeFilter = document.getElementById('gradeFilter');
    const faceFilter = document.getElementById('faceFilter');
    
    function filterTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const gradeValue = gradeFilter.value;
        const faceValue = faceFilter.value;
        const rows = document.querySelectorAll('#studentsTable tbody tr');
        
        rows.forEach(row => {
            if (row.cells.length < 5) return;
            
            const studentInfo = row.cells[1].textContent.toLowerCase();
            const grade = row.cells[2].textContent;
            const faceStatusCell = row.cells[3];
            const faceStatus = faceStatusCell.getAttribute('data-face-status') || 'not_registered';
            
            const matchesSearch = studentInfo.includes(searchTerm);
            const matchesGrade = !gradeValue || grade.includes(gradeValue);
            const matchesFace = !faceValue || faceStatus === faceValue;
            
            row.style.display = matchesSearch && matchesGrade && matchesFace ? '' : 'none';
        });
    }
    
    [searchInput, gradeFilter, faceFilter].forEach(element => {
        if (element) {
            element.addEventListener('input', filterTable);
            element.addEventListener('change', filterTable);
        }
    });

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
                        <button class="btn btn-primary" onclick="openViolationModal(${JSON.stringify(s).replace(/"/g, '&quot;')})">
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

    // Registration camera controls
    const registrationVideo = document.getElementById('registrationVideo');
    const registrationPlaceholder = document.getElementById('registrationPlaceholder');
    const startRegistrationBtn = document.getElementById('startRegistrationCamera');
    const captureRegistrationBtn = document.getElementById('captureRegistrationPhoto');

    if (startRegistrationBtn) {
        startRegistrationBtn.addEventListener('click', async function() {
            try {
                registrationStream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'
                    } 
                });
                registrationVideo.srcObject = registrationStream;
                registrationVideo.style.display = 'block';
                registrationPlaceholder.style.display = 'none';
                startRegistrationBtn.style.display = 'none';
                captureRegistrationBtn.style.display = 'inline-block';
            } catch (err) {
                alert('Error accessing camera: ' + err.message);
            }
        });
    }

    if (captureRegistrationBtn) {
        captureRegistrationBtn.addEventListener('click', async function () {
            try {
                // 1️⃣ Capture image from video
                const canvas = document.createElement('canvas');
                canvas.width = registrationVideo.videoWidth;
                canvas.height = registrationVideo.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(registrationVideo, 0, 0);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

                // 2️⃣ Call Flask API to encode the face
                const encodeResp = await fetch('http://10.157.42.46:5000/encode-face', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: dataUrl })
                });
                
                if (!encodeResp.ok) {
                    throw new Error(`Flask encode failed: ${encodeResp.status}`);
                }
                
                const encodeData = await encodeResp.json();
                if (encodeData.error) throw new Error(encodeData.error);

                // 3️⃣ Send to Laravel API
                const studentId = document.getElementById('studentInfoForRegistration').dataset.studentId;

                const laravelResp = await fetch('/api/register-face', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        Authorization: `Bearer ${window.authToken || ''}`
                    },
                    body: JSON.stringify({
                        student_id: studentId,
                        face_encoding: encodeData.encoding,
                        source: 'camera_capture',
                        face_image_data: dataUrl.split(',')[1],
                        face_image_mime_type: 'image/jpeg',
                        confidence_score: encodeData.confidence,
                        face_landmarks: encodeData.landmarks
                    })
                });

                const rawText = await laravelResp.text();
                let result;
                try {
                    result = JSON.parse(rawText);
                } catch (e) {
                    throw new Error(`Invalid JSON from server:\n${rawText.substring(0, 200)}…`);
                }

                if (!laravelResp.ok || !result.success) {
                    throw new Error(result.message || `Laravel error: ${laravelResp.status}`);
                }

                alert('Face registered successfully');
                // Refresh the page to update face registration status
                window.location.reload();
                
            } catch (err) {
                console.error('Registration error:', err);
                alert('Registration error: ' + err.message);
            } finally {
                // 4️⃣ Clean up camera and close modal
                if (registrationStream) {
                    registrationStream.getTracks().forEach(t => t.stop());
                    registrationVideo.srcObject = null;
                }
                registrationVideo.style.display = 'none';
                registrationPlaceholder.style.display = 'block';
                startRegistrationBtn.style.display = 'inline-block';
                captureRegistrationBtn.style.display = 'none';
                hideModal('faceRegistrationModal');
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

    const faceRegistrationModal = document.getElementById('faceRegistrationModal');
    if (faceRegistrationModal) {
        faceRegistrationModal.addEventListener('hidden.bs.modal', function() {
            if (registrationStream) {
                registrationStream.getTracks().forEach(track => track.stop());
                registrationVideo.srcObject = null;
                registrationVideo.style.display = 'none';
                registrationPlaceholder.style.display = 'block';
                startRegistrationBtn.style.display = 'inline-block';
                captureRegistrationBtn.style.display = 'none';
            }
        });
    }
});

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
    document.getElementById('violationStudentName').textContent = `${student.first_name} ${student.last_name}`;
    
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

// Global functions for button actions
window.viewStudent = function(studentId) {
    // Fetch student data from server
    fetch(`/guidance/students/${studentId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('studentModalBody').innerHTML = `
            <div class="row">
                <div class="col-md-4 text-center">
                ${data.id_photo_data_url && data.id_photo_data_url !== null ? 
                    `<img src="${data.id_photo_data_url}" alt="Student Photo" class="img-fluid rounded-circle mb-3" style="max-width: 150px;">` :
                    `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 150px; height: 150px;">
                    <i class="ri-user-line text-white display-4"></i>
                    </div>`
                }
                <h5>${data.first_name} ${data.last_name}</h5>
                <p class="text-muted">${data.grade_level}${data.section ? ' - ' + data.section : ''}</p>
                </div>
                <div class="col-md-8">
                <h6>Student Information</h6>
                <table class="table table-sm">
                    <tbody>
                    <tr><td><strong>LRN:</strong></td><td>${data.lrn || 'N/A'}</td></tr>
                    <tr><td><strong>Gender:</strong></td><td>${data.gender || 'N/A'}</td></tr>
                    <tr><td><strong>Date of Birth:</strong></td><td>${data.date_of_birth || 'N/A'}</td></tr>
                    <tr><td><strong>Contact:</strong></td><td>${data.contact_number || 'N/A'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${data.email || 'N/A'}</td></tr>
                    <tr><td><strong>Address:</strong></td><td>${data.address || 'N/A'}</td></tr>
                    </tbody>
                </table>
                
                <h6 class="mt-3">Parent/Guardian Information</h6>
                <table class="table table-sm">
                    <tbody>
                    <tr><td><strong>Father:</strong></td><td>${data.father_name || 'N/A'}</td></tr>
                    <tr><td><strong>Father Contact:</strong></td><td>${data.father_contact || 'N/A'}</td></tr>
                    <tr><td><strong>Mother:</strong></td><td>${data.mother_name || 'N/A'}</td></tr>
                    <tr><td><strong>Mother Contact:</strong></td><td>${data.mother_contact || 'N/A'}</td></tr>
                    <tr><td><strong>Guardian:</strong></td><td>${data.guardian_name || 'N/A'}</td></tr>
                    <tr><td><strong>Guardian Contact:</strong></td><td>${data.guardian_contact || 'N/A'}</td></tr>
                    </tbody>
                </table>
                
                ${data.violations && data.violations.length > 0 ? `
                    <h6 class="mt-3">Recent Violations (${data.violations.length})</h6>
                    <div class="list-group">
                    ${data.violations.slice(0, 3).map(violation => `
                        <div class="list-group-item">
                        <div class="d-flex w-100 justify-content-between">
                            <h6 class="mb-1">${violation.title}</h6>
                            <small class="text-muted">${new Date(violation.violation_date).toLocaleDateString()}</small>
                        </div>
                        <p class="mb-1">${violation.description}</p>
                        <small class="badge bg-${violation.severity === 'minor' ? 'success' : (violation.severity === 'major' ? 'warning' : 'danger')}">${violation.severity}</small>
                        </div>
                    `).join('')}
                    ${data.violations.length > 3 ? `<small class="text-muted">... and ${data.violations.length - 3} more</small>` : ''}
                    </div>
                ` : '<p class="text-muted mt-3">No violations recorded</p>'}
                </div>
            </div>
            `;
            showModal('studentModal');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error loading student information');
        });
}

window.registerFace = function (studentId) {
    fetch(`/guidance/students/${studentId}/info`)
        .then(r => r.json())
        .then(data => {
            const container = document.getElementById('studentInfoForRegistration');
            container.dataset.studentId = studentId;
            container.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                ${
                    data.id_photo_data_url
                    ? `<img src="${data.id_photo_data_url}" class="img-fluid rounded-circle mb-2" style="max-width:100px;">`
                    : `<div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2" style="width:100px;height:100px;"><i class="ri-user-line text-white"></i></div>`
                }
                <h6>${data.first_name} ${data.last_name}</h6>
                <p class="text-muted mb-0">ID: ${data.student_id || 'N/A'}</p>
                <p class="text-muted">${data.grade_level}${data.section ? ' - ' + data.section : ''}</p>
                </div>
            </div>`;

            showModal('faceRegistrationModal');
        })
        .catch(err => {
            console.error(err);
            alert('Error loading student info');
        });
};       
  
window.viewViolations = function(studentId) {
    window.location.href = `/guidance/violations?student_id=${studentId}`;
}