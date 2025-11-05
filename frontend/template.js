// Template inheritance system for consistent UI
class PageTemplate {
    static init(pageTitle, activePage) {
        this.createHeader();
        this.createSidebar(activePage);
        this.updateTitle(pageTitle);
        this.initAuth();
    }

    static createHeader() {
        const header = document.querySelector('header') || document.createElement('header');
        header.innerHTML = `
            <h1>🏥 MediTrack Hospital System</h1>
            <div class="user-info">
                <span id="userRole">Loading...</span> | 
                <button onclick="logout()" class="btn-logout">Logout</button>
            </div>
        `;
        if (!document.querySelector('header')) {
            document.body.insertBefore(header, document.body.firstChild);
        }
    }

    static createSidebar(activePage) {
        const sidebar = document.querySelector('.sidebar') || document.createElement('nav');
        sidebar.className = 'sidebar';
        
        const menuItems = [
            { id: 'dashboard', icon: '📊', label: 'Dashboard', href: 'dashboard.html' },
            { id: 'patients', icon: '👥', label: 'Patients', href: 'patients.html' },
            { id: 'vitals', icon: '💓', label: 'Vitals', href: 'vitals.html' },
            { id: 'medications', icon: '💊', label: 'Medications', href: 'medications.html' },
            { id: 'billing', icon: '💰', label: 'Billing', href: 'billing.html' },
            { id: 'reports', icon: '📋', label: 'Reports', href: 'reports.html' },
            { id: 'admin', icon: '⚙️', label: 'Admin', href: 'admin.html' },
            { id: 'about', icon: '📝', label: 'About', href: 'about.html' }
        ];

        const menuHTML = menuItems.map(item => 
            `<li><a href="${item.href}" ${item.id === activePage ? 'class="active"' : ''}>${item.icon} ${item.label}</a></li>`
        ).join('');

        sidebar.innerHTML = `<ul>${menuHTML}</ul>`;
        
        if (!document.querySelector('.sidebar')) {
            const container = document.querySelector('.container');
            if (container) {
                container.insertBefore(sidebar, container.querySelector('main'));
            }
        }
    }

    static updateTitle(pageTitle) {
        document.title = `${pageTitle} - MediTrack`;
        const mainHeading = document.querySelector('main h2');
        if (mainHeading) {
            mainHeading.textContent = pageTitle;
        }
    }

    static initAuth() {
        // Initialize authentication and role-based navigation
        if (typeof updateUserInfo === 'function') {
            updateUserInfo();
        }
        if (typeof updateNavigation === 'function') {
            updateNavigation();
        }
    }
}

// Auto-initialize template when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get page info from meta tags or URL
    const pageName = document.querySelector('meta[name="page"]')?.content || 
                    window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    const pageTitle = document.querySelector('meta[name="page-title"]')?.content || 
                     pageName.charAt(0).toUpperCase() + pageName.slice(1);
    
    PageTemplate.init(pageTitle, pageName);
});