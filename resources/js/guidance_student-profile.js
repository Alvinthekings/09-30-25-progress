// Wait for both DOM and Bootstrap to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize modal event listeners
    function initializeModalEventListeners() {
      document.querySelectorAll('.modal').forEach(modal => {
        const closeButtons = modal.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
        closeButtons.forEach(button => {
          button.addEventListener('click', function() {
            hideModal(modal.id);
          });
        });
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            hideModal(modal.id);
          }
        });
      });
      document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          window.ModalManager.hideAll();
        }
      });
    }
    initializeModalEventListeners();

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const gradeFilter = document.getElementById('gradeFilter');
    
    function filterTable() {
      const searchTerm = searchInput.value.toLowerCase();
      const gradeValue = gradeFilter.value;
      const rows = document.querySelectorAll('#studentsTable tbody tr');
      
      rows.forEach(row => {
        if (row.cells.length < 5) return;
        
        const studentInfo = row.cells[1].textContent.toLowerCase();
        const grade = row.cells[2].textContent;
        
        const matchesSearch = studentInfo.includes(searchTerm);
        const matchesGrade = !gradeValue || grade.includes(gradeValue);
        
        row.style.display = matchesSearch && matchesGrade ? '' : 'none';
      });
    }
    
    [searchInput, gradeFilter].forEach(element => {
      element.addEventListener('input', filterTable);
      element.addEventListener('change', filterTable);
    });
  });

// Comprehensive modal management system
window.ModalManager = {
  activeModals: new Set(),
  
  show: function(modalId) {
    try {
      const modalElement = document.getElementById(modalId);
      if (!modalElement) return false;

      if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
        const modal = new window.bootstrap.Modal(modalElement, {
          backdrop: true,
          keyboard: true,
          focus: true
        });
        modal.show();
        this.activeModals.add(modalId);
        modalElement.addEventListener('hidden.bs.modal', () => {
          this.activeModals.delete(modalId);
        }, { once: true });
        return true;
      }
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

      if (typeof window.bootstrap !== 'undefined') {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
          return true;
        }
      }
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
    const existingBackdrop = document.getElementById(modalId + '-backdrop');
    if (existingBackdrop) existingBackdrop.remove();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = modalId + '-backdrop';
    backdrop.style.zIndex = '1040';
    backdrop.addEventListener('click', () => this.hide(modalId));
    return backdrop;
  },
  
  addFallbackEventListeners: function(modalId) {
    const modalElement = document.getElementById(modalId);
    const escHandler = (e) => {
      if (e.key === 'Escape' && this.activeModals.has(modalId)) {
        this.hide(modalId);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    const closeButtons = modalElement.querySelectorAll('[data-bs-dismiss="modal"], .btn-close');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => this.hide(modalId));
    });
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

// Student view modal
window.viewStudent = function(studentId) {
  fetch(`/guidance/students/${studentId}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('studentModalBody').innerHTML = `
        <div class="row">
          <div class="col-md-4 text-center">
            ${data.id_photo_data_url ? 
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

// Violations page redirect
window.viewViolations = function(studentId) {
  window.location.href = `/guidance/violations?student_id=${studentId}`;
}