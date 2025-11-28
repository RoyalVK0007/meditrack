// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadUserProfile();
    setupForms();
});

async function loadUserProfile() {
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            populateProfile(user);
        } else {
            showToast('Failed to load profile', 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error loading profile', 'error');
    }
}

function populateProfile(user) {
    document.getElementById('displayName').textContent = user.full_name;
    document.getElementById('displayRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    document.getElementById('userInitials').textContent = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    document.getElementById('fullName').value = user.full_name;
    document.getElementById('email').value = user.email;
    document.getElementById('username').value = user.username;
    document.getElementById('role').value = user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

function setupForms() {
    // Profile update form
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateProfile();
    });
    
    // Password change form
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });
}

async function updateProfile() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    
    if (!fullName || !email) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ full_name: fullName, email })
        });
        
        if (response.ok) {
            showToast('Profile updated successfully', 'success');
            // Update localStorage if name changed
            localStorage.setItem('userName', fullName);
            // Refresh profile display
            loadUserProfile();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast('Error updating profile', 'error');
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Please fill all password fields', 'error');
        return;
    }
    
    // Validate password
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{4,}$/;
    if (!passwordRegex.test(newPassword)) {
        showToast('Password must contain A-Z, 0-9, minimum 4 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (response.ok) {
            showToast('Password changed successfully', 'success');
            // Clear password fields
            document.getElementById('passwordForm').reset();
        } else {
            const error = await response.json();
            showToast(error.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showToast('Error changing password', 'error');
    }
}