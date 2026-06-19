/* ===================================
   Cloud Social Work - Multi-Step Form Logic
   For the Book In page
   =================================== */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('#booking-form');
  if (!form) return;

  const stepPanes = document.querySelectorAll('.step-pane');
  const stepTabs = document.querySelectorAll('.step-tab');
  let currentStep = 0;

  // ===================================
  // Navigation Functions
  // ===================================
  function showStep(index) {
    // Hide all panes
    stepPanes.forEach(pane => pane.classList.remove('active'));
    // Show target pane
    if (stepPanes[index]) stepPanes[index].classList.add('active');

    // Update tabs
    stepTabs.forEach((tab, i) => {
      tab.classList.remove('active');
      if (i < index) tab.classList.add('completed');
      if (i === index) tab.classList.add('active');
    });

    currentStep = index;

    // Scroll to top of form
    const wrapper = document.querySelector('.multistep-content');
    if (wrapper) wrapper.scrollTop = 0;

    // Save progress
    localStorage.setItem('csw_current_step', currentStep);
  }

  function moveForward() {
    if (!validateCurrentStep()) return;
    if (currentStep < stepPanes.length - 1) {
      showStep(currentStep + 1);
    }
  }

  function moveBackward() {
    if (currentStep > 0) {
      showStep(currentStep - 1);
    }
  }

  // ===================================
  // Validation
  // ===================================
  function validateCurrentStep() {
    const currentPane = stepPanes[currentStep];
    if (!currentPane) return true;

    const requiredFields = currentPane.querySelectorAll('[required]');
    let valid = true;

    // Clear previous errors
    currentPane.querySelectorAll('.required-field').forEach(el => el.remove());

    requiredFields.forEach(field => {
      if (!field.value || field.value.trim() === '') {
        valid = false;

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'required-field';
        const fieldName = field.getAttribute('data-name') || field.name || 'This';
        errorDiv.textContent = `${fieldName.replace(/-/g, ' ')} is required.`;
        field.parentNode.insertBefore(errorDiv, field.nextSibling);

        // Highlight field
        field.style.borderColor = '#ff4444';
        field.addEventListener('focus', function() {
          this.style.borderColor = '#fff';
          const nextError = this.nextElementSibling;
          if (nextError && nextError.classList.contains('required-field')) {
            nextError.remove();
          }
        }, { once: true });
      }
    });

    return valid;
  }

  // ===================================
  // Event Listeners
  // ===================================

  // Next buttons
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      moveForward();
    });
  });

  // Back buttons
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      moveBackward();
    });
  });

  // ===================================
  // LocalStorage Persistence
  // ===================================
  const fields = form.querySelectorAll('input:not([type=submit]):not([type=file]):not([type=checkbox]), select, textarea');
  const checkboxes = form.querySelectorAll('input[type=checkbox]');

  // Load saved data
  let savedData = {};
  try {
    savedData = JSON.parse(localStorage.getItem('csw_form_data')) || {};
  } catch (e) {
    savedData = {};
  }

  // Populate fields
  fields.forEach(field => {
    const key = field.name || field.id;
    if (key && savedData[key]) {
      field.value = savedData[key];
    }
  });

  checkboxes.forEach(cb => {
    const key = cb.name || cb.id;
    if (key && savedData[key]) {
      cb.checked = true;
    }
  });

  // Save on change
  function saveFormData() {
    const data = {};
    fields.forEach(field => {
      const key = field.name || field.id;
      if (key && field.value) {
        data[key] = field.value;
      }
    });
    checkboxes.forEach(cb => {
      const key = cb.name || cb.id;
      if (key) {
        data[key] = cb.checked;
      }
    });
    localStorage.setItem('csw_form_data', JSON.stringify(data));
  }

  fields.forEach(field => {
    field.addEventListener('blur', saveFormData);
    field.addEventListener('change', saveFormData);
  });

  checkboxes.forEach(cb => {
    cb.addEventListener('change', saveFormData);
  });

  // ===================================
  // File Upload
  // ===================================
  const fileInput = document.querySelector('#file-upload');
  const fileNameDisplay = document.querySelector('.file-upload-name');
  const fileLabel = document.querySelector('.file-upload-label');

  if (fileInput && fileLabel) {
    fileLabel.addEventListener('click', function() {
      fileInput.click();
    });

    fileInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const fileName = this.files[0].name;
        if (fileNameDisplay) {
          fileNameDisplay.textContent = `Selected: ${fileName}`;
          fileNameDisplay.style.display = 'block';
        }
      }
    });
  }

  // ===================================
  // Form Submit via Formsubmit.co AJAX
  // ===================================
  form.addEventListener('submit', function(e) {
    e.preventDefault(); // Stop default form redirect
    
    // Change button text to indicate loading
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
    }

    const formData = new FormData(form);

    fetch("https://formsubmit.co/ajax/mmcgowan1@outlook.com", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Clear saved data on successful submit
        localStorage.removeItem('csw_form_data');
        localStorage.removeItem('csw_current_step');
        
        // Hide the form and show success message
        form.style.display = 'none';
        const successMsg = document.querySelector('.multistep-success');
        if(successMsg) successMsg.classList.add('active');
        
        // Scroll to success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(error => {
        const errorMsg = document.querySelector('.form-error');
        if(errorMsg) errorMsg.classList.add('active');
        if (submitBtn) {
            submitBtn.textContent = 'Submit Application';
            submitBtn.disabled = false;
        }
    });
  });

  // ===================================
  // Initialize
  // ===================================
  // Restore step if saved
  const savedStep = parseInt(localStorage.getItem('csw_current_step') || '0');
  showStep(savedStep);
});
