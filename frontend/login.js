document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (localStorage.getItem('jwtToken')) {
        const userRole = localStorage.getItem('userRole');
        window.location.href = '/dashboard.html';
        return;
    }
    
    // Add navbar link handlers
    document.querySelector('a[href="#features"]').addEventListener('click', showFeatures);
    document.querySelector('a[href="#about"]').addEventListener('click', showAbout);
    document.querySelector('a[href="#support"]').addEventListener('click', showSupport);
    
    // Add footer link handlers
    document.querySelectorAll('.footer-link').forEach(link => {
        if (link.textContent === 'Privacy Policy') link.addEventListener('click', showPrivacyPolicy);
        if (link.textContent === 'Terms of Service') link.addEventListener('click', showTermsOfService);
        if (link.textContent === 'Contact Support') link.addEventListener('click', showSupport);
    });

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const submitBtn = document.querySelector('.login-btn');
        setButtonLoading(submitBtn, true);
        
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
                showSuccess('Login successful! Redirecting...');
                
                if (result.requiresSetup) {
                    // Store username for setup process
                    localStorage.setItem('setupUsername', result.username);
                    
                    setTimeout(() => {
                        window.location.href = '/first-time-setup.html';
                    }, 1500);
                } else if (result.requiresOtp) {
                    // Store temporary user data for OTP verification
                    localStorage.setItem('tempUserId', result.user_id);
                    localStorage.setItem('tempFirstLogin', result.isFirstLogin);
                    
                    // Add transition effect before redirect
                    transitionToOTP();
                    
                    setTimeout(() => {
                        window.location.href = `/otp-verification.html?user_id=${result.user_id}&first_login=${result.isFirstLogin}`;
                    }, 1500);
                } else {
                    // Direct login (shouldn't happen with new flow)
                    localStorage.setItem('jwtToken', result.token);
                    localStorage.setItem('userRole', result.user.role);
                    localStorage.setItem('userName', result.user.full_name);
                    
                    setTimeout(() => {
                        window.location.href = '/dashboard.html';
                    }, 1500);
                }
            } else {
                setButtonLoading(submitBtn, false);
                showError(result.error || 'Invalid username or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setButtonLoading(submitBtn, false);
            showError('Connection error. Please check your internet connection and try again.');
        }
    });
});

function showError(message) {
    // Remove existing messages
    const existingError = document.querySelector('.error-message');
    const existingSuccess = document.querySelector('.success-message');
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();
    
    // Create new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(errorDiv, form.firstChild);
    
    // Add shake effect to form inputs
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.add('error');
        setTimeout(() => input.classList.remove('error'), 500);
    });
    
    // Remove error after 5 seconds with fade out
    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 500);
    }, 5000);
}

function showSuccess(message) {
    // Remove existing messages
    const existingError = document.querySelector('.error-message');
    const existingSuccess = document.querySelector('.success-message');
    if (existingError) existingError.remove();
    if (existingSuccess) existingSuccess.remove();
    
    // Create new success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    const form = document.getElementById('loginForm');
    form.insertBefore(successDiv, form.firstChild);
    
    // Add success effect to form inputs
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.classList.add('success');
        setTimeout(() => input.classList.remove('success'), 2000);
    });
    
    // Remove success message after 3 seconds
    setTimeout(() => {
        successDiv.classList.add('fade-out');
        setTimeout(() => successDiv.remove(), 500);
    }, 3000);
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.classList.add('btn-loading');
        button.disabled = true;
    } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}

function transitionToOTP() {
    const loginSection = document.querySelector('.login-form-section');
    loginSection.classList.add('slide-out');
    
    setTimeout(() => {
        // Here you would typically redirect to OTP page
        // For demo, we'll show a success message
        showSuccess('Redirecting to OTP verification...');
    }, 600);
}

function showFeatures(e) {
    e.preventDefault();
    showModal('Features', `
        <h3>🚀 V1.0 Beta Features</h3>
        <div style="display: grid; gap: 1rem; margin-top: 1rem;">
            <div><strong>👥 Patient Management</strong><br>Complete patient registration, profiles, search, and audit logging</div>
            <div><strong>💓 Vitals Tracking</strong><br>Record patient vitals with interactive Chart.js visualizations</div>
            <div><strong>💊 Medication Management</strong><br>Medicine inventory tracking and prescription management</div>
            <div><strong>💰 Billing System</strong><br>Professional PDF invoice generation with payment tracking</div>
            <div><strong>📊 Dashboard & Analytics</strong><br>Real-time hospital statistics and interactive charts</div>
            <div><strong>⚙️ Administration</strong><br>User management, seed data, and system monitoring</div>
            <div><strong>🔒 Security & Audit</strong><br>HTTPS encryption, comprehensive audit logging, role-based access</div>
        </div>
    `);
}

function showAbout(e) {
    e.preventDefault();
    showModal('About MediTrack', `
        <h3>🏥 MediTrack Hospital Management System v1.0 Beta</h3>
        <p>A comprehensive, offline-first hospital management system designed for healthcare facilities to manage patient records, vitals tracking, medications, billing, and administrative operations.</p>
        
        <h4>🛠️ Technology Stack</h4>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li><strong>Frontend:</strong> HTML5, CSS3, JavaScript, Chart.js</li>
            <li><strong>Backend:</strong> Node.js 18+, MySQL2, PDFKit, XLSX</li>
            <li><strong>Database:</strong> MySQL 8.0+ with comprehensive schema</li>
            <li><strong>Security:</strong> HTTPS, JWT authentication, data validation</li>
        </ul>
        
        <h4>🎯 Perfect for:</h4>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>Small to Medium Hospitals</li>
            <li>Clinics and Emergency Centers</li>
            <li>Rural Healthcare facilities</li>
            <li>Healthcare training institutes</li>
        </ul>
        
        <p style="margin-top: 1.5rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <strong>Made with ❤️ for the healthcare community</strong>
        </p>
    `);
}

function showSupport(e) {
    e.preventDefault();
    showModal('Support & Contact', `
        <h3>📞 Get Help & Support</h3>
        
        <div style="display: grid; gap: 1.5rem; margin-top: 1rem;">
            <div style="padding: 1rem; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h4>📧 Email Support</h4>
                <p>support@meditrack.com<br>
                <small>Response time: 24-48 hours</small></p>
            </div>
            
            <div style="padding: 1rem; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4>📞 Phone Support</h4>
                <p>+1-800-MEDITRACK<br>
                <small>Mon-Fri: 9 AM - 6 PM EST</small></p>
            </div>
            
            <div style="padding: 1rem; background: #fefce8; border-radius: 8px; border-left: 4px solid #eab308;">
                <h4>🌐 Online Resources</h4>
                <p>Documentation: www.meditrack.com/docs<br>
                FAQ: www.meditrack.com/faq<br>
                Video Tutorials: www.meditrack.com/tutorials</p>
            </div>
            
            <div style="padding: 1rem; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h4>🚨 Emergency Support</h4>
                <p>For critical system issues:<br>
                emergency@meditrack.com<br>
                <small>24/7 emergency hotline available</small></p>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 8px;">
            <p><strong>Demo System:</strong> This is a demonstration version.<br>
            For production deployment, please contact our sales team.</p>
        </div>
    `);
}

function showModal(title, content) {
    const existingModal = document.querySelector('.info-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'info-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <span class="close" onclick="this.closest('.info-modal').remove()">&times;</span>
            <h2 style="margin-bottom: 1.5rem; color: var(--primary-color);">${title}</h2>
            <div>${content}</div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + '-toggle-icon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

function showPrivacyPolicy(e) {
    e.preventDefault();
    showModal('Privacy Policy', `
        <h3>🔒 Privacy Policy</h3>
        <p><strong>Last updated:</strong> December 2024</p>
        
        <h4>Information We Collect</h4>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>User account information (name, email, role)</li>
            <li>Patient medical records and data</li>
            <li>System usage logs and audit trails</li>
            <li>Technical data for system performance</li>
        </ul>
        
        <h4>How We Use Information</h4>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>Provide hospital management services</li>
            <li>Maintain system security and integrity</li>
            <li>Generate reports and analytics</li>
            <li>Comply with healthcare regulations</li>
        </ul>
        
        <h4>Data Security</h4>
        <p>We implement industry-standard security measures including:</p>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>HTTPS encryption for all data transmission</li>
            <li>Secure local database storage</li>
            <li>Role-based access controls</li>
            <li>Comprehensive audit logging</li>
        </ul>
        
        <div style="background: #fef2f2; padding: 1rem; border-radius: 8px; border-left: 4px solid #ef4444; margin-top: 1.5rem;">
            <p><strong>Important:</strong> This is a demo system. Do not enter real patient data.</p>
        </div>
    `);
}

function showTermsOfService(e) {
    e.preventDefault();
    showModal('Terms of Service', `
        <h3>📋 Terms of Service</h3>
        <p><strong>Last updated:</strong> December 2024</p>
        
        <h4>Acceptance of Terms</h4>
        <p>By using MediTrack, you agree to these terms and conditions.</p>
        
        <h4>Permitted Use</h4>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>Educational and demonstration purposes</li>
            <li>Healthcare facility evaluation</li>
            <li>Software development and testing</li>
            <li>Training and learning activities</li>
        </ul>
        
        <h4>Prohibited Activities</h4>
        <ul style="margin: 1rem 0; padding-left: 1.5rem;">
            <li>Entering real patient medical data</li>
            <li>Using for actual medical treatment</li>
            <li>Attempting to breach system security</li>
            <li>Redistributing without permission</li>
        </ul>
        
        <h4>Disclaimer</h4>
        <p>This software is provided "as is" for demonstration purposes only. Not intended for production medical use without proper validation and compliance review.</p>
        
        <h4>Support</h4>
        <p>For questions about these terms, contact: <strong>legal**@meditrack.com</strong></p>
        
        <div style="background: #fefce8; padding: 1rem; border-radius: 8px; border-left: 4px solid #eab308; margin-top: 1.5rem;">
            <p><strong>Demo Version:</strong> These terms apply to the demonstration version only.</p>
        </div>
    `);
}

function showForgotPasswordModal(e) {
    e.preventDefault();
    document.getElementById('forgotPasswordModal').style.display = 'block';
    
    // Add form handler if not already added
    const form = document.getElementById('forgotPasswordForm');
    if (!form.hasAttribute('data-handler-added')) {
        form.setAttribute('data-handler-added', 'true');
        form.addEventListener('submit', handleForgotPassword);
    }
}

function closeForgotPasswordModal() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
    document.getElementById('forgotPasswordForm').reset();
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const username = document.getElementById('resetUsername').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    setButtonLoading(submitBtn, true);
    
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Password reset instructions sent! Check your email.');
            closeForgotPasswordModal();
        } else {
            showError(result.error || 'Username not found');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showError('Connection error. Please try again.');
    } finally {
        setButtonLoading(submitBtn, false);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('forgotPasswordModal');
    if (event.target === modal) {
        closeForgotPasswordModal();
    }
}