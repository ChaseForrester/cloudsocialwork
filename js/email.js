/* ===================================
   Cloud Social Work - Email Integration
   Using EmailJS (https://www.emailjs.com)
   =================================== */

/*
 * SETUP INSTRUCTIONS:
 * 1. Go to https://www.emailjs.com and create a free account
 * 2. Add an Email Service (Outlook/Gmail/etc)
 * 3. Create Email Templates for each form type
 * 4. Replace the placeholder values below with your actual IDs
 *
 * SERVICE_ID:   Your EmailJS service ID (e.g., 'service_abc123')
 * TEMPLATE_IDS: Your EmailJS template IDs for each form
 * PUBLIC_KEY:    Your EmailJS public key (e.g., 'user_xyz789')
 */

const EMAIL_CONFIG = {
  // The email address where all forms will be sent.
  // Note: FormSubmit.co requires you to click an "Activate" link in your email 
  // the very first time you submit a form.
  RECIPIENT_EMAIL: 'mmcgowan1@outlook.com'
};

/**
 * No initialization needed for FormSubmit
 */
function initEmailJS() {
  console.log('Using FormSubmit.co for email processing.');
}

/**
 * Send email via FormSubmit AJAX
 * @param {string} templateType - 'contact', 'enquiry', or 'booking'
 * @param {Object} templateParams - Key-value pairs for the email template
 * @returns {Promise}
 */
function sendEmail(templateType, templateParams) {
  // Send the email via FormSubmit.co AJAX API
  return fetch(`https://formsubmit.co/ajax/${EMAIL_CONFIG.RECIPIENT_EMAIL}`, {
    method: "POST",
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        _subject: `New ${templateType} submission from website`,
        ...templateParams
    })
  }).then(res => {
      if (!res.ok) {
          throw new Error("Failed to send email");
      }
      return res.json();
  });
}

/**
 * Fallback email method using mailto:
 */
function fallbackMailto(templateType, params) {
  const subject = encodeURIComponent(`Website ${templateType} Form Submission`);
  let body = '';

  for (const [key, value] of Object.entries(params)) {
    if (key !== 'to_email' && key !== 'reply_to' && value) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      body += `${label}: ${value}\n`;
    }
  }

  body = encodeURIComponent(body);
  window.location.href = `mailto:${EMAIL_CONFIG.RECIPIENT_EMAIL}?subject=${subject}&body=${body}`;

  return Promise.resolve({ status: 200, text: 'Mailto fallback used' });
}

/**
 * Handle contact/FAQ form submission
 */
function handleContactForm(formElement) {
  formElement.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(formElement);
    const params = {};
    formData.forEach((value, key) => {
      params[key.replace(/-/g, '_').toLowerCase()] = value;
    });

    const submitBtn = formElement.querySelector('[type="submit"]');
    const originalText = submitBtn.value || submitBtn.textContent;
    submitBtn.value = 'Sending...';
    submitBtn.disabled = true;

    sendEmail('contact', params)
      .then(function() {
        // Show success
        formElement.style.display = 'none';
        const successMsg = formElement.parentElement.querySelector('.form-success');
        if (successMsg) successMsg.style.display = 'block';
      })
      .catch(function(error) {
        console.error('Email send failed:', error);
        const errorMsg = formElement.parentElement.querySelector('.form-error');
        if (errorMsg) errorMsg.style.display = 'block';
      })
      .finally(function() {
        submitBtn.value = originalText;
        submitBtn.disabled = false;
      });
  });
}

/**
 * Handle enquiry form submission (About page)
 */
function handleEnquiryForm(formElement) {
  formElement.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(formElement);
    const params = {};
    formData.forEach((value, key) => {
      params[key.replace(/-/g, '_').toLowerCase()] = value;
    });

    const submitBtn = formElement.querySelector('[type="submit"]');
    const originalText = submitBtn.value || submitBtn.textContent;
    submitBtn.value = 'Sending...';
    submitBtn.disabled = true;

    sendEmail('enquiry', params)
      .then(function() {
        formElement.style.display = 'none';
        const successMsg = formElement.parentElement.querySelector('.form-success');
        if (successMsg) successMsg.style.display = 'block';
      })
      .catch(function(error) {
        console.error('Email send failed:', error);
        const errorMsg = formElement.parentElement.querySelector('.form-error');
        if (errorMsg) errorMsg.style.display = 'block';
      })
      .finally(function() {
        submitBtn.value = originalText;
        submitBtn.disabled = false;
      });
  });
}

/**
 * Handle booking form submission (Book In page)
 */
function handleBookingForm(formElement) {
  formElement.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(formElement);
    const params = {};
    formData.forEach((value, key) => {
      if (key !== 'Files-or-Documents') {
        params[key.replace(/-/g, '_').toLowerCase()] = value;
      }
    });

    // Collect checkbox values
    const checkboxes = formElement.querySelectorAll('input[type="checkbox"]:checked');
    const checkedValues = [];
    checkboxes.forEach(cb => checkedValues.push(cb.name));
    if (checkedValues.length > 0) {
      params.contact_types = checkedValues.join(', ');
    }

    const submitBtn = formElement.querySelector('[type="submit"]');
    const originalText = submitBtn.value || submitBtn.textContent;
    submitBtn.value = 'Sending...';
    submitBtn.disabled = true;

    sendEmail('booking', params)
      .then(function() {
        formElement.style.display = 'none';
        const successMsg = formElement.parentElement.querySelector('.multistep-success');
        if (successMsg) successMsg.style.display = 'block';
      })
      .catch(function(error) {
        console.error('Email send failed:', error);
        const errorMsg = formElement.parentElement.querySelector('.form-error');
        if (errorMsg) errorMsg.style.display = 'block';
      })
      .finally(function() {
        submitBtn.value = originalText;
        submitBtn.disabled = false;
      });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  initEmailJS();

  // Auto-attach to forms
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) handleContactForm(contactForm);

  const enquiryForm = document.querySelector('#enquiry-form');
  if (enquiryForm) handleEnquiryForm(enquiryForm);

  const bookingForm = document.querySelector('#booking-form');
  if (bookingForm) handleBookingForm(bookingForm);
});
