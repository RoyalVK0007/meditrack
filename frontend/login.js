document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (localStorage.getItem('jwtToken')) {
        const userRole = localStorage.getItem('userRole');
        const dashboards = {
            admin: '/admin-dashboard.html',
            doctor: '/doctor-dashboard.html',
            nurse: '/nurse-dashboard.html',
            receptionist: '/receptionist-dashboard.html'
        };
        window.location.href = dashboards[userRole] || '/dashboard.html';
        return;
    }

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Store JWT token and user info
                localStorage.setItem('jwtToken', result.token);
                localStorage.setItem('userRole', result.user.role);
                localStorage.setItem('userName', result.user.full_name);
                
                // Redirect to role-specific dashboard
                const dashboards = {
                    admin: '/admin-dashboard.html',
                    doctor: '/doctor-dashboard.html',
                    nurse: '/nurse-dashboard.html',
                    receptionist: '/receptionist-dashboard.html'
                };
                
                window.location.href = dashboards[result.user.role];
            } else {
                showError(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
        }
    });
});

function showError(message) {
    // Remove existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Remove error after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}