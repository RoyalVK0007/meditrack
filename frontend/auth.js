// Authentication utilities
function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !userRole) {
        window.location.href = 'login.html';
        return false;
    }
    
    return { token, userRole };
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

function updateUserInfo() {
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');
    
    if (userName && userRole) {
        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = `${userName} (${userRole.charAt(0).toUpperCase() + userRole.slice(1)})`;
        }
    }
}

function restrictAccess(allowedRoles) {
    const userRole = localStorage.getItem('userRole');
    
    if (!allowedRoles.includes(userRole)) {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
                <h2>🚫 Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                <p>Your role: <strong>${userRole}</strong></p>
                <p>Required roles: <strong>${allowedRoles.join(', ')}</strong></p>
                <button onclick="window.location.href='dashboard.html'" style="padding: 10px 20px; margin-top: 20px;">Go to Dashboard</button>
            </div>
        `;
        return false;
    }
    
    return true;
}

// Role-based navigation
function updateNavigation() {
    const userRole = localStorage.getItem('userRole');
    const sidebar = document.querySelector('.sidebar ul');
    
    if (!sidebar || !userRole) return;
    
    // Define role permissions
    const rolePermissions = {
        admin: ['dashboard', 'patients', 'vitals', 'medications', 'billing', 'reports', 'admin', 'about'],
        doctor: ['dashboard', 'patients', 'vitals', 'medications', 'reports', 'about'],
        nurse: ['dashboard', 'patients', 'vitals', 'medications', 'about'],
        receptionist: ['dashboard', 'patients', 'billing', 'about']
    };
    
    const allowedPages = rolePermissions[userRole] || [];
    
    // Hide/show navigation items
    const navItems = sidebar.querySelectorAll('li');
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link) {
            const href = link.getAttribute('href');
            const page = href.replace('.html', '');
            
            if (!allowedPages.includes(page)) {
                item.style.display = 'none';
            }
        }
    });
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth check for login page
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // Check authentication
    const auth = checkAuth();
    if (auth) {
        updateUserInfo();
        updateNavigation();
    }
    
    // Add logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
});