/**
 * Wentoura Holidays - Enquiry Form Handler
 * WhatsApp-only integration (no email)
 */

// WhatsApp Configuration
const WHATSAPP_NUMBERS = {
    primary: '919995668737',    // Format: country code + number (no +, spaces, or dashes)
    secondary: ''
};

// Initialize when document is ready
$(document).ready(function() {
    // Initialize datepickers for modal
    $('#enquiryModal .checkin_date, #enquiryModal .checkout_date').datepicker({
        format: 'mm/dd/yyyy',
        autoclose: true,
        startDate: new Date()
    });
    
    // Capture Form Submission
    $('#enquiryForm').on('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            destination: $('#enquiryDestination').val(),
            checkinDate: $('#checkinDate').val(),
            checkoutDate: $('#checkoutDate').val(),
            // priceLimit removed per request
            travelers: $('#travelers').val(),
            name: $('#name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            message: $('#message').val() || 'No additional requirements'
        };
        
        console.log('Form data collected:', formData);
        
        // Validate form
        if (!validateForm(formData)) {
            return;
        }
        
        // Show loading state
        const submitBtn = $('#submitEnquiryBtn');
        submitBtn.prop('disabled', true);
        submitBtn.find('.btn-text').hide();
        submitBtn.find('.btn-loading').show();
        
        // Simulate brief processing delay
        setTimeout(function() {
            console.log('Form submitted with data:', formData);
            
            // Success - show message
            showSuccessMessage(formData);
            
            // Reset button state
            submitBtn.prop('disabled', false);
            submitBtn.find('.btn-text').show();
            submitBtn.find('.btn-loading').hide();
            
            // Close modal
            $('#enquiryModal').modal('hide');
            
            // Reset form AFTER a delay to ensure data is captured
            setTimeout(function() {
                $('#enquiryForm')[0].reset();
            }, 100);
            
            // Option A: Show modal for user to choose
            showWhatsAppButtons(formData);
            
            // Option B: Auto-send to both numbers (uncomment to use)
            // WentouraWhatsApp.sendToBoth(formData);
            
            // Option C: Auto-send to primary only (uncomment to use)
            // WentouraWhatsApp.sendToPrimary(formData);
        }, 500);
    });
    
    // Reset form when modal is closed
    $('#enquiryModal').on('hidden.bs.modal', function() {
        $('#enquiryForm')[0].reset();
        $('#submitEnquiryBtn').prop('disabled', false);
        $('#submitEnquiryBtn .btn-text').show();
        $('#submitEnquiryBtn .btn-loading').hide();
    });
});

/**
 * Validate form data
 */
function validateForm(formData) {
    if (!formData.destination) {
        alert('Please select a destination');
        return false;
    }
    if (!formData.checkinDate) {
        WentouraUI.showAlert('Please select check-in date', 'error');
        return false;
    }
    if (!formData.checkoutDate) {
        WentouraUI.showAlert('Please select check-out date', 'error');
        return false;
    }
    if (!formData.name || formData.name.trim().length < 2) {
        WentouraUI.showAlert('Please enter your name', 'error');
        return false;
    }
    if (!formData.email || !isValidEmail(formData.email)) {
        WentouraUI.showAlert('Please enter a valid email address', 'error');
        return false;
    }
    if (!formData.phone || formData.phone.trim().length < 10) {
        WentouraUI.showAlert('Please enter a valid phone number', 'error');
        return false;
    }
    return true;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}



/**
 * Show success message
 */
function showSuccessMessage(formData) {
    const message = 'Thank you — we received your enquiry for ' + formData.destination + '.\n\n' +
        'Please use the WhatsApp option to complete sending your enquiry, or contact us at +91 9995668737.';
    WentouraUI.showAlert(message, 'success', 6000);
}