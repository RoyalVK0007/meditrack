// Common functions shared across all pages

function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

async function handleApiError(response, fallbackMessage = 'Something went wrong') {
    let errorMessage = fallbackMessage;
    try {
        const data = await response.json();
        if (data?.error) {
            errorMessage = data.error;
        }
    } catch (error) {
        console.warn('Unable to parse error response', error);
    }
    showAlert(errorMessage, 'error');
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Base styles
    let backgroundColor, textColor, borderColor;
    switch(type) {
        case 'success':
            backgroundColor = '#10b981';
            textColor = 'white';
            borderColor = '#059669';
            break;
        case 'error':
            backgroundColor = '#ef4444';
            textColor = 'white';
            borderColor = '#dc2626';
            break;
        case 'warning':
            backgroundColor = '#f59e0b';
            textColor = 'white';
            borderColor = '#d97706';
            break;
        case 'info':
            backgroundColor = '#3b82f6';
            textColor = 'white';
            borderColor = '#2563eb';
            break;
        default:
            backgroundColor = '#6b7280';
            textColor = 'white';
            borderColor = '#4b5563';
    }
    
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: 500;
        background-color: ${backgroundColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add CSS animations for alerts
const alertStyle = document.createElement('style');
alertStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(alertStyle);

// Page transition effect
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.app-sidebar a.nav-item');
    if (!links.length) return;
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href && this.href !== window.location.href) {
                e.preventDefault();
                document.body.style.opacity = '0';
                document.body.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    window.location.href = this.href;
                }, 200);
            }
        });
    });
});