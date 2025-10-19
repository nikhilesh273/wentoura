/**
 * WhatsApp Integration Configuration
 * Wentoura Holidays
 * FIXED: Proper encoding without double-encoding
 */

// WhatsApp Configuration Options
const WHATSAPP_OPTIONS = {
    autoOpen: false,
    sendToBothNumbers: false,
    defaultNumber: 'primary',
    
    autoPrompt: true,
    promptDelay: 1500,
    secondNumberDelay: 1000
};

/**
 * Advanced WhatsApp Integration
 */
window.WentouraWhatsApp = {
    /**
     * Send to primary number - FIXED VERSION
     */
    sendToPrimary: function(formData) {
        console.log('Sending to WhatsApp with data:', formData);
        const message = this.formatMessage(formData);
        console.log('Formatted message:', message);
        
        // Use web.whatsapp.com with proper encoding
        const link = 'https://web.whatsapp.com/send?phone=' + WHATSAPP_NUMBERS.primary + '&text=' + encodeURIComponent(message);
        console.log('WhatsApp link:', link);
        
        window.open(link, '_blank');
    },
    
    /**
     * Send to secondary number
     */
    sendToSecondary: function(formData) {
        if (!WHATSAPP_NUMBERS.secondary) {
            console.log('Secondary WhatsApp number not configured');
            return;
        }
        const message = this.formatMessage(formData);
        const link = 'https://web.whatsapp.com/send?phone=' + WHATSAPP_NUMBERS.secondary + '&text=' + encodeURIComponent(message);
        window.open(link, '_blank');
    },
    
    /**
     * Send to both numbers
     */
    sendToBoth: function(formData) {
        this.sendToPrimary(formData);
        if (WHATSAPP_NUMBERS.secondary) {
            setTimeout(() => {
                this.sendToSecondary(formData);
            }, WHATSAPP_OPTIONS.secondNumberDelay);
        }
    },
    
    /**
     * Format WhatsApp message
     * FIXED: Using \n (newlines) instead of %0a
     * encodeURIComponent will handle the encoding
     */
    formatMessage: function(formData) {
        if (!formData) {
            console.error('No form data provided to formatMessage');
            return 'Error: No form data';
        }
        
        // Clean and format the message using \n for newlines
        const message = 
            '*New Tour Enquiry*\n\n' +
            'Destination: ' + (formData.destination || 'Not specified') + '\n' +
            'Check-in: ' + (formData.checkinDate || 'Not specified') + '\n' +
            'Check-out: ' + (formData.checkoutDate || 'Not specified') + '\n' +
            'Travelers: ' + (formData.travelers || '1') + '\n\n' +
            'Customer Details:\n' +
            'Name: ' + (formData.name || 'Not provided') + '\n' +
            'Email: ' + (formData.email || 'Not provided') + '\n' +
            'Phone: ' + (formData.phone || 'Not provided') + '\n\n' +
            'Additional Requirements:\n' +
            (formData.message || 'None') + '\n\n' +
            'Submitted: ' + new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        
        return message;
    },
    
    /**
     * Get WhatsApp link for sharing
     */
    getLink: function(formData, number) {
        const message = this.formatMessage(formData);
        const phoneNumber = number === 'secondary' ? WHATSAPP_NUMBERS.secondary : WHATSAPP_NUMBERS.primary;
        return 'https://web.whatsapp.com/send?phone=' + phoneNumber + '&text=' + encodeURIComponent(message);
    },
    
    /**
     * Copy WhatsApp link to clipboard
     */
    copyLink: function(formData, number) {
        const link = this.getLink(formData, number);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                WentouraUI.showAlert('WhatsApp link copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Failed to copy:', err);
                this.fallbackCopy(link);
            });
        } else {
            this.fallbackCopy(link);
        }
    },
    
    /**
     * Fallback copy method
     */
    fallbackCopy: function(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            WentouraUI.showAlert('WhatsApp link copied to clipboard!', 'success');
        } catch (err) {
            console.error('Fallback copy failed:', err);
            WentouraUI.showAlert('Failed to copy link. Please copy manually.', 'error');
        }
        document.body.removeChild(textarea);
    }
};

/**
 * Add WhatsApp button to success message
 */
function showWhatsAppButtons(formData) {
    console.log('showWhatsAppButtons called with:', formData);
    
    // Store form data globally for button access
    window.lastEnquiryData = formData;
    
    const modal = `
        <div id="whatsappModal" class="wentoura-whatsapp-modal" role="dialog" aria-modal="true">
            <h3 class="wentoura-modal-title">Send via WhatsApp</h3>
            <p class="wentoura-modal-sub">Send this enquiry via WhatsApp Web to complete your request.</p>
            <button id="whatsappSendBtn" class="btn-wapp-send">Send </button>
            <button id="whatsappSkipBtn" class="btn-wapp-skip">Skip</button>
        </div>
        <div id="whatsappOverlay" class="wentoura-overlay" tabindex="-1"></div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modal);
    
    // Add event listeners
    document.getElementById('whatsappSendBtn').addEventListener('click', function() {
        console.log('Send button clicked, formData:', window.lastEnquiryData);
        WentouraWhatsApp.sendToPrimary(window.lastEnquiryData);
        document.getElementById('whatsappModal').remove();
        document.getElementById('whatsappOverlay').remove();
    });
    
    document.getElementById('whatsappSkipBtn').addEventListener('click', function() {
        document.getElementById('whatsappModal').remove();
        document.getElementById('whatsappOverlay').remove();
    });
    
    document.getElementById('whatsappOverlay').addEventListener('click', function() {
        document.getElementById('whatsappModal').remove();
        document.getElementById('whatsappOverlay').remove();
    });
}

/* UI helpers exposed globally */
window.WentouraUI = window.WentouraUI || {};
window.WentouraUI.showAlert = function(message, type = 'info', timeout = 4000) {
    try {
        const id = 'wentoura-alert-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.className = 'wentoura-alert wentoura-alert-' + type;
        wrapper.innerText = message;
        document.body.appendChild(wrapper);
        // animate in
        setTimeout(() => wrapper.classList.add('visible'), 10);
        // auto remove
        setTimeout(() => {
            wrapper.classList.remove('visible');
            setTimeout(() => wrapper.remove(), 300);
        }, timeout);
    } catch (e) {
        console.error('showAlert failed', e);
        try { alert(message); } catch (err) {}
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WHATSAPP_OPTIONS, WentouraWhatsApp };
}
