// Template inheritance system for consistent UI
class PageTemplate {
    static init(pageTitle, activePage) {
        this.setupLayout();
        this.createSidebar(activePage);
        this.createHeader(pageTitle);
        this.createFooter();
        this.initAuth();
    }

    static setupLayout() {
        // Check if container already exists (avoid duplicate setup)
        if (document.querySelector('.app-container')) {
            return;
        }
        
        // Create app-container and preserve existing content
        const container = document.createElement('div');
        container.className = 'app-container';
        
        // Find existing container or main content
        const existingContainer = document.querySelector('.container');
        if (existingContainer) {
            // Wrap existing container
            existingContainer.parentNode.insertBefore(container, existingContainer);
            container.appendChild(existingContainer);
        }
    }

    static createHeader(pageTitle) {
        const header = document.createElement('header');
        header.className = 'app-header';
        header.innerHTML = `
            <div class="header-left">
                <button class="mobile-menu-btn" onclick="toggleSidebar()" title="Toggle Menu">
                    <span class="hamburger">☰</span>
                </button>
                <h1 class="header-title">
                    <img src="logo.jpg" alt="MediTrack Logo" class="title-icon" style="width: 28px; height: 28px; object-fit: contain;">
                    ${pageTitle}
                </h1>
            </div>
            <div class="header-right">
                <div class="header-actions">
                    <button class="header-btn" onclick="showNotifications()" title="Notifications">
                        <span class="notification-icon">🔔</span>
                        <span class="notification-badge">3</span>
                    </button>
                </div>
                <div class="user-profile">
                    <div class="user-info">
                        <span id="userNameDisplay" class="user-name">Loading...</span>
                        <span id="userRoleDisplay" class="user-role">User</span>
                    </div>
                    <div class="user-avatar" onclick="toggleUserMenu()" title="User Menu">
                        <span id="userInitials">U</span>
                        <div class="user-status online"></div>
                    </div>
                    <div class="user-dropdown" id="userDropdown">
                        <a href="profile.html" class="dropdown-item">
                            <span class="dropdown-icon">👤</span> Profile
                        </a>
                        <a href="#" onclick="showSettings()" class="dropdown-item">
                            <span class="dropdown-icon">⚙️</span> Settings
                        </a>
                        <div class="dropdown-divider"></div>
                        <a href="#" onclick="logout()" class="dropdown-item logout">
                            <span class="dropdown-icon">🚪</span> Logout
                        </a>
                    </div>
                </div>
            </div>
        `;

        const container = document.querySelector('.app-container') || document.body;
        const existingContainer = container.querySelector('.container');
        if (existingContainer) {
            container.insertBefore(header, existingContainer);
        } else {
            container.insertBefore(header, container.firstChild);
        }
    }

    static createSidebar(activePage) {
        const sidebar = document.createElement('aside');
        sidebar.className = 'app-sidebar';

        const menuItems = [
            { id: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html', badge: null },
            { id: 'patients', icon: '👥', label: 'Patients', href: 'patients.html', badge: 'new' },
            { id: 'vitals', icon: '💓', label: 'Vitals', href: 'vitals.html', badge: null },
            { id: 'medications', icon: '💊', label: 'Medications', href: 'medications.html', badge: '5' },
            { id: 'billing', icon: '💰', label: 'Billing', href: 'billing.html', badge: null },
            { id: 'reports', icon: '📋', label: 'Reports', href: 'reports.html', badge: null },
            { id: 'profile', icon: '👤', label: 'Profile', href: 'profile.html', badge: null },
            { id: 'admin', icon: '⚙️', label: 'Admin', href: 'admin.html', badge: null }
        ];

        const renderMenuItem = (item) => `
            <a href="${item.href}" class="nav-item ${item.id === activePage ? 'active' : ''}" ${item.id === 'admin' ? 'id="adminLink" style="display: none;"' : ''}>
                <div class="nav-item-content">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                    ${item.badge ? `<span class="nav-badge ${item.badge === 'new' ? 'badge-new' : 'badge-count'}">${item.badge}</span>` : ''}
                </div>
                <div class="nav-item-indicator"></div>
            </a>
        `;

        const sections = {
            main: menuItems.slice(0, 2).map(renderMenuItem).join(''),
            medical: menuItems.slice(2, 6).map(renderMenuItem).join(''),
            account: menuItems.slice(6).map(renderMenuItem).join('')
        };

        sidebar.innerHTML = `
            <div class="sidebar-brand">
                <div class="brand-logo">
                    <img src="logo.jpg" alt="MediTrack Logo" class="brand-icon" style="width: 32px; height: 32px; object-fit: contain;">
                    <div class="brand-text">
                        <span class="brand-name">MediTrack</span>
                        <span class="brand-subtitle">Hospital Management</span>
                    </div>
                </div>
                <button class="sidebar-toggle" onclick="toggleSidebar()" title="Collapse Sidebar">
                    <span>◀</span>
                </button>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <div class="nav-section-title">Main</div>
                    ${sections.main}
                </div>
                <div class="nav-section">
                    <div class="nav-section-title">Medical</div>
                    ${sections.medical}
                </div>
                <div class="nav-section">
                    <div class="nav-section-title">Account</div>
                    ${sections.account}
                </div>
            </nav>
            <div class="sidebar-footer">
                <div class="system-status">
                    <div class="status-indicator online"></div>
                    <span class="status-text">System Online</span>
                </div>
            </div>
        `;
        
        // Add click feedback styles and scripts
        if (!document.querySelector('link[href="click-feedback.css"]')) {
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'click-feedback.css';
            document.head.appendChild(cssLink);
        }
        
        if (!document.querySelector('script[src="click-feedback.js"]')) {
            const script = document.createElement('script');
            script.src = 'click-feedback.js';
            document.head.appendChild(script);
        }

        const container = document.querySelector('.app-container') || document.body;
        container.insertBefore(sidebar, container.firstChild);
    }
    
    static createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'app-footer';
        footer.innerHTML = `
            <div class="footer-content">
                <div class="footer-left">
                    <div class="footer-brand">
                        <img src="logo.jpg" alt="MediTrack Logo" class="footer-logo" style="width: 24px; height: 24px; object-fit: contain;">
                        <div class="footer-info">
                            <span class="footer-title">MediTrack v1.0</span>
                            <span class="footer-subtitle">Hospital Management System</span>
                        </div>
                    </div>
                </div>
                <div class="footer-center">
                    <div class="footer-stats">
                        <div class="stat-item">
                            <span class="stat-value" id="footerPatients">0</span>
                            <span class="stat-label">Patients</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="footerUsers">0</span>
                            <span class="stat-label">Users</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value" id="footerUptime">0d</span>
                            <span class="stat-label">Uptime</span>
                        </div>
                    </div>
                </div>
                <div class="footer-right">
                    <div class="footer-links">
                        <a href="#" onclick="showHelp()" class="footer-link">Help</a>
                        <a href="#" onclick="showSupport()" class="footer-link">Support</a>
                        <a href="#" onclick="showAbout()" class="footer-link">About</a>
                    </div>
                    <div class="footer-copyright">
                        <span>© 2024 MediTrack. Made with ❤️ for healthcare</span>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.app-container') || document.body;
        container.appendChild(footer);
        
        // Update footer stats
        this.updateFooterStats();
    }

    static initAuth() {
        // Initialize authentication and role-based navigation
        this.updateUserInfo();
        if (typeof updateNavigation === 'function') {
            updateNavigation();
        }
        
        // Set system start time if not already set
        if (!localStorage.getItem('systemStartTime')) {
            localStorage.setItem('systemStartTime', Date.now());
        }
        
        // Update footer stats
        this.updateFooterStats();
    }
    
    static updateUserInfo() {
        const userName = localStorage.getItem('userName') || 'User';
        const userRole = localStorage.getItem('userRole') || 'Staff';
        
        const userNameDisplay = document.getElementById('userNameDisplay');
        const userRoleDisplay = document.getElementById('userRoleDisplay');
        const userInitials = document.getElementById('userInitials');
        
        if (userNameDisplay) userNameDisplay.textContent = userName;
        if (userRoleDisplay) userRoleDisplay.textContent = userRole.charAt(0).toUpperCase() + userRole.slice(1);
        if (userInitials) userInitials.textContent = userName.charAt(0).toUpperCase();
    }
    
    static async updateFooterStats() {
        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) return;
            
            // Fetch patients count
            const patientsResponse = await fetch('/api/patients', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (patientsResponse.ok) {
                const patients = await patientsResponse.json();
                const footerPatients = document.getElementById('footerPatients');
                if (footerPatients) footerPatients.textContent = patients.length;
            }
            
            // Fetch users count (admin only)
            try {
                const usersResponse = await fetch('/api/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    const footerUsers = document.getElementById('footerUsers');
                    if (footerUsers) footerUsers.textContent = users.length;
                }
            } catch (e) {
                // User doesn't have admin access, keep default
            }
            
            // Calculate uptime
            const footerUptime = document.getElementById('footerUptime');
            if (footerUptime) {
                const startTime = localStorage.getItem('systemStartTime') || Date.now();
                const uptime = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24));
                footerUptime.textContent = `${uptime}d`;
            }
        } catch (error) {
            console.error('Error updating footer stats:', error);
        }
    }
}

// Auto-initialize template when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get page info from meta tags or URL
    const pageName = document.querySelector('meta[name="page"]')?.content ||
        window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const pageTitle = document.querySelector('meta[name="page-title"]')?.content ||
        pageName.charAt(0).toUpperCase() + pageName.slice(1);

    PageTemplate.init(pageTitle, pageName);
});

// Global functions for navbar interactions
function toggleSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    const container = document.querySelector('.app-container');
    sidebar.classList.toggle('collapsed');
    container.classList.toggle('sidebar-collapsed');
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
}

function showNotifications() {
    // Get recent audit logs from localStorage
    const patientAudit = JSON.parse(localStorage.getItem('auditLog') || '[]');
    const billAudit = JSON.parse(localStorage.getItem('billAuditLog') || '[]');
    
    // Combine and sort all audit logs by timestamp
    const allAudits = [...patientAudit, ...billAudit]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
    
    if (allAudits.length === 0) {
        alert('Notifications:\n• No recent activity');
        return;
    }
    
    // Format notifications
    let notifications = 'Recent Activity:\n';
    allAudits.forEach((audit, index) => {
        const time = new Date(audit.timestamp).toLocaleTimeString();
        if (audit.patientName) {
            notifications += `• ${audit.patientName} was ${audit.action} (${time})\n`;
        } else if (audit.billId) {
            notifications += `• Bill #${audit.billId} was ${audit.action} (${time})\n`;
        }
    });
    
    alert(notifications);
}

function showQuickActions() {
    const actions = [
        'Add New Patient',
        'Record Vitals',
        'Generate Report',
        'Emergency Alert'
    ];
    const action = prompt('Quick Actions:\n' + actions.map((a, i) => `${i+1}. ${a}`).join('\n') + '\n\nEnter number:');
    if (action) {
        alert(`Executing: ${actions[parseInt(action)-1] || 'Invalid action'}`);
    }
}

function showSettings() {
    alert('Settings panel coming soon!');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

function showHelp() {
    alert('Help:\n• Use the sidebar to navigate\n• Click user avatar for profile\n• Emergency: Call 911\n• Support: help@meditrack.com');
}

function showSupport() {
    alert('Support Contact:\n📧 support@meditrack.com\n📞 +1-800-MEDITRACK\n🌐 www.meditrack.com/support');
}

function showAbout() {
    alert('MediTrack v1.0\n\nHospital Management System\nBuilt with Node.js & MySQL\n\n© 2024 MediTrack Solutions\nMade with ❤️ for healthcare professionals');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.user-profile')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('show');
    }
});

// Update footer stats periodically
setInterval(() => {
    if (typeof PageTemplate !== 'undefined') {
        PageTemplate.updateFooterStats();
    }
}, 30000); // Update every 30 seconds