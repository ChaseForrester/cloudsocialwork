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
  SERVICE_ID: 'YOUR_SERVICE_ID',        // Replace with your EmailJS Service ID
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY',         // Replace with your EmailJS Public Key
  TEMPLATES: {
    contact: 'YOUR_CONTACT_TEMPLATE_ID',  // Template for Contact Us / FAQ forms
    enquiry: 'YOUR_ENQUIRY_TEMPLATE_ID',  // Template for About Us enquiry form
    booking: 'YOUR_BOOKING_TEMPLATE_ID',  // Template for Book In multi-step form
  },
  RECIPIENT_EMAIL: 'mmcgowan1@outlook.com'
};

/**
 * Initialize EmailJS
 * Add this script tag to your HTML: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
 */
function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    console.log('EmailJS initialized successfully');
  } else {
    console.warn('EmailJS library not loaded. Forms will use mailto: fallback.');
  }
}

/**
 * Send email via EmailJS
 * @param {string} templateType - 'contact', 'enquiry', or 'booking'
 * @param {Object} templateParams - Key-value pairs for the email template
 * @returns {Promise}
 */
function sendEmail(templateType, templateParams) {
  // Add recipient email to params
  templateParams.to_email = EMAIL_CONFIG.RECIPIENT_EMAIL;
  templateParams.reply_to = templateParams.email || templateParams.from_email || '';

  if (typeof emailjs !== 'undefined' && EMAIL_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID') {
    return emailjs.send(
      EMAIL_CONFIG.SERVICE_ID,
      EMAIL_CONFIG.TEMPLATES[templateType],
      templateParams
    );
  } else {
    // Fallback: use mailto link
    return fallbackMailto(templateType, templateParams);
  }
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
