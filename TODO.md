# TODO for Aligning student-violations with student-profile

- [x] Update `resources/views/guidancediscipline/student-violations.blade.php`
  - [x] Replace the existing record violation modal with the detailed record violation modal from student-profile.blade.php (including hidden student_id, student name display, and all fields)
  - [x] Ensure facial recognition modal is present and matches student-profile.blade.php
  - [x] Add face registration modal from student-profile.blade.php if needed for completeness

- [x] Update `resources/js/guidance_student-violations.js`
  - [x] Add offense library (minor and major offenses with categories) from guidance_student-profile.js
  - [x] Add logic to show/hide major category based on severity selection
  - [x] Add function to update offense dropdown based on severity and category
  - [x] Add custom offense input functionality
  - [x] Add detailed form submission logic for recording violations (including camera cleanup, form validation, and error handling)
  - [x] Add camera functionality for facial recognition (start camera, capture photo, stop camera, recognition processing)
  - [x] Add camera functionality for face registration (start registration camera, capture registration photo)
  - [x] Add modal event listeners for form reset and camera cleanup
  - [x] Add helper functions like useCustomOffense, addWitnessField, removeWitnessField, openViolationModal
  - [x] Integrate ModalManager from guidance_student-profile.js for consistent modal handling
  - [x] Implement CRUD operations (viewViolation, editViolation, deleteViolation functions)
  - [x] Fix date filtering to match table date format
  - [x] Ensure filtering works for status, severity, type, and date

- [x] Update `app/Http/Controllers/GuidanceDisciplineController.php`
  - [x] Align violation_type validation rules with form options (late, uniform, misconduct, academic, other)
  - [x] Remove hardcoded violation_type in storeViolation method
  - [x] Ensure updateViolation validation matches storeViolation

- [x] Test the updated violations page for:
  - [x] Modal functionality (open/close, form reset)
  - [x] Facial recognition camera start, capture, stop
  - [x] Violation form submission with offense selection and custom offense
  - [x] Filtering and CRUD operations remain functional
  - [x] Offense library population and dynamic updates
  - [x] Edit/update violation functionality
  - [x] Date filtering functionality
  - [x] Violation type alignment

- [x] Cleanup and finalize code
  - [x] Remove any duplicate code
  - [x] Ensure consistent styling and functionality
  - [x] Test edge cases (e.g., custom offenses, camera errors)
