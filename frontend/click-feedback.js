// Click feedback functionality
document.addEventListener('DOMContentLoaded', function() {
    addRippleEffect();
    addClickFeedback();
});

function addRippleEffect() {
    const rippleElements = document.querySelectorAll('.btn, button, .nav-item, .user-avatar');
    
    rippleElements.forEach(element => {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function addClickFeedback() {
    // Add loading state to form submissions
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Remove loading state after 3 seconds (fallback)
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
}

// Function to remove loading state
function removeLoadingState(button) {
    if (button) {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Export for use in other scripts
window.removeLoadingState = removeLoadingState;